import uuid
from datetime import datetime
from enum import Enum
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class DefectType(str, Enum):
    GARBAGE_OVERFLOW = "garbage_overflow"
    ROAD_POTHOLE = "road_pothole"
    OPEN_MANHOLE = "open_manhole"
    EXTERNAL_ACCIDENT = "external_accident"
    ILLEGAL_BANNER = "illegal_banner"
    VEHICLE_CRASH = "vehicle_crash"
    FLEET_OVERSPEED = "fleet_overspeed"

class IncidentStatus(str, Enum):
    NEEDS_ACTION = "NEEDS_ACTION"
    QRT_DISPATCHED = "QRT_DISPATCHED"
    RESOLVED = "RESOLVED"
    FALSE_ALARM = "FALSE_ALARM"

class UrgencyLevel(str, Enum):
    URGENT_SAFETY = "URGENT_SAFETY"
    SANITATION_ROADS = "SANITATION_ROADS"
    ROUTINE = "ROUTINE"

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    defect_type = Column(String(50), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    status = Column(String(50), nullable=False, default=IncidentStatus.NEEDS_ACTION.value, index=True)
    urgency = Column(String(50), nullable=False, default=UrgencyLevel.SANITATION_ROADS.value, index=True)
    confidence = Column(Float, nullable=False, default=0.85)
    
    # On-Device SLM generated plain-English verification summary
    slm_summary = Column(Text, nullable=True)
    landmark = Column(String(255), nullable=True)
    
    # Coordinates
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    
    # Ward & Zone (Point-in-Polygon resolved)
    ward_id = Column(String(50), nullable=True, index=True)
    zone_id = Column(String(50), nullable=True)
    ward_name = Column(String(100), nullable=True)
    
    # Routing Matrix fields
    assigned_department = Column(String(100), nullable=False)
    channel_sla = Column(String(100), nullable=False)
    
    # Sighting details
    first_sighting_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    last_sighting_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    sighting_count = Column(Integer, default=1, nullable=False)
    spotted_by_label = Column(String(100), nullable=False, default="Sweeper #04")
    last_device_id = Column(String(100), nullable=False, default="DEV-001")
    
    # Visual Evidence
    image_url = Column(String(500), nullable=True)
    original_image_url = Column(String(500), nullable=True)
    bbox_json = Column(Text, nullable=True) # JSON list of bounding boxes
    
    # Telegram & Webhook dispatch tracking
    telegram_dispatched = Column(Boolean, default=False)
    telegram_dispatched_at = Column(DateTime, nullable=True)
    telegram_message_id = Column(String(100), nullable=True)
    
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    sightings = relationship("IncidentSighting", back_populates="incident", cascade="all, delete-orphan")

class IncidentSighting(Base):
    __tablename__ = "incident_sightings"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    incident_id = Column(String(36), ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False, index=True)
    device_id = Column(String(100), nullable=False)
    vehicle_label = Column(String(100), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    confidence = Column(Float, nullable=False)
    image_url = Column(String(500), nullable=True)

    incident = relationship("Incident", back_populates="sightings")

