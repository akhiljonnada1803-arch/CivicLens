export type DefectType = 
  | 'garbage_overflow'
  | 'road_pothole'
  | 'open_manhole'
  | 'external_accident'
  | 'illegal_banner'
  | 'vehicle_crash'
  | 'fleet_overspeed';

export type IncidentStatus = 
  | 'NEEDS_ACTION'
  | 'QRT_DISPATCHED'
  | 'RESOLVED'
  | 'FALSE_ALARM';

export type UrgencyLevel = 
  | 'URGENT_SAFETY'
  | 'SANITATION_ROADS'
  | 'ROUTINE';

export interface Sighting {
  id: string;
  device_id: string;
  vehicle_label: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  confidence: number;
  image_url?: string;
}

export interface Incident {
  id: string;
  defect_type: DefectType | string;
  title: string;
  status: IncidentStatus;
  urgency: UrgencyLevel;
  confidence: number;
  slm_summary?: string;
  landmark?: string;
  latitude: number;
  longitude: number;
  ward_id?: string;
  zone_id?: string;
  ward_name?: string;
  assigned_department: string;
  channel_sla: string;
  first_sighting_at: string;
  last_sighting_at: string;
  sighting_count: number;
  spotted_by_label: string;
  last_device_id: string;
  image_url?: string;
  original_image_url?: string;
  bbox_json?: string;
  telegram_dispatched: boolean;
  telegram_dispatched_at?: string;
  notes?: string;
  created_at: string;
  sightings?: Sighting[];
}

export interface Ward {
  id: string;
  ward_number: number;
  name: string;
  zone_id: string;
  zone_name: string;
  center_lat: number;
  center_lon: number;
  polygon_geojson: string;
  sanitary_inspector_name?: string;
  sanitary_inspector_phone?: string;
  telegram_chat_id?: string;
}

export interface FleetVehicle {
  id: string;
  label: string;
  vehicle_type: 'SWEEPER' | 'TIPPER' | 'TRANSIT_BUS' | 'ENFORCEMENT';
  registration_no: string;
  ward_id: string;
  current_lat: number;
  current_lon: number;
  speed_kmh: number;
  heading: number;
  battery_temp_c: number;
  thermal_state: 'NORMAL' | 'THROTTLED' | 'HALTED_THERMAL';
  status: 'ACTIVE_PATROL' | 'IDLE' | 'OFFLINE';
  last_heartbeat: string;
}

export interface AnalyticsStats {
  urgent_safety_count: number;
  sanitation_roads_count: number;
  resolved_count: number;
  total_active_incidents: number;
  total_sightings_logged: number;
  suppressed_duplicates: number;
  duplicate_suppression_pct: number;
  estimated_capex_savings_inr: number;
  active_patrol_vehicles: number;
  ward_breakdown: Record<string, number>;
}

