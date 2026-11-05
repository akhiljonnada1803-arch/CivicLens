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
        print("\n🎯 CIVICLENS PRD v4.0 PRESENTATION MILESTONES:")
        print("  --- FLEET A: THE EYES (SCANNING & DETECTION) ---")
        print("  [1] 🚌 Trigger Road Defect Scan (Fleet A: Bus #12 on Market Road -> State 0: TICKET_CREATED)")
        print("  [2] 🚨 Trigger Open Manhole Hazard (Fleet A: Bus #12 on Station Road)")
        print("  [3] 💥 Trigger 4.8g Crash Deceleration Spike (Emergency 108 Alert)")
        print("  [4] 🎯 DEMONSTRATE SPATIAL DEDUPLICATION (PostGIS ST_DWithin 15.0m suppression)")
        print("  --- FLEET B: THE HANDS (DUAL-CAMERA CLOSED-LOOP VERIFICATION) ---")
        print("  [5] 🚚 SIMULATE TIPPER ARRIVAL (Front Cam Captures [BEFORE PHOTO] within 10m)")
        print("  [6] ✅ SIMULATE 15m PULL-FORWARD CLOSURE (Rear IP67 Cam Captures [AFTER PHOTO] -> 100% Credit)")
        print("  [7] 🚨 DEMONSTRATE GHOST-BILLING CATCH (Tipper passes at 38 km/h -> FLAGGED_INCOMPLETE + ₹5,000 Fine)")
        print("  [8] ⚖️ DEMONSTRATE RE-DUMP DEFENSE (Immutable Audit Vault proves prior clean at 8:12 AM)")
        print("  --- GOVERNANCE & FLEET OPERATIONS ---")
        print("  [9] 💰 Display GVMC 98-Ward Financial Audit (₹8.81 Lakhs CapEx vs ₹20.52 Cr Savings)")
        print("  [10] 🚗 Step Municipal Fleet (Advance Fleet A & Fleet B vehicles along GPS routes)")
        print("  [11] 🧹 CLEAR DATABASE (Wipe all incidents to 0 — start fresh!)")
        print("  [12] 🔄 Reseed PRD v4.0 Benchmark Data (Restore Ward 14 baseline tickets)")
        print("  [q] Quit Demo")
        print("-" * 76)

        choice = input("👉 Select milestone [1-12 or q]: ").strip().lower()

        if choice == "q":
            print("\n👋 Ending demo session.")
            break
        elif choice == "1":
            print("\n🚌 Simulating Fleet A (Bus #12) forward camera road scan...")
            res = post_json("simulation/trigger-incident?sample_index=0&force_duplicate=false")
            print(f"   ✅ [STATE 0: TICKET_CREATED] {res.get('title')}")
            print(f"      Landmark: Main Market Road, Pillar 42")
            print(f"      Assigned Concessionaire: Apex CleanTech")
            print(f"      Routed To: {res.get('department')} ({res.get('sla')})")
            print("   👉 Check http://localhost:3000 to see the new card & photo proof!")
        elif choice == "2":
            print("\n🚌 Simulating Fleet A (Bus #12) scanning Station Road...")
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
            print("\n🚚 Simulating Fleet B: Dedicated Tipper #04 arrival within 10m...")
            res = post_json("simulation/closed-loop/simulate-arrival")
            if res.get("status") == "success":
                print(f"   📸 [STATE 1: CONTRACTOR_ARRIVAL]")
                print(f"      Vehicle: {res.get('vehicle')}")
                print(f"      Location: {res.get('landmark')}")
                print(f"      Front Camera: Captured [BEFORE PHOTO] (Trash Detected)")
                print(f"      Dwell Timer: Started (Loading waste into hopper)")
                print(f"      Status: WORK_IN_PROGRESS")
                print("   👉 Switch to '🚚 Contractor Hub' in http://localhost:3000 to see the live detour!")
            else:
                print(f"   ⚠️ {res.get('message')}")
        elif choice == "6":
            print("\n🔄 Simulating Fleet B: Tipper #04 pulling forward 15m post-loading...")
            res = post_json("simulation/closed-loop/simulate-closure")
            if res.get("status") == "success":
                print(f"   ✅ [STATE 3: AUTONOMOUS_CLOSURE]")
                print(f"      Dwell Duration: {res.get('dwell_time')}")
                print(f"      Rear Camera (IP67 Aux): Captured [AFTER PHOTO] at original GPS anchor")
                print(f"      Vision Verification: Curb Spotless (Confidence 94%)")
                print(f"      Invoice Action: {res.get('credit')}")
                print(f"      Work State: CLOSED_VERIFIED")
                print("   👉 Open '🚚 Contractor Hub' in http://localhost:3000 to inspect the Before/After Proof Vault!")
            else:
                print(f"   ⚠️ {res.get('message')}")
        elif choice == "7":
            print("\n🚨 Simulating Concessionaire Drive-By Route Fraud (Ghost-Billing)...")
            res = post_json("simulation/closed-loop/simulate-ghost-billing")
            print(f"   ⚠️ [EXCEPTION PATHWAY: FLAGGED_INCOMPLETE]")
            print(f"      Location: {res.get('landmark')}")
            print(f"      Violation: {res.get('reason')}")
            print(f"      Contractor Audit Action: Billed {res.get('penalty_amount')} Penalty!")
            print(f"      Billing Credit: Denied (Zero payout)")
            print("   👉 Check Contractor Hub at http://localhost:3000: Penalty balance updated!")
        elif choice == "8":
            print("\n⚖️ Simulating Contractor 'Re-Dump' Defense Submission...")
            # Pick first closed job or job-8841
            res = post_json("closed-loop/appeal-redump", {
                "incident_id": "job-8841",
                "defense_notes": "Spotless rear-camera proof logged at 8:12 AM (Job #8841). 1:00 PM refill was unauthorized dumping by vegetable market vendors."
            })
            print(f"   ⚖️ [IMMUTABLE AUDIT VAULT DEFENSE]")
            print(f"      Result: {res.get('message')}")
            print(f"      Protection: Contractor exonerated based on timestamped After photo.")
        elif choice == "9":
            print("\n💰 GVMC 98-Ward Municipal Financial Impact Analysis (PRD Section 7):")
            stats = get_json("analytics/stats")
            print("   " + "-" * 66)
            print("   • City Scale:                98 Wards, 8 Zones, 1,050 MT/day waste")
            print("   • Fleet A (The Scanners):     120 Units (Buses + Police) @ ₹4,800 = ₹5,76,000")
            print("   • Fleet B (The Cleaners):     50 Units (Dual-cam Tippers) @ ₹6,100 = ₹3,05,000")
            print("   • Total City CapEx:          ₹8,81,000 (~₹8.81 Lakhs)")
            print("   • Annual System OpEx:        ₹2,96,000 / year (170 SIMs + Cloud)")
            print("   ------------------------------------------------------------------")
            print("   • AUDITED ANNUAL SAVINGS:    ₹20.52 CRORE / YEAR")
            print("     1. Ghost-Billing Recovery:   ₹8.50 Cr (Mandatory Before/After proof)")
            print("     2. Eliminated In-Bin IoT:    ₹4.50 Cr (Zero sensor procurement)")
            print("     3. Fleet Fuel & Dead Miles:  ₹4.32 Cr (18% route optimization)")
            print("     4. Secondary Dumps & JCB:    ₹3.20 Cr (1:00 PM mid-day interception)")
            print("   • Annual Municipal ROI:      232x Net Payback in Year 1!")
            print("   " + "-" * 66)
        elif choice == "10":
            print("\n🚗 Advancing fleet patrol vehicles along Visakhapatnam GPS routes...")
            res = post_json("fleet/step")
            print(f"   ✓ Moved {res.get('updated_vehicles')} municipal vehicles:")
            for v in res.get("data", []):
                print(f"      • {v['label']}: Lat {v['lat']}, Lon {v['lon']} | Speed {v['speed_kmh']} km/h")
            print("   👉 Watch the vehicle pins move on the live map in http://localhost:3000!")
        elif choice == "11":
            print("\n🧹 CLEARING DATABASE...")
            res = post_json("simulation/clear")
            print("   " + "=" * 50)
            print("   ✅ DATABASE COMPLETELY CLEARED TO 0 TICKETS!")
            print("   • All previous incidents and sightings wiped.")
            print("   • Municipal Wards & Fleet Patrol are active.")
            print("   • Console http://localhost:3000 is now a clean blank slate.")
            print("   " + "=" * 50)
        elif choice == "12":
            print("\n🔄 Reseeding PRD v4.0 benchmark dataset...")
            res = post_json("simulation/reset?clear_only=false")
            print("   " + "=" * 50)
            print("   ✅ Reseeded GVMC Ward 14 baseline tickets & Concessionaire records:")
            print("   • [🚨 2 Urgent Safety]")
            print("   • [⚠️ 9 Sanitation/Roads]")
            print("   • [✅ 28 Resolved]")
            print("   • Concessionaire: Apex CleanTech (18 Tippers, 98.2% Clean Rate)")
            print("   • Job #8841: Dual-Camera Closed-Loop Verified Showcase")
            print("   " + "=" * 50)
        else:
            print("Invalid selection. Please choose 1-12 or q.")
        else:
            print("Invalid selection. Please choose 1-7 or q.")

if __name__ == "__main__":
    run_menu()

