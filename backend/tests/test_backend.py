import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine, SessionLocal
from app.models.incident import Incident, DefectType, IncidentStatus
from app.seed_data import seed_initial_data

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    seed_initial_data(db)
    db.close()
    yield

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "HEALTHY"

def test_list_incidents():
    response = client.get("/api/v1/incidents")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    # Check priority sorting (urgent safety appears first)
    assert data[0]["urgency"] in ["URGENT_SAFETY", "SANITATION_ROADS"]

def test_spatial_deduplication_engine():
    """
    PRD Section 5.2 - Test ST_DWithin Deduplication:
    Sending a second sighting within 15 meters for the same defect type
    must suppress alert, increment sighting_count, and return is_duplicate=True.
    """
    # 1. First Sighting: Garbage overflow at 17.7225, 83.3045
    res1 = client.post(
        "/api/v1/telemetry/incident",
        data={
            "device_id": "DEV-001",
            "lat": 17.722500,
            "lon": 83.304500,
            "defect_type": "garbage_overflow",
            "confidence": 0.88,
            "slm_summary": "Initial sighting of waste overflow."
        }
    )
    assert res1.status_code == 200
    data1 = res1.json()
    first_id = data1["incident_id"]

    # 2. Second Sighting: 5 meters away, same defect_type from another vehicle
    # 0.00004 deg approx 4.4 meters
    res2 = client.post(
        "/api/v1/telemetry/incident",
        data={
            "device_id": "DEV-002",
            "lat": 17.722540,
            "lon": 83.304500,
            "defect_type": "garbage_overflow",
            "confidence": 0.90,
            "slm_summary": "Second vehicle pass."
        }
    )
    assert res2.status_code == 200
    data2 = res2.json()

    # Must be recognized as duplicate
    assert data2["is_duplicate"] is True
    assert data2["incident_id"] == first_id
    assert data2["sighting_count"] >= 2
    assert data2["telegram_dispatched"] is False  # Suppressed!

def test_point_in_polygon_ward_resolver():
    """
    PRD Section 5.2 - Point-in-Polygon (PiP) Ward Resolver:
    Coordinates inside GVMC Ward 14 boundary must resolve to GVMC-W14 and Zone 3.
    """
    res = client.post(
        "/api/v1/telemetry/incident",
        data={
            "device_id": "DEV-003",
            "lat": 17.7230,
            "lon": 83.3050,
            "defect_type": "road_pothole",
            "confidence": 0.85
        }
    )
    assert res.status_code == 200
    data = res.json()
    assert data["ward_id"] == "GVMC-W14"
    assert "Ward 14" in data["ward_name"]

def test_multi_department_dispatch_matrix():
    """
    PRD Section 5.3 - Multi-Department Dispatch Matrix:
    - Open Manhole -> Water Supply & Sewerage Board (< 15 mins)
    - Vehicle Crash -> Traffic Police & 108 (< 5 secs)
    """
    res_manhole = client.post(
        "/api/v1/telemetry/incident",
        data={
            "device_id": "DEV-002",
            "lat": 17.7280,
            "lon": 83.3100,
            "defect_type": "open_manhole",
            "confidence": 0.95
        }
    )
    assert res_manhole.status_code == 200
    data_m = res_manhole.json()
    assert "Water Supply & Sewerage Board" in data_m["assigned_department"]
    assert "15 minutes" in data_m["channel_sla"]

def test_incident_status_update():
    incidents = client.get("/api/v1/incidents").json()
    test_id = incidents[0]["id"]

    patch_res = client.patch(
        f"/api/v1/incidents/{test_id}/status",
        json={"status": "RESOLVED", "notes": "Sanitation crew cleared site."}
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "RESOLVED"
    assert patch_res.json()["notes"] == "Sanitation crew cleared site."

def test_analytics_kpi_counters():
    res = client.get("/api/v1/analytics/stats")
    assert res.status_code == 200
    data = res.json()
    assert "urgent_safety_count" in data
    assert "sanitation_roads_count" in data
    assert "resolved_count" in data
    assert data["duplicate_suppression_pct"] >= 0
    assert data["estimated_capex_savings_inr"] > 10000000

