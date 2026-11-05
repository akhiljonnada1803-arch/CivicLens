import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import engine, Base, SessionLocal
from app.api.v1 import api_router
from app.models.ward import Ward
from app.seed_data import seed_initial_data

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create DB tables
    Base.metadata.create_all(bind=engine)
    
    # Auto-seed if database is newly initialized
    db = SessionLocal()
    try:
        ward_count = db.query(Ward).count()
        if ward_count == 0:
            print("No wards found. Initializing seed data for GVMC Ward 14...")
            seed_initial_data(db)
    finally:
        db.close()
        
    yield

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="CivicLens AI: Municipal Vehicle Edge AI & Spatial GIS Incident Ingestion Gateway",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploaded evidence image directory
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include API v1 router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "system": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "target": settings.DEFAULT_MUNICIPALITY,
        "ward": settings.DEFAULT_WARD,
        "status": "ONLINE",
        "docs_url": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "HEALTHY", "version": settings.APP_VERSION}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8001, reload=True)

