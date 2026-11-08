import { NextResponse } from "next/server";
import { ContractorAuditRecord } from "@/lib/types";

export const dynamic = "force-dynamic";

const AUDIT_RECORDS: ContractorAuditRecord[] = [
  {
    job_id: "JOB-GVMC-8841",
    incident_id: "inc-8841-gvmc",
    concessionaire: "Apex CleanTech",
    route_id: "Route #14B - Siripuram",
    vehicle_registration: "AP-31-TT-4402",
    landmark: "Main Market Road, Pillar 42",
    latitude: 17.7225,
    longitude: 83.3045,
    before_photo_url: "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80",
    after_photo_url: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80",
    arrival_time: "1:41 PM",
    closure_time: "1:44 PM",
    dwell_duration_sec: 180,
    pull_forward_meters: 15.0,
    rear_camera_confidence: 0.94,
    work_state: "CLOSED_VERIFIED",
    billing_credit_approved: true,
    credit_amount_inr: 750.0,
    penalty_amount_inr: 0.0,
    dispute_status: "NONE",
  },
  {
    job_id: "JOB-GVMC-8839",
    incident_id: "inc-8839-gvmc",
    concessionaire: "Apex CleanTech",
    route_id: "Route #14A - Sector 4",
    vehicle_registration: "AP-31-TY-9912",
    landmark: "Sector 4 Commercial Corridor",
    latitude: 17.7245,
    longitude: 83.3080,
    before_photo_url: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80",
    after_photo_url: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80",
    arrival_time: "11:20 AM",
    closure_time: "11:20 AM",
    dwell_duration_sec: 8,
    pull_forward_meters: 0.0,
    rear_camera_confidence: 0.42,
    work_state: "FLAGGED_INCOMPLETE",
    billing_credit_approved: false,
    credit_amount_inr: 0.0,
    penalty_amount_inr: 5000.0,
    dispute_status: "PENALTY_LEVIED",
  },
  {
    job_id: "JOB-GVMC-8838",
    incident_id: "inc-8838-gvmc",
    concessionaire: "Apex CleanTech",
    route_id: "Route #14B - Maddilapalem",
    vehicle_registration: "AP-31-TT-4402",
    landmark: "Maddilapalem Sub-way Entry",
    latitude: 17.7265,
    longitude: 83.3090,
    before_photo_url: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80",
    after_photo_url: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80",
    arrival_time: "10:14 AM",
    closure_time: "10:18 AM",
    dwell_duration_sec: 240,
    pull_forward_meters: 15.0,
    rear_camera_confidence: 0.96,
    work_state: "CLOSED_VERIFIED",
    billing_credit_approved: true,
    credit_amount_inr: 750.0,
    penalty_amount_inr: 0.0,
    dispute_status: "NONE",
  }
];

export async function GET() {
  return NextResponse.json({
    concessionaire: "Apex CleanTech",
    active_tippers: 18,
    clean_rate_pct: 98.2,
    total_credits_inr: 245000.0,
    total_penalties_inr: 0.0,
    audits: AUDIT_RECORDS,
  });
}

