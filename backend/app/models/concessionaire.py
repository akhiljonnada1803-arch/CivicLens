import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime, Text
from app.database import Base

class Concessionaire(Base):
    __tablename__ = "concessionaires"

    id = Column(String(50), primary_key=True) # e.g. "CONC-APEX"
    name = Column(String(100), nullable=False) # e.g. "Apex CleanTech"
    contracted_zone = Column(String(100), nullable=False, default="Zone 3 (Central)")
    assigned_wards = Column(String(200), default="GVMC-W14, GVMC-W15")
    active_tippers = Column(Integer, default=18)
    clean_rate_pct = Column(Float, default=98.2)
    penalty_balance_inr = Column(Float, default=0.0)
    total_credits_inr = Column(Float, default=245000.0)
    contact_person = Column(String(100), default="M. Raghunath (Fleet Ops)")
    contact_phone = Column(String(50), default="+91 94401 88204")
    created_at = Column(DateTime, default=datetime.utcnow)
