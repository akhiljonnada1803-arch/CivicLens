from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, Field, ConfigDict

class BoundingBox(BaseModel):
    x1: float
    y1: float
    x2: float
    y2: float
    label: str
    confidence: float

class SightingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    device_id: str
    vehicle_label: str
    timestamp: datetime
    latitude: float
    longitude: float
    confidence: float
    image_url: Optional[str] = None

class IncidentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    defect_type: str
    title: str
    status: str
    urgency: str
    confidence: float
    slm_summary: Optional[str] = None
    landmark: Optional[str] = None
    latitude: float
    longitude: float
    ward_id: Optional[str] = None
    zone_id: Optional[str] = None
    ward_name: Optional[str] = None
    assigned_department: str
    channel_sla: str
    
    # PRD v4.0 Closed-Loop & Contractor Fields
    concessionaire_id: Optional[str] = "CONC-APEX"
    concessionaire_name: Optional[str] = "Apex CleanTech"
    work_state: Optional[str] = "OPEN"
    before_image_url: Optional[str] = None
    after_image_url: Optional[str] = None
    arrived_at: Optional[datetime] = None
    cleared_at: Optional[datetime] = None
    dwell_duration_sec: Optional[int] = None
    cleaning_tipper_id: Optional[str] = None
    billing_credit_approved: Optional[bool] = False
    penalty_amount_inr: Optional[float] = 0.0
    is_redump_dispute: Optional[bool] = False
    redump_notes: Optional[str] = None
    
    first_sighting_at: datetime
    last_sighting_at: datetime
    sighting_count: int
    spotted_by_label: str
    last_device_id: str
    image_url: Optional[str] = None
    original_image_url: Optional[str] = None
    bbox_json: Optional[str] = None
    telegram_dispatched: bool = False
    telegram_dispatched_at: Optional[datetime] = None
    notes: Optional[str] = None
    created_at: datetime
    sightings: Optional[List[SightingResponse]] = []

class IncidentStatusUpdate(BaseModel):
    status: str = Field(..., description="NEEDS_ACTION, QRT_DISPATCHED, RESOLVED, FALSE_ALARM")
    notes: Optional[str] = None

class IncidentDispatchAction(BaseModel):
    department: Optional[str] = None
    custom_message: Optional[str] = None
    telegram_chat_id: Optional[str] = None

class TelemetryIngestResponse(BaseModel):
    incident_id: str
    is_duplicate: bool
    sighting_count: int
    defect_type: str
    title: str = ""
    assigned_department: str
    ward_id: Optional[str] = None
    ward_name: Optional[str] = None
    channel_sla: str
    telegram_dispatched: bool
    message: str
    image_url: Optional[str] = None
    confidence: float = 0.85
    slm_summary: Optional[str] = None
    landmark: Optional[str] = None
    latitude: float = 0.0
    longitude: float = 0.0

class ClosedLoopArrivalRequest(BaseModel):
    incident_id: str
    tipper_id: str
    latitude: float
    longitude: float

class ClosedLoopClosureRequest(BaseModel):
    incident_id: str
    tipper_id: str
    dwell_duration_sec: int = 180
    clean_confidence: float = 0.92
    residual_waste_detected: bool = False

class RedumpAppealRequest(BaseModel):
    incident_id: str
    concessionaire_id: str = "CONC-APEX"
    defense_notes: str

