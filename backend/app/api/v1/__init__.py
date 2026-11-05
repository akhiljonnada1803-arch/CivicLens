from fastapi import APIRouter
from app.api.v1.telemetry import router as telemetry_router
from app.api.v1.incidents import router as incidents_router
from app.api.v1.wards import router as wards_router
from app.api.v1.fleet import router as fleet_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.simulation import router as simulation_router

api_router = APIRouter()

api_router.include_router(telemetry_router, prefix="/telemetry", tags=["Edge Telemetry Ingestion"])
api_router.include_router(incidents_router, prefix="/incidents", tags=["Incidents Operations"])
api_router.include_router(wards_router, prefix="/wards", tags=["Municipal GIS Wards"])
api_router.include_router(fleet_router, prefix="/fleet", tags=["Fleet & Hardware Tracking"])
api_router.include_router(analytics_router, prefix="/analytics", tags=["Performance & CapEx Analytics"])
api_router.include_router(simulation_router, prefix="/simulation", tags=["Edge Patrol Simulator"])

