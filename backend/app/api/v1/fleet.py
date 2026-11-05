from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.ward import FleetVehicle
from app.schemas.fleet_ward import FleetVehicleResponse
from app.services.simulation_service import SimulationService

router = APIRouter()

@router.get("", response_model=List[FleetVehicleResponse])
def get_fleet_vehicles(db: Session = Depends(get_db)):
    """
    Returns live fleet vehicles (Sweepers, Tippers, Transit Buses) with coordinates,
    speed, battery temperature, thermal throttling state, and online status.
    """
    return db.query(FleetVehicle).all()

@router.post("/step")
def step_fleet_patrol(db: Session = Depends(get_db)):
    """
    Advances fleet vehicles by one patrol simulation step along their municipal routes.
    """
    updated = SimulationService.step_fleet_vehicles(db)
    return {"status": "success", "updated_vehicles": len(updated), "data": updated}

