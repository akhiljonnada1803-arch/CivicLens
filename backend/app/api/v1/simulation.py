import random
from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db, Base, engine
from app.models.incident import Incident, IncidentSighting, DefectType, IncidentStatus, UrgencyLevel
from app.models.ward import Ward, FleetVehicle
from app.services.geo_service import GeoService
from app.services.dispatch_service import DispatchService
from app.services.storage_service import StorageService
from app.seed_data import seed_initial_data

router = APIRouter()

SAMPLE_INCIDENTS = [
    {
        "defect_type": DefectType.GARBAGE_OVERFLOW.value,
        "title": "Garbage Overflow / Blackspot",
        "landmark": "Main Market Road, Pillar 42",
        "lat": 17.7225,
        "lon": 83.3045,
        "device_id": "DEV-001",
        "vehicle_label": "Sweeper #04",
        "slm_summary": "Significant roadside waste overflow on lane shoulder, partially obstructing footpath.",
        "confidence": 0.88
    },
    {
        "defect_type": DefectType.OPEN_MANHOLE.value,
        "title": "Open Manhole Hazard",
        "landmark": "Station Road Junction",
        "lat": 17.7238,
        "lon": 83.3055,
        "device_id": "DEV-002",
        "vehicle_label": "Bus #12",
        "slm_summary": "Uncovered high-risk stormwater chamber opening in active traffic lane.",
        "confidence": 0.94
    },
    {
        "defect_type": DefectType.EXTERNAL_ACCIDENT.value,
        "title": "Vehicle Collision Hazard",
        "landmark": "Bypass Flyover Descent",
        "lat": 17.7210,
        "lon": 83.3075,
        "device_id": "DEV-003",
        "vehicle_label": "Tipper #02",
        "slm_summary": "Two-vehicle collision with moderate debris causing lane bottleneck on flyover ramp.",
        "confidence": 0.91
    },
    {
        "defect_type": DefectType.ROAD_POTHOLE.value,
        "title": "Severe Road Pothole",
        "landmark": "Siripuram Main Cross Road",
        "lat": 17.7248,
        "lon": 83.3068,
        "device_id": "DEV-001",
        "vehicle_label": "Sweeper #04",
        "slm_summary": "Deep carriage-way depression measuring approx 0.9m across, edge fractured.",
        "confidence": 0.84
    }
]

@router.post("/trigger-incident")
async def trigger_simulated_incident(
    sample_index: int = 0,
    force_duplicate: bool = False,
    db: Session = Depends(get_db)
):
    """
    Simulates on-device detection event from a municipal fleet vehicle.
    If force_duplicate is True, injects an observation within 6 meters of an existing
    ticket to demonstrate the PostGIS ST_DWithin deduplication suppression.
    """
    idx = sample_index % len(SAMPLE_INCIDENTS)
    sample = SAMPLE_INCIDENTS[idx].copy()

    # If force duplicate, find existing ticket of same defect_type and add tiny jitter
    if force_duplicate:
        existing = db.query(Incident).filter(Incident.defect_type == sample["defect_type"]).first()
        if existing:
            lat = existing.latitude + random.uniform(-0.00004, 0.00004)
            lon = existing.longitude + random.uniform(-0.00004, 0.00004)
        else:
            lat, lon = sample["lat"], sample["lon"]
    else:
        lat = sample["lat"] + random.uniform(-0.0002, 0.0002)
        lon = sample["lon"] + random.uniform(-0.0002, 0.0002)

    # Spatial Deduplication Check (PRD 5.2)
    is_duplicate, existing_match, dist = GeoService.check_spatial_deduplication(
        db=db,
        lat=lat,
        lon=lon,
        defect_type=sample["defect_type"]
    )

    if is_duplicate and existing_match:
        existing_match.sighting_count += 1
        existing_match.last_sighting_at = datetime.utcnow()
        existing_match.spotted_by_label = sample["vehicle_label"]
        
        sighting = IncidentSighting(
            incident_id=existing_match.id,
            device_id=sample["device_id"],
            vehicle_label=sample["vehicle_label"],
            timestamp=datetime.utcnow(),
            latitude=lat,
            longitude=lon,
            confidence=sample["confidence"],
            image_url=existing_match.image_url
        )
        db.add(sighting)
        db.commit()

        return {
            "is_duplicate": True,
            "incident_id": existing_match.id,
            "sighting_count": existing_match.sighting_count,
            "distance_meters": round(dist, 1),
            "message": f"Deduplication Active: Matched existing ticket #{existing_match.id[:8]} ({round(dist, 1)}m away). Notification suppressed to prevent officer fatigue."
        }

    # Otherwise new ticket
    ward_id, zone_id, ward_name = GeoService.resolve_ward_point_in_polygon(db, lat, lon)
    routing = DispatchService.get_routing_info(sample["defect_type"])
    annotated_url, orig_url, bbox_json = StorageService.save_and_annotate_image(
        image_bytes=None,
        defect_type=sample["defect_type"],
        confidence=sample["confidence"]
    )

    new_inc = Incident(
        defect_type=sample["defect_type"],
        title=sample["title"],
        status=IncidentStatus.NEEDS_ACTION.value,
        urgency=routing["urgency"],
        confidence=sample["confidence"],
        slm_summary=sample["slm_summary"],
        landmark=sample["landmark"],
        latitude=lat,
        longitude=lon,
        ward_id=ward_id,
        zone_id=zone_id,
        ward_name=ward_name,
        assigned_department=routing["department"],
        channel_sla=routing["channel_sla"],
        first_sighting_at=datetime.utcnow(),
        last_sighting_at=datetime.utcnow(),
        sighting_count=1,
        spotted_by_label=sample["vehicle_label"],
        last_device_id=sample["device_id"],
        image_url=annotated_url,
        original_image_url=orig_url,
        bbox_json=bbox_json,
        telegram_dispatched=False
    )
    db.add(new_inc)
    db.commit()
    db.refresh(new_inc)

    # First sighting
    sighting = IncidentSighting(
        incident_id=new_inc.id,
        device_id=sample["device_id"],
        vehicle_label=sample["vehicle_label"],
        timestamp=datetime.utcnow(),
        latitude=lat,
        longitude=lon,
        confidence=sample["confidence"],
        image_url=annotated_url
    )
    db.add(sighting)
    db.commit()

    # Telegram dispatch
    dispatch_res = await DispatchService.dispatch_telegram_alert(new_inc)
    new_inc.telegram_dispatched = True
    new_inc.telegram_dispatched_at = datetime.utcnow()
    db.commit()

    return {
        "is_duplicate": False,
        "incident_id": new_inc.id,
        "title": new_inc.title,
        "ward": new_inc.ward_name,
        "department": new_inc.assigned_department,
        "sla": new_inc.channel_sla,
        "message": "New master ticket created and dispatched to Telegram channel."
    }

@router.post("/clear")
def clear_all_incidents(db: Session = Depends(get_db)):
    """
    Completely wipes all incidents and sightings to 0 tickets,
    while preserving ward boundaries and fleet vehicles.
    """
    db.query(IncidentSighting).delete()
    db.query(Incident).delete()
    db.commit()

    return {
        "status": "success",
        "incidents_count": 0,
        "message": "All incident tickets cleared. Database is now completely clean (0 tickets)!"
    }

@router.post("/reset")
def reset_simulation_data(
    clear_only: bool = False,
    db: Session = Depends(get_db)
):
    """
    If clear_only=True: Completely wipes all incidents to 0 tickets.
    If clear_only=False: Reseeds demo wards, fleet vehicles, and benchmark incidents.
    """
    if clear_only:
        db.query(IncidentSighting).delete()
        db.query(Incident).delete()
        db.commit()
        return {
            "status": "success",
            "incidents_count": 0,
            "message": "Database cleared! All incidents wiped to 0."
        }

    seed_initial_data(db)
    return {"status": "success", "message": "Database reset and seeded with GVMC Ward 14 benchmark data."}

@router.post("/closed-loop/simulate-arrival")
def simulate_tipper_arrival(db: Session = Depends(get_db)):
    """
    PRD Section 5.2 - State 1 Simulation:
    Tipper #04 (Fleet B) arrives within 10m of open Market Road overflow.
    Front Camera logs 'BEFORE' proof, changes state to WORK_IN_PROGRESS.
    """
    incident = db.query(Incident).filter(
        Incident.defect_type == DefectType.GARBAGE_OVERFLOW.value,
        Incident.status == IncidentStatus.NEEDS_ACTION.value
    ).first()

    if not incident:
        # If no open garbage ticket, pick any open or create one
        incident = db.query(Incident).filter(Incident.status == IncidentStatus.NEEDS_ACTION.value).first()

    if not incident:
        return {"status": "error", "message": "No active open incident found to clean. Please trigger milestone [1] first!"}

    before_url, _ = StorageService.generate_closed_loop_proof_images(
        tipper_id="AP-31-TT-4402",
        landmark=incident.landmark or "Main Market Road, Pillar 42"
    )

    incident.work_state = "WORK_IN_PROGRESS"
    incident.status = IncidentStatus.QRT_DISPATCHED.value
    incident.cleaning_tipper_id = "AP-31-TT-4402"
    incident.arrived_at = datetime.utcnow()
    incident.before_image_url = before_url
    incident.dwell_duration_sec = 0
    db.commit()

    return {
        "status": "success",
        "state": "WORK_IN_PROGRESS",
        "ticket_id": incident.id,
        "landmark": incident.landmark,
        "vehicle": "Tipper #04 (AP-31-TT-4402)",
        "before_image_url": before_url,
        "message": f"State 1 Confirmed: Tipper AP-31-TT-4402 arrived within 10m of {incident.landmark}. Front camera logged BEFORE proof. Dwell timer started."
    }

@router.post("/closed-loop/simulate-closure")
def simulate_tipper_closure(db: Session = Depends(get_db)):
    """
    PRD Section 5.2 - State 3 Simulation:
    Tipper #04 pulls forward 15 meters after loading.
    Rear aux camera automatically inspects curb: verified clean -> CLOSED_VERIFIED + 100% Billing Credit.
    """
    incident = db.query(Incident).filter(
        Incident.work_state == "WORK_IN_PROGRESS"
    ).first()

    if not incident:
        incident = db.query(Incident).filter(
            Incident.defect_type == DefectType.GARBAGE_OVERFLOW.value
        ).first()

    if not incident:
        return {"status": "error", "message": "No ticket in progress. Run arrival milestone first!"}

    _, after_url = StorageService.generate_closed_loop_proof_images(
        tipper_id="AP-31-TT-4402",
        landmark=incident.landmark or "Main Market Road, Pillar 42"
    )

    incident.work_state = "CLOSED_VERIFIED"
    incident.status = IncidentStatus.RESOLVED.value
    incident.cleared_at = datetime.utcnow()
    incident.after_image_url = after_url
    incident.dwell_duration_sec = 180 # 3 minutes dwell
    incident.billing_credit_approved = True
    incident.penalty_amount_inr = 0.0
    db.commit()

    return {
        "status": "success",
        "state": "CLOSED_VERIFIED",
        "ticket_id": incident.id,
        "landmark": incident.landmark,
        "dwell_time": "3 mins (180s)",
        "after_image_url": after_url,
        "credit": "100% Billing Credit Approved",
        "message": f"Autonomous Closure Complete! Rear camera verified clean pavement. 100% billing credit approved for Apex CleanTech."
    }

@router.post("/closed-loop/simulate-ghost-billing")
def simulate_ghost_billing(db: Session = Depends(get_db)):
    """
    PRD Section 1.1 & 5.2 Exception Pathway:
    Concessionaire tipper drives past coordinate at 38 km/h without stopping (dwell time: 8s).
    System detects ghost billing attempt -> Status: FLAGGED_INCOMPLETE + ₹5,000 fine levied.
    """
    before_url, _ = StorageService.generate_closed_loop_proof_images(
        tipper_id="AP-31-TY-9912",
        landmark="Sector 4 Commercial Corridor"
    )

    ghost_ticket = Incident(
        defect_type=DefectType.GARBAGE_OVERFLOW.value,
        title="Unverified Drive-by / Route Fraud Alert",
        status=IncidentStatus.NEEDS_ACTION.value,
        urgency=UrgencyLevel.SANITATION_ROADS.value,
        confidence=0.91,
        slm_summary="Route fraud detected: Tipper AP-31-TY-9912 passed designated coordinates at 38 km/h without dwelling (dwell duration: 8 seconds). Trash still present.",
        landmark="Sector 4 Commercial Corridor",
        latitude=17.7245,
        longitude=83.3080,
        ward_id="GVMC-W14",
        zone_id="ZONE-03",
        ward_name="Ward 14 (Siripuram)",
        assigned_department="Public Health & Sanitation",
        channel_sla="Contractor SLA Penalty Bot (Instant)",
        concessionaire_id="CONC-APEX",
        concessionaire_name="Apex CleanTech",
        work_state="FLAGGED_INCOMPLETE",
        cleaning_tipper_id="AP-31-TY-9912",
        dwell_duration_sec=8,
        before_image_url=before_url,
        billing_credit_approved=False,
        penalty_amount_inr=5000.0,
        first_sighting_at=datetime.utcnow(),
        last_sighting_at=datetime.utcnow(),
        sighting_count=1,
        spotted_by_label="Tipper #09 (Speed: 38 km/h)"
    )
    db.add(ghost_ticket)
    db.commit()

    return {
        "status": "warning",
        "state": "FLAGGED_INCOMPLETE",
        "ticket_id": ghost_ticket.id,
        "landmark": ghost_ticket.landmark,
        "penalty_amount": "₹5,000",
        "reason": "Vehicle passed at 38 km/h (dwell: 8s < 60s minimum threshold). Trash detected on curb.",
        "message": "GHOST-BILLING CAUGHT! Contractor billed ₹5,000 penalty. Trip uncredited."
    }


