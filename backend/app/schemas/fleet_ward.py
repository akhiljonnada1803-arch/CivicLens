from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict

class WardResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    ward_number: int
    name: str
    zone_id: str
    zone_name: str
    center_lat: float
    center_lon: float
    polygon_geojson: str
    sanitary_inspector_name: Optional[str] = None
    sanitary_inspector_phone: Optional[str] = None
    telegram_chat_id: Optional[str] = None

class FleetVehicleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    label: str
    vehicle_type: str
    registration_no: str
    ward_id: str
    current_lat: float
    current_lon: float
    speed_kmh: float
    heading: float
    battery_temp_c: float
    thermal_state: str
    status: str
    last_heartbeat: datetime

class AnalyticsStatsResponse(BaseModel):
    urgent_safety_count: int
    sanitation_roads_count: int
    resolved_count: int
    total_active_incidents: int
    total_sightings_logged: int
    suppressed_duplicates: int
    duplicate_suppression_pct: float
    estimated_capex_savings_inr: float
    active_patrol_vehicles: int
    ward_breakdown: Dict[str, int]
