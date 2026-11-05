import json
import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.ward import Ward, FleetVehicle
from app.models.incident import Incident, IncidentSighting, DefectType, IncidentStatus, UrgencyLevel
from app.models.concessionaire import Concessionaire
from app.services.storage_service import StorageService

def seed_initial_data(db: Session):
    """
    Seeds GVMC Ward 14, Zone 3, Fleet Vehicles, Concessionaires, and baseline incidents
    matching the PRD Version 4.0 Dual-Portal and Closed-Loop specifications.
    """
    # 1. Clear existing data
    db.query(IncidentSighting).delete()
    db.query(Incident).delete()
    db.query(FleetVehicle).delete()
    db.query(Ward).delete()
    db.query(Concessionaire).delete()
    db.commit()

    # 1.1 Seed Concessionaire (PRD Section 6.2)
    apex = Concessionaire(
        id="CONC-APEX",
        name="Apex CleanTech",
        contracted_zone="Zone 3 (Central)",
        assigned_wards="GVMC-W14, GVMC-W15",
        active_tippers=18,
        clean_rate_pct=98.2,
        penalty_balance_inr=0.0,
        total_credits_inr=245000.0,
        contact_person="M. Raghunath (Fleet Ops)",
        contact_phone="+91 94401 88204"
    )
    db.add(apex)
    db.commit()

    # 2. Seed Wards (GVMC Visakhapatnam)
    # GeoJSON Polygon for Ward 14 (Siripuram / Maddilapalem / Waltair)
    ward14_polygon = {
        "type": "Polygon",
        "coordinates": [[
            [83.2980, 17.7160],
            [83.3130, 17.7160],
            [83.3150, 17.7280],
            [83.3080, 17.7320],
            [83.2980, 17.7260],
            [83.2980, 17.7160]
        ]]
    }

    ward15_polygon = {
        "type": "Polygon",
        "coordinates": [[
            [83.3130, 17.7160],
            [83.3250, 17.7160],
            [83.3280, 17.7280],
            [83.3150, 17.7280],
            [83.3130, 17.7160]
        ]]
    }

    w14 = Ward(
        id="GVMC-W14",
        ward_number=14,
        name="Ward 14 (Siripuram & Maddilapalem)",
        zone_id="ZONE-03",
        zone_name="Zone 3 - Central Urban",
        center_lat=17.7225,
        center_lon=83.3045,
        polygon_geojson=json.dumps(ward14_polygon),
        sanitary_inspector_name="K. V. Ramana",
        sanitary_inspector_phone="+91 98480 22314",
        telegram_chat_id="@gvmc_ward14_sanitation"
    )

    w15 = Ward(
        id="GVMC-W15",
        ward_number=15,
        name="Ward 15 (AU Campus & Uplands)",
        zone_id="ZONE-03",
        zone_name="Zone 3 - Central Urban",
        center_lat=17.7260,
        center_lon=83.3180,
        polygon_geojson=json.dumps(ward15_polygon),
        sanitary_inspector_name="M. Srinivas Rao",
        sanitary_inspector_phone="+91 98480 33415",
        telegram_chat_id="@gvmc_ward15_sanitation"
    )

    db.add_all([w14, w15])
    db.commit()

    # 3. Seed Fleet Vehicles (PRD Section 1.2: Fleet A 'The Eyes' vs Fleet B 'The Hands')
    v1 = FleetVehicle(
        id="DEV-001",
        label="Sweeper #04",
        vehicle_type="SWEEPER",
        registration_no="AP 31 TX 4012",
        ward_id="GVMC-W14",
        fleet_type="FLEET_A_SCANNER",
        has_rear_camera=False,
        assigned_route_id="Route #14A - Siripuram",
        concessionaire_name="Apex CleanTech",
        current_lat=17.7225,
        current_lon=83.3045,
        speed_kmh=18.2,
        heading=45.0,
        battery_temp_c=36.8,
        thermal_state="NORMAL",
        status="ACTIVE_PATROL"
    )

    v2 = FleetVehicle(
        id="DEV-002",
        label="Transit Bus #12 (APSRTC)",
        vehicle_type="TRANSIT_BUS",
        registration_no="AP 31 Z 9821",
        ward_id="GVMC-W14",
        fleet_type="FLEET_A_SCANNER",
        has_rear_camera=False,
        assigned_route_id="APSRTC Route 10K - Siripuram / RTC Complex",
        concessionaire_name="APSRTC Urban Division",
        current_lat=17.7240,
        current_lon=83.3055,
        speed_kmh=27.5,
        heading=110.0,
        battery_temp_c=38.4,
        thermal_state="NORMAL",
        status="ACTIVE_PATROL"
    )

    v3 = FleetVehicle(
        id="DEV-003",
        label="Tipper #04 (Fleet B)",
        vehicle_type="TIPPER",
        registration_no="AP 31 TT 4402",
        ward_id="GVMC-W14",
        fleet_type="FLEET_B_CLEANER",
        has_rear_camera=True,
        assigned_route_id="Route #14B - Maddilapalem QRT",
        concessionaire_name="Apex CleanTech",
        current_lat=17.7212,
        current_lon=83.3078,
        speed_kmh=21.0,
        heading=190.0,
        battery_temp_c=39.2,
        thermal_state="NORMAL",
        status="ACTIVE_PATROL"
    )

    v4 = FleetVehicle(
        id="DEV-004",
        label="PCR Van #04",
        vehicle_type="ENFORCEMENT",
        registration_no="AP 31 P 0004",
        ward_id="GVMC-W14",
        fleet_type="FLEET_A_SCANNER",
        has_rear_camera=False,
        assigned_route_id="Sector 3 Police Patrol",
        concessionaire_name="Visakhapatnam City Police",
        current_lat=17.7250,
        current_lon=83.3030,
        speed_kmh=31.0,
        heading=270.0,
        battery_temp_c=35.6,
        thermal_state="NORMAL",
        status="ACTIVE_PATROL"
    )

    db.add_all([v1, v2, v3, v4])
    db.commit()

    # 4. Generate visual proof images for baseline incidents
    img_garbage_annot, img_garbage_orig, bbox_garbage = StorageService.save_and_annotate_image(
        None, "garbage_overflow", 0.88
    )
    img_manhole_annot, img_manhole_orig, bbox_manhole = StorageService.save_and_annotate_image(
        None, "open_manhole", 0.94
    )
    img_crash_annot, img_crash_orig, bbox_crash = StorageService.save_and_annotate_image(
        None, "vehicle_crash", 0.92
    )
    # Generate Before and After Proof for Closed Loop Showcase
    before_proof_url, after_proof_url = StorageService.generate_closed_loop_proof_images(
        tipper_id="AP-31-TT-4402",
        landmark="Main Market Road, Pillar 42"
    )

    now = datetime.utcnow()

    # Wireframe Item 1: Garbage Overflow (Main Market Road, Pillar 42)
    inc_garbage = Incident(
        defect_type=DefectType.GARBAGE_OVERFLOW.value,
        title="Garbage Overflow / Blackspot",
        status=IncidentStatus.NEEDS_ACTION.value,
        urgency=UrgencyLevel.SANITATION_ROADS.value,
        confidence=0.88,
        slm_summary="Roadside waste partially blocking pedestrian walkway on market stretch.",
        landmark="Main Market Road, Pillar 42",
        latitude=17.7225,
        longitude=83.3045,
        ward_id="GVMC-W14",
        zone_id="ZONE-03",
        ward_name="Ward 14 (Siripuram)",
        assigned_department="Public Health & Sanitation",
        channel_sla="Ward Sanitary Inspector Telegram Bot (< 2 hours)",
        concessionaire_id="CONC-APEX",
        concessionaire_name="Apex CleanTech",
        work_state="OPEN",
        first_sighting_at=now - timedelta(hours=3, minutes=45),
        last_sighting_at=now - timedelta(minutes=8),
        sighting_count=2,
        spotted_by_label="Bus #12 (Fleet A)",
        last_device_id="DEV-002",
        image_url=img_garbage_annot,
        original_image_url=img_garbage_orig,
        bbox_json=bbox_garbage,
        telegram_dispatched=True,
        telegram_dispatched_at=now - timedelta(minutes=7)
    )

    # Wireframe Item 2: Open Manhole (Station Road Junction)
    inc_manhole = Incident(
        defect_type=DefectType.OPEN_MANHOLE.value,
        title="Open Manhole Hazard",
        status=IncidentStatus.QRT_DISPATCHED.value,
        urgency=UrgencyLevel.URGENT_SAFETY.value,
        confidence=0.94,
        slm_summary="Uncovered stormwater drain chamber on active carriageway shoulder.",
        landmark="Station Road Junction",
        latitude=17.7238,
        longitude=83.3055,
        ward_id="GVMC-W14",
        zone_id="ZONE-03",
        ward_name="Ward 14 (Siripuram)",
        assigned_department="Water Supply & Sewerage Board",
        channel_sla="Emergency Dispatch Bot (< 15 minutes)",
        first_sighting_at=now - timedelta(minutes=14),
        last_sighting_at=now - timedelta(minutes=14),
        sighting_count=1,
        spotted_by_label="Bus #12",
        last_device_id="DEV-002",
        image_url=img_manhole_annot,
        original_image_url=img_manhole_orig,
        bbox_json=bbox_manhole,
        telegram_dispatched=True,
        telegram_dispatched_at=now - timedelta(minutes=13)
    )

    # Wireframe Item 3: Vehicle Collision (Bypass Flyover Descent)
    inc_collision = Incident(
        defect_type=DefectType.VEHICLE_CRASH.value,
        title="Vehicle Collision / Rollover Hazard",
        status=IncidentStatus.QRT_DISPATCHED.value,
        urgency=UrgencyLevel.URGENT_SAFETY.value,
        confidence=0.92,
        slm_summary="Car and motorized auto-rickshaw collision with rapid deceleration spike (4.6g).",
        landmark="Bypass Flyover Descent",
        latitude=17.7210,
        longitude=83.3075,
        ward_id="GVMC-W14",
        zone_id="ZONE-03",
        ward_name="Ward 14 (Siripuram)",
        assigned_department="Traffic Police & Emergency Medical (108)",
        channel_sla="Direct Webhook / SMS Dispatch (< 5 seconds)",
        first_sighting_at=now - timedelta(minutes=21),
        last_sighting_at=now - timedelta(minutes=21),
        sighting_count=1,
        spotted_by_label="Tipper #02",
        last_device_id="DEV-003",
        image_url=img_crash_annot,
        original_image_url=img_crash_orig,
        bbox_json=bbox_crash,
        telegram_dispatched=True,
        telegram_dispatched_at=now - timedelta(minutes=20)
    )

    # Closed-Loop Showcase Verified Job (PRD Section 6.2: Job #8841)
    inc_closed_loop = Incident(
        id="job-8841",
        defect_type=DefectType.GARBAGE_OVERFLOW.value,
        title="Garbage Overflow (Dual-Vision Verified)",
        status=IncidentStatus.RESOLVED.value,
        urgency=UrgencyLevel.SANITATION_ROADS.value,
        confidence=0.94,
        slm_summary="Autonomous dual-vision closed loop: Front camera detected trash; rear IP67 verified clean curb post 15m pull-forward.",
        landmark="Main Market Road, Pillar 42",
        latitude=17.7225,
        longitude=83.3045,
        ward_id="GVMC-W14",
        zone_id="ZONE-03",
        ward_name="Ward 14 (Siripuram)",
        assigned_department="Public Health & Sanitation",
        channel_sla="Ward Sanitary Inspector Telegram Bot (< 2 hours)",
        concessionaire_id="CONC-APEX",
        concessionaire_name="Apex CleanTech",
        work_state="CLOSED_VERIFIED",
        cleaning_tipper_id="AP-31-TT-4402",
        dwell_duration_sec=180,
        arrived_at=now - timedelta(minutes=6),
        cleared_at=now - timedelta(minutes=3),
        before_image_url=before_proof_url,
        after_image_url=after_proof_url,
        billing_credit_approved=True,
        penalty_amount_inr=0.0,
        first_sighting_at=now - timedelta(hours=1, minutes=15),
        last_sighting_at=now - timedelta(minutes=3),
        sighting_count=2,
        spotted_by_label="Bus #12 (Fleet A)",
        last_device_id="DEV-002",
        image_url=img_garbage_annot,
        original_image_url=img_garbage_orig,
        bbox_json=bbox_garbage,
        telegram_dispatched=True
    )

    db.add_all([inc_garbage, inc_manhole, inc_collision, inc_closed_loop])
    db.commit()

    # Add sightings for the 3 main items
    s1 = IncidentSighting(
        incident_id=inc_garbage.id,
        device_id="DEV-001",
        vehicle_label="Sweeper #04",
        timestamp=now - timedelta(hours=3, minutes=45),
        latitude=17.7224,
        longitude=83.3046,
        confidence=0.86,
        image_url=img_garbage_annot
    )
    s2 = IncidentSighting(
        incident_id=inc_garbage.id,
        device_id="DEV-001",
        vehicle_label="Sweeper #04",
        timestamp=now - timedelta(minutes=8),
        latitude=17.7225,
        longitude=83.3045,
        confidence=0.88,
        image_url=img_garbage_annot
    )
    s3 = IncidentSighting(
        incident_id=inc_manhole.id,
        device_id="DEV-002",
        vehicle_label="Bus #12",
        timestamp=now - timedelta(minutes=14),
        latitude=17.7238,
        longitude=83.3055,
        confidence=0.94,
        image_url=img_manhole_annot
    )
    s4 = IncidentSighting(
        incident_id=inc_collision.id,
        device_id="DEV-003",
        vehicle_label="Tipper #02",
        timestamp=now - timedelta(minutes=21),
        latitude=17.7210,
        longitude=83.3075,
        confidence=0.92,
        image_url=img_crash_annot
    )
    db.add_all([s1, s2, s3, s4])

    # Add additional sanitation/roads items to match "9 Sanitation/Roads" from Section 6 wireframe
    sanitation_spots = [
        ("Siripuram Circle Footpath", 17.7245, 83.3032, DefectType.ROAD_POTHOLE.value, "Roads & PWD Civil Wing", "Municipal Work Order Queue (48 hours)", "Sweeper #04"),
        ("Waltair Main Road Bus Shelter", 17.7258, 83.3065, DefectType.GARBAGE_OVERFLOW.value, "Public Health & Sanitation", "Ward Sanitary Inspector Telegram Bot (< 2 hours)", "Bus #12"),
        ("Maddilapalem Sub-way Entry", 17.7265, 83.3090, DefectType.ROAD_POTHOLE.value, "Roads & PWD Civil Wing", "Municipal Work Order Queue (48 hours)", "Tipper #02"),
        ("AU College Gate Road", 17.7272, 83.3115, DefectType.ILLEGAL_BANNER.value, "Town Planning & Advertisement Enforcement", "Enforcement Squad Queue (< 24 hours)", "Enforcement #01"),
        ("Beach Road Sector 3 Shoulder", 17.7195, 83.3035, DefectType.GARBAGE_OVERFLOW.value, "Public Health & Sanitation", "Ward Sanitary Inspector Telegram Bot (< 2 hours)", "Sweeper #04"),
        ("VIP Road Cross Intersection", 17.7218, 83.3020, DefectType.ROAD_POTHOLE.value, "Roads & PWD Civil Wing", "Municipal Work Order Queue (48 hours)", "Sweeper #04"),
        ("Old Post Office Lane", 17.7235, 83.3015, DefectType.ILLEGAL_BANNER.value, "Town Planning & Advertisement Enforcement", "Enforcement Squad Queue (< 24 hours)", "Enforcement #01"),
        ("Kailasagiri Approach Road", 17.7285, 83.3140, DefectType.ROAD_POTHOLE.value, "Roads & PWD Civil Wing", "Municipal Work Order Queue (48 hours)", "Bus #12")
    ]

    for spot_name, lat, lon, dtype, dept, sla, vehicle in sanitation_spots:
        inc = Incident(
            defect_type=dtype,
            title=dtype.replace("_", " ").title(),
            status=IncidentStatus.NEEDS_ACTION.value,
            urgency=UrgencyLevel.SANITATION_ROADS.value,
            confidence=0.82,
            slm_summary=f"Automated edge detection of {dtype.replace('_', ' ')} verified by vehicle edge AI.",
            landmark=spot_name,
            latitude=lat,
            longitude=lon,
            ward_id="GVMC-W14",
            zone_id="ZONE-03",
            ward_name="Ward 14 (Siripuram)",
            assigned_department=dept,
            channel_sla=sla,
            first_sighting_at=now - timedelta(hours=random.randint(1, 6)),
            last_sighting_at=now - timedelta(minutes=random.randint(10, 50)),
            sighting_count=random.randint(1, 3),
            spotted_by_label=vehicle,
            last_device_id="DEV-001",
            image_url=img_garbage_annot if "garbage" in dtype else img_crash_annot,
            original_image_url=img_garbage_orig,
            bbox_json=bbox_garbage,
            telegram_dispatched=True
        )
        db.add(inc)

    # Add 28 Resolved incidents matching the "✅ 28 Resolved" counter in wireframe
    for i in range(1, 29):
        res_inc = Incident(
            defect_type=random.choice([DefectType.GARBAGE_OVERFLOW.value, DefectType.ROAD_POTHOLE.value]),
            title=f"Resolved Issue #{i:02d}",
            status=IncidentStatus.RESOLVED.value,
            urgency=UrgencyLevel.SANITATION_ROADS.value,
            confidence=0.89,
            slm_summary="Inspected and cleared by departmental quick response team.",
            landmark=f"Ward 14 Sector {i % 6 + 1}",
            latitude=17.7200 + random.uniform(0.001, 0.009),
            longitude=83.3000 + random.uniform(0.001, 0.009),
            ward_id="GVMC-W14",
            zone_id="ZONE-03",
            ward_name="Ward 14 (Siripuram)",
            assigned_department="Public Health & Sanitation",
            channel_sla="Standard SLA (< 2 hours)",
            first_sighting_at=now - timedelta(days=random.randint(1, 3)),
            last_sighting_at=now - timedelta(hours=random.randint(3, 12)),
            sighting_count=random.randint(1, 4),
            spotted_by_label="Sweeper #04",
            last_device_id="DEV-001",
            image_url=img_garbage_annot,
            telegram_dispatched=True
        )
        db.add(res_inc)

    db.commit()
    print("Database seeded successfully with GVMC Ward 14 operational data.")
