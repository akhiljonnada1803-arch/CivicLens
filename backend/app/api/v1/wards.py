from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.ward import Ward
from app.schemas.fleet_ward import WardResponse

router = APIRouter()

@router.get("", response_model=List[WardResponse])
def get_wards(db: Session = Depends(get_db)):
    """
    Returns all registered wards with polygon boundaries for GIS map rendering.
    """
    return db.query(Ward).all()

@router.get("/{ward_id}", response_model=WardResponse)
def get_ward_by_id(ward_id: str, db: Session = Depends(get_db)):
    ward = db.query(Ward).filter(Ward.id == ward_id).first()
    if not ward:
        raise HTTPException(status_code=404, detail="Ward not found")
    return ward

