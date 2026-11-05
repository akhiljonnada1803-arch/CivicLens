#!/usr/bin/env python3
"""
CivicLens AI - Edge Device Simulator
Simulates a vehicle-mounted refurbished Android device running:
- CameraX 1 FPS analysis
- Thermal Governor (<40C normal, 40-45C throttled, >46C halt)
- Stationary pause (<3 km/h)
- 4.5g IMU deceleration spike detection
- On-device TFLite vision inference & SLM context validator
- Offline-first SQLite store-and-forward outbox queue
"""

import sys
import os
import time
import json
import sqlite3
import random
import io
from pathlib import Path
from datetime import datetime
from PIL import Image, ImageDraw

try:
    import requests
except ImportError:
    import urllib.request as urllib_req
    import urllib.parse as urllib_parse

API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8001/api/v1")
OUTBOX_DB_PATH = Path(__file__).resolve().parent / "edge_outbox.db"

# Realistic patrol route for Sweeper #04 in GVMC Ward 14
PATROL_WAYPOINTS = [
    {"lat": 17.7215, "lon": 83.3030, "landmark": "Main Market Entry", "speed": 18.0},
    {"lat": 17.7225, "lon": 83.3045, "landmark": "Main Market Road, Pillar 42", "speed": 16.5, "defect": "garbage_overflow"},
    {"lat": 17.7238, "lon": 83.3055, "landmark": "Station Road Junction", "speed": 14.0, "defect": "open_manhole"},
    {"lat": 17.7248, "lon": 83.3068, "landmark": "Siripuram Cross", "speed": 19.5, "defect": "road_pothole"},
    {"lat": 17.7210, "lon": 83.3075, "landmark": "Bypass Flyover Descent", "speed": 22.0, "defect": "vehicle_crash"},
    {"lat": 17.7255, "lon": 83.3080, "landmark": "AU College Gate", "speed": 20.0},
]

SLM_SUMMARIES = {
    "garbage_overflow": "Significant roadside waste overflow on lane shoulder, partially obstructing footpath.",
    "open_manhole": "Uncovered stormwater drain chamber on active carriage-way shoulder.",
    "road_pothole": "Deep crater defect on asphalt carriage-way, approximately 0.8m diameter.",
    "vehicle_crash": "Multi-vehicle collision with rapid deceleration spike (>4.5g)."
}

def init_edge_outbox():
    """Initializes Android Room Database equivalent in local SQLite."""
    conn = sqlite3.connect(OUTBOX_DB_PATH)
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS incident_outbox (
            incident_id TEXT PRIMARY KEY,
            timestamp INTEGER,
            latitude REAL,
            longitude REAL,
            defect_type TEXT,
            confidence REAL,
            slm_summary TEXT,
            image_blob BLOB,
            sync_status TEXT
        )
    """)
    conn.commit()
    conn.close()

def generate_mock_webp_frame(defect_type: str) -> bytes:
    """Generates a compressed 640x480 dashcam WebP image (~40 KB)."""
    img = Image.new("RGB", (640, 480), color=(135, 206, 235))
    draw = ImageDraw.Draw(img)
    # Asphalt
    draw.polygon([(0, 220), (640, 220), (640, 480), (0, 480)], fill=(50, 52, 55))
    # Lane dashes
    for y in range(240, 480, 40):
        draw.rectangle([(316, y), (324, y + 25)], fill=(245, 200, 30))
    # Watermark
    draw.text((15, 15), f"CivicLens Android Edge AI • {defect_type.upper()}", fill=(255, 255, 255))
    
    buf = io.BytesIO()
    img.save(buf, format="WEBP", quality=75)
    return buf.getvalue()

def send_telemetry_batch(lat: float, lon: float, defect_type: str, confidence: float, summary: str, is_offline: bool = False):
    """
    Simulates Android WorkManager Store-and-Forward sync logic (PRD Section 4).
    If offline, writes to SQLite outbox. If online, streams multipart batch to Backend.
    """
    image_bytes = generate_mock_webp_frame(defect_type)
    inc_uuid = f"edge-{int(time.time()*1000)}"

    if is_offline:
        conn = sqlite3.connect(OUTBOX_DB_PATH)
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO incident_outbox (incident_id, timestamp, latitude, longitude, defect_type, confidence, slm_summary, image_blob, sync_status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')
        """, (inc_uuid, int(time.time() * 1000), lat, lon, defect_type, confidence, summary, image_bytes))
        conn.commit()
        conn.close()
        print(f"📦 [OFFLINE STORE-AND-FORWARD] Network unavailable. Stored incident {inc_uuid} in Room DB outbox.")
        return False

    # Online mode: POST to /api/v1/telemetry/incident
    try:
        import requests
        files = {
            "evidence_image": ("dashcam_frame.webp", image_bytes, "image/webp")
        }
        data = {
            "device_id": "DEV-001",
            "lat": lat,
            "lon": lon,
            "defect_type": defect_type,
            "confidence": confidence,
            "slm_summary": summary
        }
        resp = requests.post(f"{API_BASE_URL}/telemetry/incident", data=data, files=files, timeout=4.0)
        if resp.status_code == 200:
            res_json = resp.json()
            is_dup = res_json.get("is_duplicate", False)
            cnt = res_json.get("sighting_count", 1)
            sla = res_json.get("channel_sla", "N/A")
            dept = res_json.get("assigned_department", "N/A")
            print(f"✅ [ONLINE DISPATCH HTTP 200] {'(Duplicate Sighting #' + str(cnt) + ' Suppressed)' if is_dup else 'NEW TICKET CREATED'}")
            print(f"   Department: {dept} | SLA: {sla}")
            print(f"   Device memory cleaned: purged {len(image_bytes)//1024} KB WebP frame.")
            return True
        else:
            print(f"❌ Server returned status {resp.status_code}: {resp.text}")
            return False
    except Exception as e:
        print(f"⚠️ Connection error: {e}. Storing to offline outbox.")
        return send_telemetry_batch(lat, lon, defect_type, confidence, summary, is_offline=True)

def flush_offline_outbox():
    """Flushes queued SQLite outbox records upon cellular network reconnection."""
    conn = sqlite3.connect(OUTBOX_DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT incident_id, latitude, longitude, defect_type, confidence, slm_summary, image_blob FROM incident_outbox WHERE sync_status = 'PENDING'")
    rows = cur.fetchall()

    if not rows:
        print("ℹ️ Outbox queue is empty. No pending store-and-forward incidents.")
        conn.close()
        return

    print(f"🔄 Flushing {len(rows)} pending incidents from SQLite outbox...")
    import requests
    for row in rows:
        inc_id, lat, lon, dtype, conf, summary, img_blob = row
        try:
            files = {"evidence_image": ("dashcam_frame.webp", img_blob, "image/webp")}
            data = {"device_id": "DEV-001", "lat": lat, "lon": lon, "defect_type": dtype, "confidence": conf, "slm_summary": summary}
            resp = requests.post(f"{API_BASE_URL}/telemetry/incident", data=data, files=files, timeout=4.0)
            if resp.status_code == 200:
                cur.execute("DELETE FROM incident_outbox WHERE incident_id = ?", (inc_id,))
                conn.commit()
                print(f"   ✓ Synced {inc_id} & purged local image.")
        except Exception as e:
            print(f"   ✗ Failed to sync {inc_id}: {e}")
            break
    conn.close()

def run_patrol_simulation(steps: int = 6, force_offline: bool = False):
    print("=" * 70)
    print("🚗 CivicLens Edge AI Simulator (Android 10+ CameraX + YOLOv8n + SLM)")
    print("   Vehicle: Sweeper #04 (DEV-001) | Municipality: GVMC Ward 14")
    print("=" * 70)
    init_edge_outbox()

    temperature = 37.2
    for i in range(steps):
        wp = PATROL_WAYPOINTS[i % len(PATROL_WAYPOINTS)]
        lat, lon = wp["lat"], wp["lon"]
        speed = wp["speed"]
        landmark = wp["landmark"]
        defect = wp.get("defect")

        # Thermal governor check (PRD 3.2)
        temperature += random.uniform(-0.2, 0.4)
        if temperature < 40.0:
            sample_rate = "1.5s (Standard)"
        elif 40.0 <= temperature <= 45.0:
            sample_rate = "4.0s (Throttled)"
        else:
            print(f"🔥 [THERMAL HALT] SoC Temp {temperature:.1f}°C > 46°C. Halting inference.")
            time.sleep(1)
            continue

        print(f"\n📍 Waypoint {i+1}/{steps}: {landmark} ({lat}, {lon})")
        print(f"   Speed: {speed} km/h | SoC Temp: {temperature:.1f}°C | Camera Cadence: {sample_rate}")

        # Stationary check (PRD 3.2)
        if speed < 3.0:
            print("   ⏸️ GNSS speed < 3 km/h. Camera inference paused to save battery.")
            continue

        if defect:
            conf = 0.88 if defect == "garbage_overflow" else 0.93
            summary = SLM_SUMMARIES.get(defect, "Automated municipal defect verification.")
            print(f"   🎯 [VISION HIT] YOLOv8n detected '{defect}' (Confidence: {int(conf*100)}%)")
            print(f"   🧠 [SLM VALIDATION] '{summary}'")
            send_telemetry_batch(lat, lon, defect, conf, summary, is_offline=force_offline)
        else:
            print("   ✨ Road clear. Frame dropped (Zero cellular data used).")

        time.sleep(1.0)

    print("\n🏁 Patrol simulation finished.")

if __name__ == "__main__":
    offline_flag = "--offline" in sys.argv
    flush_flag = "--flush" in sys.argv

    if flush_flag:
        flush_offline_outbox()
    else:
        run_patrol_simulation(steps=6, force_offline=offline_flag)

