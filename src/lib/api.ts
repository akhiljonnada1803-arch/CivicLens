import { Incident, ContractorAuditRecord } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export const api = {
  async getHealth() {
    try {
      const res = await fetch(`${API_BASE}/api/health`, { cache: "no-store" });
      if (!res.ok) throw new Error("Health check failed");
      return await res.json();
    } catch {
      return {
        status: "ONLINE",
        database: { status: "DISCONNECTED_USING_IN_MEMORY_FALLBACK" },
      };
    }
  },

  async getIncidents(severity?: string): Promise<Incident[]> {
    try {
      const url = severity
        ? `${API_BASE}/api/incidents?severity=${encodeURIComponent(severity)}`
        : `${API_BASE}/api/incidents`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch incidents");
      const data = await res.json();
      return data.incidents || [];
    } catch (e) {
      console.warn("Using local incident fallback:", e);
      return [
        {
          id: "inc-8841-gvmc",
          defect_type: "garbage_overflow",
          severity: "HIGH",
          title: "Garbage Overflow / Blackspot",
          slm_summary: "Roadside waste partially obstructing pedestrian carriage-way along market stretch.",
          latitude: 17.7225,
          longitude: 83.3045,
          landmark: "Main Market Road, Pillar 42",
          ward: "Ward 14 (Siripuram)",
          zone: "Zone 3 (Central)",
          source_fleet: "Fleet A (APSRTC Bus #12)",
          timestamp: new Date().toISOString(),
          sync_status: "SYNCED",
          status: "NEEDS_ACTION",
          concessionaire: "Apex CleanTech",
          bbox: [0.28, 0.42, 0.72, 0.85],
          image_url: "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80",
        },
        {
          id: "inc-8842-gvmc",
          defect_type: "open_manhole",
          severity: "CRITICAL",
          title: "Open Stormwater Manhole Hazard",
          slm_summary: "Uncovered sewer chamber opening in active traffic lane. Critical road safety hazard.",
          latitude: 17.7238,
          longitude: 83.3055,
          landmark: "Station Road Junction",
          ward: "Ward 14 (Siripuram)",
          zone: "Zone 3 (Central)",
          source_fleet: "Fleet A (Police PCR #04)",
          timestamp: new Date().toISOString(),
          sync_status: "SYNCED",
          status: "QRT_DISPATCHED",
          concessionaire: "Apex CleanTech",
          bbox: [0.42, 0.58, 0.58, 0.76],
          image_url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
        },
        {
          id: "inc-8843-gvmc",
          defect_type: "road_pothole",
          severity: "MEDIUM",
          title: "Carriageway Asphalt Pothole",
          slm_summary: "Fractured asphalt depression measuring 0.9m across on carriage-way shoulder.",
          latitude: 17.7248,
          longitude: 83.3068,
          landmark: "Siripuram Main Cross Road",
          ward: "Ward 14 (Siripuram)",
          zone: "Zone 3 (Central)",
          source_fleet: "Fleet A (APSRTC Bus #07)",
          timestamp: new Date().toISOString(),
          sync_status: "SYNCED",
          status: "NEEDS_ACTION",
          concessionaire: "Apex CleanTech",
          bbox: [0.35, 0.55, 0.65, 0.78],
          image_url: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
        },
      ];
    }
  },

  async getContractorAudits(): Promise<{
    concessionaire: string;
    active_tippers: number;
    clean_rate_pct: number;
    total_credits_inr: number;
    total_penalties_inr: number;
    audits: ContractorAuditRecord[];
  }> {
    try {
      const res = await fetch(`${API_BASE}/api/contractors/audit`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch contractor audits");
      return await res.json();
    } catch (e) {
      console.warn("Using local audit fallback:", e);
      return {
        concessionaire: "Apex CleanTech",
        active_tippers: 18,
        clean_rate_pct: 98.2,
        total_credits_inr: 245000.0,
        total_penalties_inr: 0.0,
        audits: [
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
        ],
      };
    }
  },

  async ingestTelemetry(payload: any) {
    const res = await fetch(`${API_BASE}/api/telemetry/ingest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Telemetry ingestion failed");
    return await res.json();
  },

  async submitDispute(payload: { job_id: string; incident_id: string; defense_notes: string }) {
    const res = await fetch(`${API_BASE}/api/contractors/dispute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Dispute submission failed");
    return await res.json();
  },
};

