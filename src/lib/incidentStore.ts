import { Incident } from "./types";

export const BENCHMARK_INCIDENTS: Incident[] = [
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
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
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
    timestamp: new Date(Date.now() - 42 * 60000).toISOString(),
    sync_status: "SYNCED",
    status: "NEEDS_ACTION",
    concessionaire: "Apex CleanTech",
    bbox: [0.35, 0.55, 0.65, 0.78],
    image_url: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "inc-8844-gvmc",
    defect_type: "vehicle_crash",
    severity: "CRITICAL",
    title: "Vehicle Collision & Rollover Spike",
    slm_summary: "Multi-vehicle collision with moderate debris causing lane bottleneck on flyover descent.",
    latitude: 17.7210,
    longitude: 83.3075,
    landmark: "Bypass Flyover Descent",
    ward: "Ward 14 (Siripuram)",
    zone: "Zone 3 (Central)",
    source_fleet: "Fleet B (Tipper #02 IMU: 4.8g)",
    timestamp: new Date(Date.now() - 75 * 60000).toISOString(),
    sync_status: "SYNCED",
    status: "QRT_DISPATCHED",
    concessionaire: "Apex CleanTech",
    bbox: [0.38, 0.52, 0.62, 0.75],
    image_url: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "inc-8845-gvmc",
    defect_type: "garbage_overflow",
    severity: "HIGH",
    title: "Market Waste Overflow (Sector 4)",
    slm_summary: "High-density secondary waste dump spilling into active two-wheeler lane.",
    latitude: 17.7265,
    longitude: 83.3090,
    landmark: "Maddilapalem Sub-way Entry",
    ward: "Ward 14 (Siripuram)",
    zone: "Zone 3 (Central)",
    source_fleet: "Fleet A (Transit Bus #12)",
    timestamp: new Date(Date.now() - 95 * 60000).toISOString(),
    sync_status: "SYNCED",
    status: "NEEDS_ACTION",
    concessionaire: "Apex CleanTech",
    bbox: [0.28, 0.42, 0.72, 0.85],
    image_url: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "inc-8846-gvmc",
    defect_type: "garbage_overflow",
    severity: "HIGH",
    title: "Waltair Bus Shelter Spill",
    slm_summary: "Overflowing commercial litter bins on transit sidewalk.",
    latitude: 17.7258,
    longitude: 83.3065,
    landmark: "Waltair Main Road Bus Shelter",
    ward: "Ward 14 (Siripuram)",
    zone: "Zone 3 (Central)",
    source_fleet: "Fleet A (Police PCR #04)",
    timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
    sync_status: "SYNCED",
    status: "NEEDS_ACTION",
    concessionaire: "Apex CleanTech",
    bbox: [0.30, 0.45, 0.70, 0.85],
    image_url: "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80",
  }
];

// In-memory runtime store
let memoryIncidents: Incident[] = [...BENCHMARK_INCIDENTS];

export function getStoredIncidents(severity?: string | null): Incident[] {
  if (severity && severity !== "ALL") {
    return memoryIncidents.filter((inc) => inc.severity.toUpperCase() === severity.toUpperCase());
  }
  return memoryIncidents;
}

export function updateStoredIncidentStatus(id: string, status: any): Incident | null {
  const index = memoryIncidents.findIndex((i) => i.id === id);
  if (index !== -1) {
    memoryIncidents[index] = {
      ...memoryIncidents[index],
      status: status,
    };
    return memoryIncidents[index];
  }
  return null;
}

export function addStoredIncident(incident: Incident): Incident {
  memoryIncidents = [incident, ...memoryIncidents];
  return incident;
}

export function resetStoredIncidents(): Incident[] {
  memoryIncidents = [...BENCHMARK_INCIDENTS];
  return memoryIncidents;
}
