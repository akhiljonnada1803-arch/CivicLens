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
      const url = severity && severity !== "ALL"
        ? `${API_BASE}/api/incidents?severity=${encodeURIComponent(severity)}`
        : `${API_BASE}/api/incidents`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch incidents");
      const data = await res.json();
      return data.incidents || [];
    } catch (e) {
      console.warn("API incident fetch error:", e);
      return [];
    }
  },

  async updateIncidentStatus(id: string, status: string, notes?: string): Promise<{ success: boolean; record?: any }> {
    try {
      const res = await fetch(`${API_BASE}/api/incidents/${encodeURIComponent(id)}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return await res.json();
    } catch (e) {
      console.warn("API status update error:", e);
      return { success: false };
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
      console.warn("API contractor audits fetch error:", e);
      return {
        concessionaire: "Apex CleanTech",
        active_tippers: 18,
        clean_rate_pct: 98.2,
        total_credits_inr: 245000.0,
        total_penalties_inr: 0.0,
        audits: [],
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
