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
