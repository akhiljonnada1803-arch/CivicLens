import logging
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Form, File, UploadFile, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.incident import Incident, IncidentSighting, DefectType, IncidentStatus, UrgencyLevel
from app.models.ward import FleetVehicle
from app.schemas.incident import TelemetryIngestResponse
from app.services.geo_service import GeoService
from app.services.dispatch_service import DispatchService
from app.services.storage_service import StorageService

router = APIRouter()
logger = logging.getLogger(__name__)

# Device-to-Vehicle label mapping helper
DEVICE_LABELS = {
    "DEV-001": "Sweeper #04",
    "DEV-002": "Transit Bus #12",
    "DEV-003": "Waste Tipper #02",
    "DEV-004": "Enforcement Car #01"
}

@router.post("/incident", response_model=TelemetryIngestResponse, status_code=status.HTTP_200_OK)
async def ingest_incident_telemetry(
    device_id: str = Form(..., description="Unique edge device identifier"),
    lat: float = Form(..., description="GPS Latitude (6 decimal points)"),
    lon: float = Form(..., description="GPS Longitude (6 decimal points)"),
    defect_type: str = Form(..., description="garbage_overflow, road_pothole, open_manhole, external_accident, illegal_banner, vehicle_crash"),
    confidence: float = Form(0.85, description="Model inference confidence score (0.0 to 1.0)"),
    slm_summary: Optional[str] = Form(None, description="On-device SLM verified context summary"),
    timestamp: Optional[str] = Form(None, description="ISO timestamp from mobile device"),
    evidence_image: Optional[UploadFile] = File(None, description="Compressed WebP dashcam frame"),
    db: Session = Depends(get_db)
):
    """
    PRD Section 5.1 & 5.2 - Ingestion API Specification:
    High-throughput asynchronous REST gateway handling multi-part image and telemetry payloads.
    Performs ST_DWithin spatial deduplication, Point-in-Polygon (PiP) Ward mapping,
    and automatic departmental dispatch.
    """
    vehicle_label = DEVICE_LABELS.get(device_id, f"Fleet Unit ({device_id})")
    
    # 1. Update vehicle location if fleet record exists
    vehicle = db.query(FleetVehicle).filter(FleetVehicle.id == device_id).first()
    if vehicle:
        vehicle.current_lat = lat
        vehicle.current_lon = lon
        vehicle.last_heartbeat = datetime.utcnow()

    # Read image bytes if provided
    image_bytes = None
    if evidence_image:
        image_bytes = await evidence_image.read()

    # 2. Check Spatial Deduplication (PRD Section 5.2: 15.0m within 12h for same defect_type)
    is_duplicate, existing_incident, distance = GeoService.check_spatial_deduplication(
        db=db,
        lat=lat,
        lon=lon,
        defect_type=defect_type
    )

    if is_duplicate and existing_incident:
        # Deduplication Match Found: Update recurrence count, log sighting, suppress alert
        existing_incident.sighting_count += 1
        existing_incident.last_sighting_at = datetime.utcnow()
        existing_incident.last_device_id = device_id
        existing_incident.spotted_by_label = vehicle_label

        # Save sighting in history
        sighting = IncidentSighting(
            incident_id=existing_incident.id,
            device_id=device_id,
            vehicle_label=vehicle_label,
            timestamp=datetime.utcnow(),
            latitude=lat,
            longitude=lon,
            confidence=confidence,
            image_url=existing_incident.image_url
        )
        db.add(sighting)
        db.commit()

        logger.info(f"Suppressed duplicate alert for incident {existing_incident.id} (Distance: {distance:.1f}m, Sighting #{existing_incident.sighting_count})")

        return TelemetryIngestResponse(
            incident_id=existing_incident.id,
            is_duplicate=True,
            sighting_count=existing_incident.sighting_count,
            defect_type=existing_incident.defect_type,
            title=existing_incident.title,
            assigned_department=existing_incident.assigned_department,
            ward_id=existing_incident.ward_id,
            ward_name=existing_incident.ward_name,
            channel_sla=existing_incident.channel_sla,
            telegram_dispatched=False,
            message=f"Duplicate alert suppressed. Recurrence count incremented to {existing_incident.sighting_count} (Spotted {distance:.1f}m from master ticket).",
            image_url=existing_incident.image_url,
            confidence=confidence,
            slm_summary=existing_incident.slm_summary,
            landmark=existing_incident.landmark,
            latitude=existing_incident.latitude,
            longitude=existing_incident.longitude
        )

    # 3. No match -> Create New Master Incident
    # A. Point-in-Polygon Ward Resolution
    ward_id, zone_id, ward_name = GeoService.resolve_ward_point_in_polygon(db=db, lat=lat, lon=lon)

    # B. Multi-Department Routing Info
    routing = DispatchService.get_routing_info(defect_type)

    # C. Image Storage and AI Bounding Box Annotation
    annotated_url, orig_url, bbox_json = StorageService.save_and_annotate_image(
        image_bytes=image_bytes,
        defect_type=defect_type,
        confidence=confidence
    )

    # Default SLM summary if none supplied
    if not slm_summary:
        if defect_type == "garbage_overflow":
            slm_summary = "Significant roadside waste overflow on lane shoulder, partially obstructing footpath."
        elif defect_type == "open_manhole":
            slm_summary = "Uncovered sewer chamber opening in active traffic lane. Critical road safety hazard."
        elif defect_type == "road_pothole":
            slm_summary = "Deep crater defect on asphalt carriage-way, approximately 0.8m diameter."
        elif defect_type in ["vehicle_crash", "external_accident"]:
            slm_summary = "Multi-vehicle collision or rollover detected on carriage-way with lane blockage."
        else:
            slm_summary = f"Detected {defect_type.replace('_', ' ')} with high visual certainty."

    new_incident = Incident(
        defect_type=defect_type,
        title=routing["title"],
        status=IncidentStatus.NEEDS_ACTION.value,
        urgency=routing["urgency"],
        confidence=confidence,
        slm_summary=slm_summary,
        landmark=routing["default_landmark"],
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
        spotted_by_label=vehicle_label,
        last_device_id=device_id,
        image_url=annotated_url,
        original_image_url=orig_url,
        bbox_json=bbox_json,
        telegram_dispatched=False
    )

    db.add(new_incident)
    db.commit()
    db.refresh(new_incident)

    # Create first sighting log
    first_sighting = IncidentSighting(
        incident_id=new_incident.id,
        device_id=device_id,
        vehicle_label=vehicle_label,
        timestamp=datetime.utcnow(),
        latitude=lat,
        longitude=lon,
        confidence=confidence,
        image_url=annotated_url
    )
    db.add(first_sighting)
    db.commit()

    # D. Multi-Department Telegram Dispatch (< 4 seconds SLA)
    dispatch_res = await DispatchService.dispatch_telegram_alert(new_incident)
    if dispatch_res.get("success"):
        new_incident.telegram_dispatched = True
        new_incident.telegram_dispatched_at = datetime.utcnow()
        if "message_id" in dispatch_res:
            new_incident.telegram_message_id = str(dispatch_res["message_id"])
        db.commit()

    return TelemetryIngestResponse(
        incident_id=new_incident.id,
        is_duplicate=False,
        sighting_count=1,
        defect_type=new_incident.defect_type,
        title=new_incident.title,
        assigned_department=new_incident.assigned_department,
        ward_id=new_incident.ward_id,
        ward_name=new_incident.ward_name,
        channel_sla=new_incident.channel_sla,
        telegram_dispatched=new_incident.telegram_dispatched,
        message="New civic incident created and automatically routed to department channel.",
        image_url=new_incident.image_url,
        confidence=new_incident.confidence,
        slm_summary=new_incident.slm_summary,
        landmark=new_incident.landmark,
        latitude=new_incident.latitude,
        longitude=new_incident.longitude
    )

