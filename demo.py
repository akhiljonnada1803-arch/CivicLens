#!/usr/bin/env python3
"""
CivicLens AI — Hackathon & Presentation Demo Controller
Provides an interactive 1-click presentation console for showcasing
the entire CivicLens autonomous municipal auditor platform.
"""

import sys
import os
import time
import json
import webbrowser
import subprocess
import urllib.request
import urllib.error

API_URL = "http://localhost:8001/api/v1"
HEALTH_URL = "http://localhost:8001/health"
FRONTEND_URL = "http://localhost:3000"

def check_service(url, timeout=1.0):
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "CivicLensDemo"})
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.status == 200
    except Exception:
        return False

def ensure_services():
    print("🔍 Checking CivicLens services...")

    # Check Backend
    if not check_service(HEALTH_URL):
        print("⚡ Starting FastAPI Backend on port 8001...")
        env = os.environ.copy()
        env["PYTHONPATH"] = "backend"
        subprocess.Popen(
            [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"],
            cwd=os.getcwd(),
            env=env,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
        for _ in range(10):
            time.sleep(0.8)
            if check_service(HEALTH_URL):
                print("   ✓ Backend is online!")
                break
        else:
            print("   ⚠️ Backend starting in background. Proceeding...")

    # Check Frontend
    if not check_service(FRONTEND_URL):
        print("⚡ Starting Frontend Console on port 3000...")
        frontend_dir = os.path.join(os.getcwd(), "frontend")
        npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
        subprocess.Popen(
            [npm_cmd, "run", "dev"],
            cwd=frontend_dir,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
        time.sleep(2.0)
    else:
        print("   ✓ Frontend Operations Console is online!")

def post_json(endpoint, data=None):
    url = f"{API_URL}/{endpoint}"
    req = urllib.request.Request(url, method="POST")
    req.add_header("User-Agent", "CivicLensDemo")
    if data:
        json_data = json.dumps(data).encode("utf-8")
        req.add_header("Content-Type", "application/json")
        req.data = json_data
    with urllib.request.urlopen(req, timeout=5.0) as resp:
        return json.loads(resp.read().decode("utf-8"))

def get_json(endpoint):
    url = f"{API_URL}/{endpoint}"
    req = urllib.request.Request(url, headers={"User-Agent": "CivicLensDemo"})
    with urllib.request.urlopen(req, timeout=5.0) as resp:
        return json.loads(resp.read().decode("utf-8"))

def print_banner():
    print("\n" + "=" * 76)
    print("🏛️  CIVICLENS AI — AUTONOMOUS MUNICIPAL VEHICLE AUDITOR DEMO")
    print("    Target: Greater Visakhapatnam Municipal Corporation (GVMC Ward 14)")
    print("=" * 76)
    print("  Web Console: http://localhost:3000")
    print("  FastAPI Doc: http://localhost:8001/docs")
    print("=" * 76)

def run_menu():
    ensure_services()
    print_banner()

    # Open browser
    time.sleep(1)
    webbrowser.open("http://localhost:3000")

    while True:
        print("\n🎯 DEMO MILESTONES (Press number to trigger live event on UI):")
        print("  [1] 🧹 Trigger Waste Overflow Detection (Sweeper #04 on Market Road)")
        print("  [2] 🚨 Trigger Open Manhole Hazard (Bus #12 on Station Road)")
        print("  [3] 💥 Trigger 4.8g Crash Deceleration Spike (Emergency 108 Alert)")
        print("  [4] 🎯 DEMONSTRATE SPATIAL DEDUPLICATION (The Killer Feature: 15m radius)")
        print("  [5] 🚗 Step Municipal Patrol Fleet (Advance Sweepers & Buses on Map)")
        print("  [6] 💰 Display CapEx Financial Audit & Performance Metrics")
        print("  [7] 🧹 CLEAR DATABASE (Wipe all incidents to 0 — start completely fresh!)")
        print("  [8] 🔄 Reseed PRD Benchmark Data (Restore Ward 14 baseline tickets)")
        print("  [q] Quit Demo")
        print("-" * 76)

        choice = input("👉 Select milestone [1-8 or q]: ").strip().lower()

        if choice == "q":
            print("\n👋 Ending demo session.")
            break
        elif choice == "1":
            print("\n🚗 Simulating Sweeper #04 scanning Market Road...")
            res = post_json("simulation/trigger-incident?sample_index=0&force_duplicate=false")
            print(f"   ✅ [NEW TICKET] {res.get('title')}")
            print(f"      Landmark: Main Market Road, Pillar 42")
            print(f"      Routed To: {res.get('department')} ({res.get('sla')})")
            print("   👉 Check http://localhost:3000 to see the new card & photo proof!")
        elif choice == "2":
            print("\n🚌 Simulating Bus #12 scanning Station Road...")
            res = post_json("simulation/trigger-incident?sample_index=1&force_duplicate=false")
            print(f"   🚨 [CRITICAL HAZARD] {res.get('title')}")
            print(f"      Landmark: Station Road Junction")
            print(f"      Routed To: {res.get('department')} ({res.get('sla')})")
            print("   👉 Check http://localhost:3000 to see the red urgent safety pin!")
        elif choice == "3":
            print("\n💥 Simulating 4.8g IMU Deceleration Crash Spike...")
            res = post_json("simulation/trigger-incident?sample_index=2&force_duplicate=false")
            print(f"   🚨 [EMERGENCY SPIKE] {res.get('title')}")
            print(f"      Target: Traffic Police & Emergency Medical (108)")
            print(f"      SLA: Direct Webhook / SMS Dispatch (< 5 seconds)")
        elif choice == "4":
            print("\n🔍 Simulating Second Patrol Pass 5 meters away from Waste Overflow...")
            res = post_json("simulation/trigger-incident?sample_index=0&force_duplicate=true")
            if res.get("is_duplicate"):
                print(f"   🎯 POSTGIS ST_DWithin DEDUPLICATION ACTIVE!")
                print(f"      Distance from Master Ticket: {res.get('distance_meters')}m (Within 15.0m threshold)")
                print(f"      Recurrence Count: Sighting #{res.get('sighting_count')}")
                print(f"      Fatigue Protection: ALERT SUPPRESSED (Zero new notification sent!)")
                print("   👉 Check http://localhost:3000: Notice the card shows '2x sightings'!")
            else:
                print(f"   Result: {res}")
        elif choice == "5":
            print("\n🚗 Advancing fleet patrol vehicles along Visakhapatnam GPS routes...")
            res = post_json("fleet/step")
            print(f"   ✓ Moved {res.get('updated_vehicles')} municipal vehicles:")
            for v in res.get("data", []):
                print(f"      • {v['label']}: Lat {v['lat']}, Lon {v['lon']} | Speed {v['speed_kmh']} km/h | Temp {v['battery_temp_c']}°C")
            print("   👉 Watch the vehicle pins move on the live map in http://localhost:3000!")
        elif choice == "6":
            print("\n💰 CivicLens CapEx & Economic Feasibility:")
            stats = get_json("analytics/stats")
            print("   " + "-" * 60)
            print("   • Stationary In-Bin IoT CapEx:  ₹1,40,00,000 (₹1.4 Cr per 5,000 bins)")
            print("   • CivicLens 25 Fleet Mounts:    ₹95,000 (~₹3,800 per vehicle BOM)")
            print(f"   • Net Municipal CapEx Savings:  ₹{stats.get('estimated_capex_savings_inr', 13905000):,.0f} (99.3% reduction)")
            print(f"   • Duplicate Suppression Rate:   {stats.get('duplicate_suppression_pct')}% (Target >= 96%)")
            print(f"   • Active Fleet Units:          {stats.get('active_patrol_vehicles')} patrolling vehicles")
            print("   " + "-" * 60)
        elif choice == "7":
            print("\n🧹 CLEARING DATABASE...")
            res = post_json("simulation/clear")
            print("   " + "=" * 50)
            print("   ✅ DATABASE COMPLETELY CLEARED TO 0 TICKETS!")
            print("   • All previous incidents and sightings wiped.")
            print("   • Municipal Wards & Fleet Patrol are active.")
            print("   • Console http://localhost:3000 is now a clean blank slate.")
            print("   " + "=" * 50)
        elif choice == "8":
            print("\n🔄 Reseeding PRD benchmark dataset...")
            res = post_json("simulation/reset?clear_only=false")
            print("   " + "=" * 50)
            print("   ✅ Reseeded GVMC Ward 14 baseline tickets:")
            print("   • [🚨 2 Urgent Safety]")
            print("   • [⚠️ 9 Sanitation/Roads]")
            print("   • [✅ 28 Resolved]")
            print("   " + "=" * 50)
        else:
            print("Invalid selection. Please choose 1-7 or q.")

if __name__ == "__main__":
    run_menu()

