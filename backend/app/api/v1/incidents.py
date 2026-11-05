from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, case

from app.database import get_db
from app.models.incident import Incident, IncidentStatus, UrgencyLevel
from app.schemas.incident import IncidentResponse, IncidentStatusUpdate, IncidentDispatchAction
from app.services.dispatch_service import DispatchService

router = APIRouter()

@router.get("", response_model=List[IncidentResponse])
def list_incidents(
    ward_id: Optional[str] = Query(None, description="Filter by Ward ID (e.g. GVMC-W14)"),
    zone_id: Optional[str] = Query(None, description="Filter by Zone ID (e.g. ZONE-03)"),
    defect_type: Optional[str] = Query(None, description="Filter by defect type"),
    status: Optional[str] = Query(None, description="Filter by status (NEEDS_ACTION, QRT_DISPATCHED, RESOLVED, FALSE_ALARM)"),
    urgency: Optional[str] = Query(None, description="Filter by urgency (URGENT_SAFETY, SANITATION_ROADS, ROUTINE)"),
    search: Optional[str] = Query(None, description="Search landmark, title, or summary"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """
    List civic incidents with rich multi-filter criteria.
    Sorted by urgency priority (URGENT_SAFETY first) followed by latest sighting.
    """
    query = db.query(Incident)

    if ward_id and ward_id != "ALL":
        query = query.filter(Incident.ward_id == ward_id)
    if zone_id and zone_id != "ALL":
        query = query.filter(Incident.zone_id == zone_id)
    if defect_type and defect_type != "ALL":
        query = query.filter(Incident.defect_type == defect_type)
    if status and status != "ALL":
        query = query.filter(Incident.status == status)
    if urgency and urgency != "ALL":
        query = query.filter(Incident.urgency == urgency)
    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            (Incident.title.ilike(search_fmt)) |
            (Incident.landmark.ilike(search_fmt)) |
            (Incident.slm_summary.ilike(search_fmt))
        )

    # Sort order: URGENT_SAFETY first, then by last_sighting_at desc
    urgency_priority = case(
        (Incident.urgency == UrgencyLevel.URGENT_SAFETY.value, 1),
        (Incident.urgency == UrgencyLevel.SANITATION_ROADS.value, 2),
        else_=3
    )

    incidents = query.order_by(urgency_priority, desc(Incident.last_sighting_at)).offset(offset).limit(limit).all()
    return incidents

@router.get("/{incident_id}", response_model=IncidentResponse)
def get_incident(incident_id: str, db: Session = Depends(get_db)):
    """
    Get full incident details including all sightings history and photo proof.
    """
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident

@router.patch("/{incident_id}/status", response_model=IncidentResponse)
def update_incident_status(
    incident_id: str,
    payload: IncidentStatusUpdate,
    db: Session = Depends(get_db)
):
    """
    Update ticket status: NEEDS_ACTION, QRT_DISPATCHED, RESOLVED, FALSE_ALARM.
    """
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    incident.status = payload.status
    if payload.notes:
        incident.notes = payload.notes
    incident.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(incident)
    return incident

@router.post("/{incident_id}/dispatch", response_model=IncidentResponse)
async def dispatch_incident(
    incident_id: str,
    action: Optional[IncidentDispatchAction] = None,
    db: Session = Depends(get_db)
):
    """
    Manual one-click officer dispatch to Telegram bot / QRT team.
    """
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    custom_chat_id = action.telegram_chat_id if action else None
    res = await DispatchService.dispatch_telegram_alert(incident, custom_chat_id=custom_chat_id)

    incident.telegram_dispatched = True
    incident.telegram_dispatched_at = datetime.utcnow()
    incident.status = IncidentStatus.QRT_DISPATCHED.value
    if "message_id" in res:
        incident.telegram_message_id = str(res["message_id"])

    db.commit()
    db.refresh(incident)
    return incident

