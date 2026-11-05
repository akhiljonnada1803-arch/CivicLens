import { Incident, Ward, FleetVehicle, AnalyticsStats, IncidentStatus } from '../types';

const API_BASE = '/api/v1';

export const api = {
  async getIncidents(params?: {
    ward_id?: string;
    zone_id?: string;
    defect_type?: string;
    status?: string;
    urgency?: string;
    search?: string;
  }): Promise<Incident[]> {
    const query = new URLSearchParams();
    if (params?.ward_id) query.append('ward_id', params.ward_id);
    if (params?.zone_id) query.append('zone_id', params.zone_id);
    if (params?.defect_type) query.append('defect_type', params.defect_type);
    if (params?.status) query.append('status', params.status);
    if (params?.urgency) query.append('urgency', params.urgency);
    if (params?.search) query.append('search', params.search);

    const res = await fetch(`${API_BASE}/incidents?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch incidents');
    return res.json();
  },

  async getIncidentById(id: string): Promise<Incident> {
    const res = await fetch(`${API_BASE}/incidents/${id}`);
    if (!res.ok) throw new Error('Failed to fetch incident');
    return res.json();
  },

  async updateIncidentStatus(id: string, status: IncidentStatus, notes?: string): Promise<Incident> {
    const res = await fetch(`${API_BASE}/incidents/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes })
    });
    if (!res.ok) throw new Error('Failed to update status');
    return res.json();
  },

  async dispatchIncident(id: string, customMessage?: string): Promise<Incident> {
    const res = await fetch(`${API_BASE}/incidents/${id}/dispatch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ custom_message: customMessage })
    });
    if (!res.ok) throw new Error('Failed to dispatch incident');
    return res.json();
  },

  async getWards(): Promise<Ward[]> {
    const res = await fetch(`${API_BASE}/wards`);
    if (!res.ok) throw new Error('Failed to fetch wards');
    return res.json();
  },

  async getFleet(): Promise<FleetVehicle[]> {
    const res = await fetch(`${API_BASE}/fleet`);
    if (!res.ok) throw new Error('Failed to fetch fleet vehicles');
    return res.json();
  },

  async stepFleet(): Promise<any> {
    const res = await fetch(`${API_BASE}/fleet/step`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to step fleet');
    return res.json();
  },

  async getStats(): Promise<AnalyticsStats> {
    const res = await fetch(`${API_BASE}/analytics/stats`);
    if (!res.ok) throw new Error('Failed to fetch statistics');
    return res.json();
  },

  async triggerSimulationIncident(sampleIndex: number, forceDuplicate = false): Promise<any> {
    const res = await fetch(
      `${API_BASE}/simulation/trigger-incident?sample_index=${sampleIndex}&force_duplicate=${forceDuplicate}`,
      { method: 'POST' }
    );
    if (!res.ok) throw new Error('Failed to trigger simulation');
    return res.json();
  },

  async resetData(): Promise<any> {
    const res = await fetch(`${API_BASE}/simulation/reset?clear_only=false`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset data');
    return res.json();
  },

  async clearData(): Promise<any> {
    const res = await fetch(`${API_BASE}/simulation/clear`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to clear database');
    return res.json();
  }
};

