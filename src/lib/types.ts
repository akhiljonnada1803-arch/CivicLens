export type SeverityLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "ROUTINE";

export interface Incident {
  id: string;
  defect_type: string;
  severity: SeverityLevel;
  title: string;
  slm_summary: string;
  latitude: number;
  longitude: number;
  landmark: string;
  ward: string;
  zone: string;
  source_fleet: string;
  timestamp: string;
  sync_status: string;
  status: "NEEDS_ACTION" | "QRT_DISPATCHED" | "RESOLVED" | "FALSE_ALARM";
  concessionaire: string;
  sighting_count?: number;
  bbox?: [number, number, number, number];
  image_url: string;
}

export interface ContractorAuditRecord {
  job_id: string;
  incident_id: string;
  concessionaire: string;
  route_id: string;
  vehicle_registration: string;
  landmark: string;
  latitude: number;
  longitude: number;
  before_photo_url: string;
  after_photo_url: string;
  arrival_time: string;
  closure_time: string;
  dwell_duration_sec: number;
  pull_forward_meters: number;
  rear_camera_confidence: number;
  work_state: "CLOSED_VERIFIED" | "FLAGGED_INCOMPLETE" | "DISPUTED_REDUMP";
  billing_credit_approved: boolean;
  credit_amount_inr: number;
  penalty_amount_inr: number;
  dispute_status?: string;
  defense_notes?: string;
}

export interface KPIData {
  unresolved_spills: number;
  active_fleets_total: number;
  fleet_a_scanners: number;
  fleet_b_cleaners: number;
  proof_compliance_rate: number;
  monthly_savings_inr: number;
}

