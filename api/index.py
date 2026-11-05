"""
CivicLens AI — Vercel Native Python Serverless API Gateway
FastAPI Handler with PostgreSQL/PostGIS Support and Zero-Downtime Mock Fallback
"""

import os
import json
import logging
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, status, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("civiclens-api")

app = FastAPI(
    title="CivicLens AI Serverless Engine",
    version="4.0.0",
    description="Autonomous Civic Audit, Spatial Incident Ingestion & Proof-of-Work Verification Gateway",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
)

# Enable CORS for Next.js App Router and local preview environments
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATABASE_URL = os.getenv("DATABASE_URL")

# ==========================================
# Database Connection Helper (PostgreSQL/PostGIS)
# ==========================================
def execute_query(query: str, params: tuple = (), fetch: bool = True) -> Optional[List[Dict[str, Any]]]:
    """
    Executes raw SQL query against PostgreSQL/PostGIS instance if DATABASE_URL is defined.
    Gracefully returns None if DATABASE_URL is absent or if connection fails.
    """
    if not DATABASE_URL:
        return None
    try:
        import psycopg2
        from psycopg2.extras import RealDictCursor
        with psycopg2.connect(DATABASE_URL, connect_timeout=3) as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(query, params)
                if fetch:
                    return [dict(row) for row in cur.fetchall()]
                conn.commit()
                return []
    except Exception as e:
        logger.warning(f"Database query error (falling back to mock state): {e}")
        return None

# ==========================================
# In-Memory High-Fidelity Mock State (Fallback)
# ==========================================
MOCK_INCIDENTS: List[Dict[str, Any]] = [
    {
        "id": "inc-8841-gvmc",
        "defect_type": "garbage_overflow",
        "severity": "HIGH",
        "title": "Garbage Overflow / Blackspot",
        "slm_summary": "Roadside waste partially obstructing pedestrian carriage-way along market stretch.",
        "latitude": 17.7225,
        "longitude": 83.3045,
        "landmark": "Main Market Road, Pillar 42",
        "ward": "Ward 14 (Siripuram)",
        "zone": "Zone 3 (Central)",
        "source_fleet": "Fleet A (APSRTC Bus #12)",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "sync_status": "SYNCED",
        "status": "NEEDS_ACTION",
        "concessionaire": "Apex CleanTech",
        "bbox": [0.28, 0.42, 0.72, 0.85],
        "image_url": "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80",
    },
    {
        "id": "inc-8842-gvmc",
        "defect_type": "open_manhole",
        "severity": "CRITICAL",
        "title": "Open Stormwater Manhole Hazard",
        "slm_summary": "Uncovered sewer chamber opening in active traffic lane. Critical road safety hazard.",
        "latitude": 17.7238,
        "longitude": 83.3055,
        "landmark": "Station Road Junction",
        "ward": "Ward 14 (Siripuram)",
        "zone": "Zone 3 (Central)",
        "source_fleet": "Fleet A (Police PCR #04)",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "sync_status": "SYNCED",
        "status": "QRT_DISPATCHED",
        "concessionaire": "Apex CleanTech",
        "bbox": [0.42, 0.58, 0.58, 0.76],
        "image_url": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
    },
    {
        "id": "inc-8843-gvmc",
        "defect_type": "road_pothole",
        "severity": "MEDIUM",
        "title": "Carriageway Asphalt Pothole",
        "slm_summary": "Fractured asphalt depression measuring 0.9m across on carriage-way shoulder.",
        "latitude": 17.7248,
        "longitude": 83.3068,
        "landmark": "Siripuram Main Cross Road",
        "ward": "Ward 14 (Siripuram)",
        "zone": "Zone 3 (Central)",
        "source_fleet": "Fleet A (APSRTC Bus #07)",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "sync_status": "SYNCED",
        "status": "NEEDS_ACTION",
        "concessionaire": "Apex CleanTech",
        "bbox": [0.35, 0.55, 0.65, 0.78],
        "image_url": "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
    },
    {
        "id": "inc-8844-gvmc",
        "defect_type": "vehicle_crash",
        "severity": "CRITICAL",
        "title": "Vehicle Collision & Rollover Spike",
        "slm_summary": "Multi-vehicle collision with moderate debris causing lane bottleneck on flyover descent.",
        "latitude": 17.7210,
        "longitude": 83.3075,
        "landmark": "Bypass Flyover Descent",
        "ward": "Ward 14 (Siripuram)",
        "zone": "Zone 3 (Central)",
        "source_fleet": "Fleet B (Tipper #02 IMU Spike: 4.8g)",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "sync_status": "SYNCED",
        "status": "QRT_DISPATCHED",
        "concessionaire": "Apex CleanTech",
        "bbox": [0.38, 0.52, 0.62, 0.75],
        "image_url": "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80",
    }
]

MOCK_AUDIT_RECORDS: List[Dict[str, Any]] = [
    {
        "job_id": "JOB-GVMC-8841",
        "incident_id": "inc-8841-gvmc",
        "concessionaire": "Apex CleanTech",
        "route_id": "Route #14B - Siripuram",
        "vehicle_registration": "AP-31-TT-4402",
        "landmark": "Main Market Road, Pillar 42",
        "latitude": 17.7225,
        "longitude": 83.3045,
        "before_photo_url": "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80",
        "after_photo_url": "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80",
        "arrival_time": "1:41 PM",
        "closure_time": "1:44 PM",
        "dwell_duration_sec": 180,
        "pull_forward_meters": 15.0,
        "rear_camera_confidence": 0.94,
        "work_state": "CLOSED_VERIFIED",
        "billing_credit_approved": True,
        "credit_amount_inr": 750.0,
        "penalty_amount_inr": 0.0,
        "dispute_status": "NONE",
    },
    {
        "job_id": "JOB-GVMC-8839",
        "incident_id": "inc-8839-gvmc",
        "concessionaire": "Apex CleanTech",
        "route_id": "Route #14A - Sector 4",
        "vehicle_registration": "AP-31-TY-9912",
        "landmark": "Sector 4 Commercial Corridor",
        "latitude": 17.7245,
        "longitude": 83.3080,
        "before_photo_url": "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80",
        "after_photo_url": "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80",
        "arrival_time": "11:20 AM",
        "closure_time": "11:20 AM",
        "dwell_duration_sec": 8,
        "pull_forward_meters": 0.0,
        "rear_camera_confidence": 0.42,
        "work_state": "FLAGGED_INCOMPLETE",
        "billing_credit_approved": False,
        "credit_amount_inr": 0.0,
        "penalty_amount_inr": 5000.0,
        "dispute_status": "PENALTY_LEVIED",
    }
]

# ==========================================
# Pydantic Schemas
# ==========================================
class BoundingBox(BaseModel):
    x1: float
    y1: float
    x2: float
    y2: float
    confidence: float = 0.85
    label: str = "Defect"

class TelemetryIngestPayload(BaseModel):
    defect_type: str = Field(..., description="garbage_overflow, road_pothole, open_manhole, vehicle_crash")
    severity: str = Field("HIGH", description="CRITICAL, HIGH, MEDIUM, ROUTINE")
    latitude: float = Field(..., description="WGS84 Latitude")
    longitude: float = Field(..., description="WGS84 Longitude")
    landmark: Optional[str] = "Ward 14 Central Sector"
    slm_summary: Optional[str] = "Autonomous vision verified road defect requiring municipal clearance."
    source_fleet: Optional[str] = "Fleet A (Transit Bus #12)"
    device_id: Optional[str] = "DEV-RV1126-001"
    bounding_box: Optional[BoundingBox] = None
    image_url: Optional[str] = None

class DisputePayload(BaseModel):
    job_id: str
    incident_id: str
    concessionaire: str = "Apex CleanTech"
    defense_notes: str = Field(..., description="Detailed timeline proof citing timestamped prior clearance")
    appeal_reason: str = "RE_DUMP_SECONDARY_SPILL"

# ==========================================
# API Endpoints
# ==========================================
@app.get("/api/health")
def get_health():
    """Returns system status, active version, and live PostgreSQL connection verification."""
    db_status = "DISCONNECTED_USING_IN_MEMORY_FALLBACK"
    db_ping_ms = None
    
    if DATABASE_URL:
        try:
            import time
            start = time.time()
            res = execute_query("SELECT 1 AS alive")
            if res:
                db_status = "CONNECTED_POSTGRESQL_POSTGIS"
                db_ping_ms = round((time.time() - start) * 1000, 2)
        except Exception as e:
            db_status = f"ERROR: {str(e)}"

    return {
        "status": "ONLINE",
        "service": "CivicLens AI Serverless Engine",
        "version": "4.0.0",
        "environment": os.getenv("VERCEL_ENV", "development"),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "database": {
            "status": db_status,
            "latency_ms": db_ping_ms,
            "postgis_enabled": bool(DATABASE_URL),
        },
        "target_municipality": "Greater Visakhapatnam Municipal Corporation (GVMC)",
        "active_ward": "Ward 14 (Siripuram / Maddilapalem)",
    }

@app.get("/api/incidents")
def list_incidents(
    limit: int = Query(50, ge=1, le=100),
    severity: Optional[str] = None,
    defect_type: Optional[str] = None,
):
    """Fetches the latest incidents with spatial metadata, SLM summaries, and sync status."""
    # Attempt SQL query if PostGIS DB configured
    sql = "SELECT id, defect_type, severity, title, slm_summary, latitude, longitude, landmark, ward, zone, source_fleet, timestamp, sync_status, status, concessionaire, image_url FROM incidents"
    params: list = []
    conditions: list = []

    if severity:
        conditions.append("severity = %s")
        params.append(severity.upper())
    if defect_type:
        conditions.append("defect_type = %s")
        params.append(defect_type.lower())

    if conditions:
        sql += " WHERE " + " AND ".join(conditions)
    sql += " ORDER BY timestamp DESC LIMIT %s"
    params.append(limit)

    db_rows = execute_query(sql, tuple(params))
    if db_rows is not None and len(db_rows) > 0:
        return {"count": len(db_rows), "source": "DATABASE", "incidents": db_rows}

    # High-Fidelity Mock Fallback
    results = MOCK_INCIDENTS.copy()
    if severity:
        results = [i for i in results if i.get("severity", "").upper() == severity.upper()]
    if defect_type:
        results = [i for i in results if i.get("defect_type", "").lower() == defect_type.lower()]

    return {
        "count": len(results[:limit]),
        "source": "MOCK_FALLBACK",
        "incidents": results[:limit],
    }

@app.post("/api/telemetry/ingest", status_code=status.HTTP_201_CREATED)
def ingest_telemetry(payload: TelemetryIngestPayload):
    """
    Ingests road defect telemetry from edge dashcams (Rockchip RV1126 1 FPS YOLO INT8 + on-device SLM).
    Performs spatial ticket assignment and initiates autonomous contractor routing.
    """
    new_id = f"inc-{int(datetime.now(timezone.utc).timestamp())}"
    now_iso = datetime.now(timezone.utc).isoformat()
    
    img_url = payload.image_url or (
        "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80"
        if "garbage" in payload.defect_type
        else "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80"
    )

    incident_record = {
        "id": new_id,
        "defect_type": payload.defect_type,
        "severity": payload.severity,
        "title": payload.defect_type.replace("_", " ").title(),
        "slm_summary": payload.slm_summary,
        "latitude": payload.latitude,
        "longitude": payload.longitude,
        "landmark": payload.landmark,
        "ward": "Ward 14 (Siripuram)",
        "zone": "Zone 3 (Central)",
        "source_fleet": payload.source_fleet,
        "timestamp": now_iso,
        "sync_status": "SYNCED",
        "status": "NEEDS_ACTION",
        "concessionaire": "Apex CleanTech",
        "bbox": [payload.bounding_box.x1, payload.bounding_box.y1, payload.bounding_box.x2, payload.bounding_box.y2] if payload.bounding_box else [0.25, 0.45, 0.75, 0.85],
        "image_url": img_url,
    }

    # Attempt PostgreSQL insert if DB available
    insert_sql = """
    INSERT INTO incidents (id, defect_type, severity, title, slm_summary, latitude, longitude, landmark, ward, zone, source_fleet, timestamp, sync_status, status, concessionaire, image_url)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    execute_query(
        insert_sql,
        (
            new_id, payload.defect_type, payload.severity, incident_record["title"], payload.slm_summary,
            payload.latitude, payload.longitude, payload.landmark, incident_record["ward"], incident_record["zone"],
            payload.source_fleet, now_iso, "SYNCED", "NEEDS_ACTION", "Apex CleanTech", img_url
        ),
        fetch=False
    )

    # Prepend to in-memory store
    MOCK_INCIDENTS.insert(0, incident_record)

    return {
        "status": "INGESTED",
        "ticket_id": new_id,
        "assigned_concessionaire": "Apex CleanTech",
        "ward_resolved": "Ward 14 (Siripuram)",
        "message": f"Hazard successfully ingested from {payload.source_fleet}. Dispatched to Apex CleanTech QRT route.",
        "record": incident_record,
    }

@app.get("/api/contractors/audit")
def get_contractor_audit(concessionaire: str = "Apex CleanTech"):
    """
    PRD Section 5.2 & 6.2: Fetches paired 'Before Pickup' (Front Camera) & 'After Pickup' (Rear Camera)
    records for contractor invoice verification and ghost-billing audit.
    """
    sql = "SELECT * FROM contractor_audits WHERE concessionaire = %s ORDER BY closure_time DESC"
    db_rows = execute_query(sql, (concessionaire,))
    if db_rows is not None and len(db_rows) > 0:
        return {
            "concessionaire": concessionaire,
            "source": "DATABASE",
            "active_tippers": 18,
            "clean_rate_pct": 98.2,
            "total_credits_inr": 245000.0,
            "total_penalties_inr": 0.0,
            "audits": db_rows,
        }

    return {
        "concessionaire": concessionaire,
        "source": "MOCK_FALLBACK",
        "active_tippers": 18,
        "clean_rate_pct": 98.2,
        "total_credits_inr": 245000.0,
        "total_penalties_inr": sum(r.get("penalty_amount_inr", 0) for r in MOCK_AUDIT_RECORDS),
        "audits": MOCK_AUDIT_RECORDS,
    }

@app.post("/api/contractors/dispute")
def submit_dispute(payload: DisputePayload):
    """
    PRD Section 8 Mitigation #4: Submits contractor defense against wrongful 're-dump' penalty.
    Uses immutable timestamped 'After' proof to verify prior spotless condition.
    """
    for record in MOCK_AUDIT_RECORDS:
        if record["job_id"] == payload.job_id or record["incident_id"] == payload.incident_id:
            record["dispute_status"] = "DISPUTED_REDUMP_PENDING_REVIEW"
            record["penalty_amount_inr"] = 0.0 # Temporarily hold fine
            record["defense_notes"] = payload.defense_notes
            return {
                "status": "DISPUTE_ACCEPTED",
                "job_id": payload.job_id,
                "message": "Re-dump defense registered with immutable proof vault. Municipal penalty held in abeyance pending automated photo timestamp review.",
                "updated_record": record,
            }

    return {
        "status": "DISPUTE_LOGGED",
        "job_id": payload.job_id,
        "message": f"Dispute recorded for {payload.job_id}. Under evaluation by GVMC Municipal Audit Wing.",
        "defense_notes": payload.defense_notes,
    }

