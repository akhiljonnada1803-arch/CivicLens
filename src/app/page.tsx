"use client";

import React, { useState, useEffect } from "react";
import { KPICards } from "@/components/KPICards";
import { MunicipalDesk } from "@/components/MunicipalDesk";
import { ProofVault } from "@/components/ProofVault";
import { api } from "@/lib/api";
import { Incident, KPIData } from "@/lib/types";
import {
  ShieldAlert,
  Building2,
  Truck,
  RefreshCw,
  MapPin,
  ExternalLink,
} from "lucide-react";

const INITIAL_INCIDENTS: Incident[] = [
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
  }
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<"MUNICIPAL" | "CONTRACTOR">("MUNICIPAL");
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Calibrated to PRD Section 7 GVMC baseline
  const kpiData: KPIData = {
    unresolved_spills: incidents.filter((i) => i.status !== "RESOLVED").length || 11,
    active_fleets_total: 170,
    fleet_a_scanners: 120,
    fleet_b_cleaners: 50,
    proof_compliance_rate: 98.2,
    monthly_savings_inr: 17100000, // ₹1.71 Cr/mo (~₹20.52 Cr/yr)
  };

  const loadData = async () => {
    try {
      setIsRefreshing(true);
      const list = await api.getIncidents();
      if (list && list.length > 0) {
        setIncidents(list);
      }
    } catch (e) {
      console.warn("Background revalidation notice:", e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    loadData();
    const interval = setInterval(loadData, 12000);
    return () => clearInterval(interval);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="h-screen w-screen bg-eco-surface flex items-center justify-center text-eco-on-surface font-body">
        <div className="flex items-center space-x-3 bg-eco-surface-container-lowest p-5 rounded-xl border border-eco-outline-variant shadow-tonal">
          <div className="w-5 h-5 border-2 border-eco-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-label font-medium text-eco-on-surface">Initializing CivicLens AI Tonal Spot Eco Engine...</span>
        </div>
      </div>
    );
  }

  return (
    <main className="h-screen w-screen flex flex-col bg-eco-surface overflow-hidden text-eco-on-surface font-body">
      {/* Top Navigation & Executive Header */}
      <header className="bg-eco-surface-container-lowest border-b border-eco-outline-variant/70 px-6 py-3 flex flex-wrap items-center justify-between gap-4 select-none flex-shrink-0 shadow-subtle">
        {/* Brand Identity */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-eco-primary-container text-eco-on-primary-container flex items-center justify-center shadow-subtle">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-headline font-bold text-eco-on-surface text-lg tracking-tight">
                CivicLens AI
              </h1>
              <span className="text-eco-outline-variant">•</span>
              <span className="text-eco-primary font-label font-bold text-xs uppercase tracking-wider">
                Autonomous Civic Audit
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-eco-primary-fixed text-eco-on-primary-fixed-variant border border-eco-primary/30 font-label">
                <span className="w-1.5 h-1.5 rounded-full bg-eco-primary mr-1.5 animate-pulse" />
                Vercel Serverless
              </span>
            </div>
            <p className="text-xs text-eco-on-surface-variant flex items-center space-x-1 mt-0.5 font-label">
              <MapPin className="w-3.5 h-3.5 text-eco-primary" />
              <span>GVMC Visakhapatnam • Ward 14 (Siripuram / Maddilapalem)</span>
            </p>
          </div>
        </div>

        {/* Center Executive Tab Switcher */}
        <div className="flex items-center bg-eco-surface-container p-1 rounded-lg border border-eco-outline-variant/60 shadow-inner">
          <button
            onClick={() => setActiveTab("MUNICIPAL")}
            className={`px-4 py-2 rounded-md text-xs font-label font-bold transition-all flex items-center space-x-2 ${
              activeTab === "MUNICIPAL"
                ? "bg-eco-primary text-eco-on-primary shadow-sm"
                : "text-eco-on-surface-variant hover:text-eco-on-surface hover:bg-eco-surface-container-high"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Municipal Command Desk</span>
          </button>
          <button
            onClick={() => setActiveTab("CONTRACTOR")}
            className={`px-4 py-2 rounded-md text-xs font-label font-bold transition-all flex items-center space-x-2 ${
              activeTab === "CONTRACTOR"
                ? "bg-eco-tertiary text-eco-on-tertiary shadow-sm"
                : "text-eco-on-surface-variant hover:text-eco-on-surface hover:bg-eco-surface-container-high"
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Contractor SLA & Proof Vault</span>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2 font-label">
          <button
            onClick={loadData}
            disabled={isRefreshing}
            className="p-2 text-eco-on-surface-variant hover:text-eco-on-surface bg-eco-surface-container hover:bg-eco-surface-container-high rounded-lg border border-eco-outline-variant transition-colors"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-eco-primary" : ""}`} />
          </button>
          <a
            href="/api/health"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-1.5 rounded-lg bg-eco-surface-container hover:bg-eco-surface-container-high border border-eco-outline-variant text-xs text-eco-on-surface font-semibold flex items-center space-x-1.5 shadow-subtle"
          >
            <span>API Health Check</span>
            <ExternalLink className="w-3.5 h-3.5 text-eco-outline" />
          </a>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex flex-col p-5 gap-4 overflow-hidden">
        {/* Top 4 KPI Metrics */}
        <KPICards data={kpiData} />

        {/* Dynamic Executive View (Tab 1 or Tab 2) */}
        {activeTab === "MUNICIPAL" ? (
          <MunicipalDesk incidents={incidents} onRefresh={loadData} />
        ) : (
          <ProofVault />
        )}
      </div>
    </main>
  );
}
