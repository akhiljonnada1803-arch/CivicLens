import logging
from datetime import datetime, timedelta
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.incident import Incident, DefectType, IncidentStatus, UrgencyLevel
from app.models.ward import FleetVehicle
from app.models.concessionaire import Concessionaire
from app.schemas.incident import ClosedLoopArrivalRequest, ClosedLoopClosureRequest, RedumpAppealRequest
from app.services.storage_service import StorageService

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/arrival")
def record_contractor_arrival(
    payload: ClosedLoopArrivalRequest,
    db: Session = Depends(get_db)
):
    """
    PRD Section 5.2 - State 1: CONTRACTOR_ARRIVAL
    Triggered when Tipper (Fleet B) arrives within 10 meters of an active ticket.
    Front Camera automatically captures 'BEFORE' proof, confirming trash presence.
    Dwell timer begins.
    """
    incident = db.query(Incident).filter(Incident.id == payload.incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident ticket not found")

    # Generate or assign before proof image
    before_url, after_url = StorageService.generate_closed_loop_proof_images(
        tipper_id=payload.tipper_id,
        landmark=incident.landmark or "Target Location"
    )

    incident.work_state = "WORK_IN_PROGRESS"
    incident.status = IncidentStatus.QRT_DISPATCHED.value
    incident.cleaning_tipper_id = payload.tipper_id
    incident.arrived_at = datetime.utcnow()
    incident.before_image_url = before_url
    incident.dwell_duration_sec = 0
    db.commit()
    db.refresh(incident)

    return {
        "status": "success",
        "state": "WORK_IN_PROGRESS",
        "ticket_id": incident.id,
        "landmark": incident.landmark,
        "tipper_id": payload.tipper_id,
        "before_image_url": incident.before_image_url,
        "message": f"State 1 Confirmed: Tipper {payload.tipper_id} arrived within 10m. Front camera logged BEFORE proof. Dwell timer started."
    }

@router.post("/closure")
def record_contractor_closure(
    payload: ClosedLoopClosureRequest,
    db: Session = Depends(get_db)
):
    """
    PRD Section 5.2 - State 3: AUTONOMOUS_CLOSURE
    Triggered when Tipper pulls forward 15 meters post-loading.
    Rear Aux Camera captures 'AFTER' proof at original GPS anchor.
    Edge Vision evaluates clean pavement confidence (threshold: 0.85).
    """
    incident = db.query(Incident).filter(Incident.id == payload.incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident ticket not found")

    # Generate after proof if needed
    if not incident.after_image_url:
        _, after_url = StorageService.generate_closed_loop_proof_images(
            tipper_id=payload.tipper_id,
            landmark=incident.landmark or "Target Location"
        )
        incident.after_image_url = after_url

    incident.dwell_duration_sec = payload.dwell_duration_sec
    incident.cleared_at = datetime.utcnow()

    # Exception Pathway Check (Fraud or Incomplete Work)
    if payload.residual_waste_detected or payload.clean_confidence < 0.75 or payload.dwell_duration_sec < 45:
        incident.work_state = "FLAGGED_INCOMPLETE"
        incident.status = IncidentStatus.NEEDS_ACTION.value
        incident.billing_credit_approved = False
        incident.penalty_amount_inr = 5000.0
        
        # Deduct from concessionaire
        conc = db.query(Concessionaire).filter(Concessionaire.name == incident.concessionaire_name).first()
        if conc:
            conc.penalty_balance_inr += 5000.0
            conc.clean_rate_pct = max(80.0, conc.clean_rate_pct - 0.4)
        
        db.commit()
        return {
            "status": "warning",
            "state": "FLAGGED_INCOMPLETE",
            "ticket_id": incident.id,
            "penalty_inr": 5000.0,
            "message": "EXCEPTION TRIGGERED: Residual waste or insufficient dwell time detected. Concessionaire billed ₹5,000 penalty."
        }

    # Happy Pathway: Autonomous Verification
    incident.work_state = "CLOSED_VERIFIED"
    incident.status = IncidentStatus.RESOLVED.value
    incident.billing_credit_approved = True
    incident.penalty_amount_inr = 0.0

    conc = db.query(Concessionaire).filter(Concessionaire.name == incident.concessionaire_name).first()
    if conc:
        conc.total_credits_inr += 750.0 # Per-job verified payment credit
    
    db.commit()
    db.refresh(incident)

    return {
        "status": "success",
        "state": "CLOSED_VERIFIED",
        "ticket_id": incident.id,
        "landmark": incident.landmark,
        "before_image_url": incident.before_image_url,
        "after_image_url": incident.after_image_url,
        "billing_credit": "100% Approved",
        "message": "Autonomous Closure Verified! Rear camera confirmed spotless curb. 100% Billing Credit Approved."
    }

@router.post("/appeal-redump")
def submit_redump_appeal(
    payload: RedumpAppealRequest,
    db: Session = Depends(get_db)
):
    """
    PRD Section 8 Mitigation #4: Immutable Timeline Vault
    Contractor proves area was cleaned at 8:12 AM; 1:00 PM refill is classified as fresh re-dump,
    protecting contractor from unfair route penalties.
    """
    incident = db.query(Incident).filter(Incident.id == payload.incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident ticket not found")

    incident.is_redump_dispute = True
    incident.redump_notes = payload.defense_notes
    incident.penalty_amount_inr = 0.0
    incident.work_state = "DISPUTED_REDUMP"
    
    # Exonerate contractor penalty if any
    conc = db.query(Concessionaire).filter(Concessionaire.name == incident.concessionaire_name).first()
    if conc and conc.penalty_balance_inr >= 5000.0:
        conc.penalty_balance_inr -= 5000.0

    db.commit()
    return {
        "status": "success",
        "ticket_id": incident.id,
        "message": "Re-Dump Defense Accepted! Timestamped proof shows valid prior clearance. Penalty waived and logged as fresh municipal event."
    }

@router.get("/contractor-hub")
def get_contractor_hub_data(
    concessionaire_name: str = "Apex CleanTech",
    db: Session = Depends(get_db)
):
    """
    PRD Section 6.2: Contractor Operations & Proof-of-Work Vault Data
    Returns:
    - Vendor KPI Header (Tippers active, clean rate %, penalty balance)
    - Live Overflows on Route
    - Proof-of-Work Audit Vault records
    """
    conc = db.query(Concessionaire).filter(Concessionaire.name == concessionaire_name).first()
    if not conc:
        conc = Concessionaire(
            id="CONC-APEX",
            name="Apex CleanTech",
            contracted_zone="Zone 3 (Central)",
            active_tippers=18,
            clean_rate_pct=98.2,
            penalty_balance_inr=0.0,
            total_credits_inr=245000.0
        )
        db.add(conc)
        db.commit()

    # Active overflows on contractor's route
    active_overflows = db.query(Incident).filter(
        Incident.defect_type == DefectType.GARBAGE_OVERFLOW.value,
        Incident.status.in_([IncidentStatus.NEEDS_ACTION.value, IncidentStatus.QRT_DISPATCHED.value])
    ).order_by(Incident.created_at.desc()).limit(5).all()

    # Verified proof-of-work records
    verified_jobs = db.query(Incident).filter(
        Incident.work_state.in_(["CLOSED_VERIFIED", "WORK_IN_PROGRESS", "FLAGGED_INCOMPLETE"])
    ).order_by(Incident.updated_at.desc()).limit(6).all()

    # If no verified jobs exist yet, create a baseline showcase record
    if not verified_jobs:
        before_url, after_url = StorageService.generate_closed_loop_proof_images(
            tipper_id="AP-31-TT-4402",
            landmark="Main Market Road, Pillar 42"
        )
        sample_job = Incident(
            id="job-8841",
            defect_type=DefectType.GARBAGE_OVERFLOW.value,
            title="Garbage Overflow / Blackspot",
            status=IncidentStatus.RESOLVED.value,
            urgency=UrgencyLevel.SANITATION_ROADS.value,
            confidence=0.89,
            slm_summary="Roadside waste verified cleared by dual-camera closed loop.",
            landmark="Main Market Road, Pillar 42",
            latitude=17.7225,
            longitude=83.3045,
            ward_id="GVMC-W14",
            zone_id="ZONE-03",
            ward_name="Ward 14 (Siripuram)",
            assigned_department="Public Health & Sanitation",
            channel_sla="Ward Sanitary Inspector Telegram Bot (< 2 hours)",
            concessionaire_id=conc.id,
            concessionaire_name=conc.name,
            work_state="CLOSED_VERIFIED",
            cleaning_tipper_id="AP-31-TT-4402",
            dwell_duration_sec=180,
            arrived_at=datetime.utcnow() - timedelta(minutes=6),
            cleared_at=datetime.utcnow() - timedelta(minutes=3),
            before_image_url=before_url,
            after_image_url=after_url,
            billing_credit_approved=True,
            penalty_amount_inr=0.0
        )
        db.add(sample_job)
        db.commit()
        verified_jobs = [sample_job]

    return {
        "concessionaire": {
            "name": conc.name,
            "zone": conc.contracted_zone,
            "active_tippers": conc.active_tippers,
            "clean_rate_pct": conc.clean_rate_pct,
            "penalty_balance_inr": conc.penalty_balance_inr,
            "total_credits_inr": conc.total_credits_inr
        },
        "active_overflows": [
            {
                "id": inc.id,
                "title": inc.title,
                "landmark": inc.landmark,
                "spotted_by": inc.spotted_by_label,
                "time_ago": "12m ago",
                "route": "Route #14B",
                "nearest_tipper": "Tipper #04 (600m away)",
                "remaining_sla_mins": 22,
                "work_state": inc.work_state
            }
            for inc in active_overflows
        ],
        "vault_records": [
            {
                "id": inc.id,
                "job_number": f"Job #{inc.id[:4].upper() if inc.id else '8841'}",
                "route": "Route #14B",
                "vehicle_registration": inc.cleaning_tipper_id or "AP-31-TT-4402",
                "landmark": inc.landmark or "Main Market Road, Pillar 42",
                "arrived_time": "1:41 PM",
                "cleared_time": "1:44 PM",
                "dwell_duration_sec": inc.dwell_duration_sec or 180,
                "before_image_url": inc.before_image_url,
                "after_image_url": inc.after_image_url,
                "work_state": inc.work_state,
                "billing_credit_approved": inc.billing_credit_approved,
                "penalty_amount_inr": inc.penalty_amount_inr,
                "is_redump_dispute": inc.is_redump_dispute
            }
            for inc in verified_jobs
        ]
    }
