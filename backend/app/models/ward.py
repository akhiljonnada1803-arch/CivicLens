from sqlalchemy import Column, String, Float, Integer, Text, DateTime, Boolean
from datetime import datetime
from app.database import Base

class Ward(Base):
    __tablename__ = "wards"

    id = Column(String(50), primary_key=True)  # e.g., "GVMC-W14"
    ward_number = Column(Integer, nullable=False, unique=True)
    name = Column(String(100), nullable=False)
    zone_id = Column(String(50), nullable=False)
    zone_name = Column(String(100), nullable=False)
    center_lat = Column(Float, nullable=False)
    center_lon = Column(Float, nullable=False)
    polygon_geojson = Column(Text, nullable=False) # JSON Polygon representation
    sanitary_inspector_name = Column(String(100), nullable=True)
    sanitary_inspector_phone = Column(String(50), nullable=True)
    telegram_chat_id = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class FleetVehicle(Base):
    __tablename__ = "fleet_vehicles"

    id = Column(String(50), primary_key=True) # e.g., "SWP-04"
    label = Column(String(100), nullable=False) # "Sweeper #04"
    vehicle_type = Column(String(50), nullable=False) # "SWEEPER", "TIPPER", "TRANSIT_BUS"
    registration_no = Column(String(50), nullable=False)
    ward_id = Column(String(50), nullable=False, default="GVMC-W14")
    
    # PRD v4.0: Fleet Bifurcation (Fleet A vs Fleet B)
    fleet_type = Column(String(50), nullable=False, default="FLEET_A_SCANNER") # FLEET_A_SCANNER, FLEET_B_CLEANER
    has_rear_camera = Column(Boolean, default=False) # True for Fleet B (Dual-lens setup)
    assigned_route_id = Column(String(100), default="Route #14B - Siripuram / Maddilapalem")
    concessionaire_name = Column(String(100), nullable=True, default="Apex CleanTech")
    
    current_lat = Column(Float, nullable=False)
    current_lon = Column(Float, nullable=False)
    speed_kmh = Column(Float, default=18.5)
    heading = Column(Float, default=90.0)
    battery_temp_c = Column(Float, default=36.5)
    thermal_state = Column(String(50), default="NORMAL") # NORMAL, THROTTLED, SLEEP
    status = Column(String(50), default="ACTIVE_PATROL") # ACTIVE_PATROL, IDLE, OFFLINE
    last_heartbeat = Column(DateTime, default=datetime.utcnow)

