import random
import math
from datetime import datetime
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.ward import FleetVehicle, Ward

# Real coordinates inside GVMC Ward 14 & Zone 3 (Siripuram, Maddilapalem, AU Campus, Visakhapatnam)
# Center approx: 17.7225° N, 83.3045° E
WAYPOINT_ROUTES = {
    "SWP-04": [
        (17.7215, 83.3030),
        (17.7225, 83.3045), # Near Main Market Road, Pillar 42
        (17.7240, 83.3060),
        (17.7255, 83.3075),
        (17.7248, 83.3090),
        (17.7230, 83.3070),
        (17.7215, 83.3050),
    ],
    "BUS-12": [
        (17.7260, 83.3010),
        (17.7245, 83.3035),
        (17.7225, 83.3055), # Near Station Road Junction
        (17.7205, 83.3080),
        (17.7190, 83.3105),
        (17.7210, 83.3085),
        (17.7235, 83.3050),
    ],
    "TIP-02": [
        (17.7180, 83.3020),
        (17.7195, 83.3045),
        (17.7210, 83.3065),
        (17.7228, 83.3085), # Near Bypass Flyover Descent
        (17.7240, 83.3110),
        (17.7220, 83.3075),
        (17.7195, 83.3040),
    ],
    "ENF-01": [
        (17.7250, 83.3050),
        (17.7230, 83.3030),
        (17.7210, 83.3015),
        (17.7235, 83.3040),
        (17.7260, 83.3070),
    ]
}

class SimulationService:
    @staticmethod
    def step_fleet_vehicles(db: Session) -> List[Dict[str, Any]]:
        """
        Advances all active fleet vehicles along their municipal patrol waypoints,
        simulating real GPS drift, vehicle speed, and thermal governor checks (PRD 3.2).
        """
        vehicles = db.query(FleetVehicle).all()
        updated = []

        for v in vehicles:
            route = WAYPOINT_ROUTES.get(v.id, WAYPOINT_ROUTES["SWP-04"])
            
            # Find closest waypoint in route
            min_dist = float("inf")
            curr_idx = 0
            for i, (wlat, wlon) in enumerate(route):
                dist = math.hypot(v.current_lat - wlat, v.current_lon - wlon)
                if dist < min_dist:
                    min_dist = dist
                    curr_idx = i

            # Move towards next waypoint with realistic jitter
            next_idx = (curr_idx + 1) % len(route)
            target_lat, target_lon = route[next_idx]

            # Step towards target
            step_factor = 0.25
            new_lat = v.current_lat + (target_lat - v.current_lat) * step_factor + random.uniform(-0.00008, 0.00008)
            new_lon = v.current_lon + (target_lon - v.current_lon) * step_factor + random.uniform(-0.00008, 0.00008)

            # Thermal logic (PRD 3.2: <40C normal, 40-45C throttled, >46C halt)
            # Slight random thermal drift
            temp = max(35.0, min(47.0, v.battery_temp_c + random.uniform(-0.3, 0.4)))
            if temp < 40.0:
                thermal_state = "NORMAL"
                status = "ACTIVE_PATROL"
                speed = random.uniform(15.0, 24.0)
            elif 40.0 <= temp <= 45.0:
                thermal_state = "THROTTLED"
                status = "ACTIVE_PATROL"
                speed = random.uniform(8.0, 14.0)
            else:
                thermal_state = "HALTED_THERMAL"
                status = "IDLE"
                speed = 0.0

            v.current_lat = round(new_lat, 6)
            v.current_lon = round(new_lon, 6)
            v.battery_temp_c = round(temp, 1)
            v.thermal_state = thermal_state
            v.status = status
            v.speed_kmh = round(speed, 1)
            v.last_heartbeat = datetime.utcnow()

            updated.append({
                "id": v.id,
                "label": v.label,
                "lat": v.current_lat,
                "lon": v.current_lon,
                "speed_kmh": v.speed_kmh,
                "battery_temp_c": v.battery_temp_c,
                "thermal_state": v.thermal_state,
                "status": v.status
            })

        db.commit()
        return updated

