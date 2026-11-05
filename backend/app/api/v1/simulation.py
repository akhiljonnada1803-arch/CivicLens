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

