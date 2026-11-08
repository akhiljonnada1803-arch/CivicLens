"use client";

import React, { useState, useEffect } from "react";
import { KPICards } from "@/components/KPICards";
import { MunicipalDesk } from "@/components/MunicipalDesk";
import { ProofVault } from "@/components/ProofVault";
import { SimulationDrawer } from "@/components/SimulationDrawer";
import { CapExModal } from "@/components/CapExModal";
import { api } from "@/lib/api";
import { Incident, KPIData } from "@/lib/types";
import {
  ShieldAlert,
  Building2,
  Truck,
  RefreshCw,
  MapPin,
  ExternalLink,
  DollarSign,
  PlayCircle,
} from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"MUNICIPAL" | "CONTRACTOR">("MUNICIPAL");
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isSimOpen, setIsSimOpen] = useState(false);
  const [isCapExOpen, setIsCapExOpen] = useState(false);

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
      <header className="bg-eco-surface-container-lowest border-b border-eco-outline-variant/70 px-5 py-3 flex flex-wrap items-center justify-between gap-3 select-none flex-shrink-0 shadow-subtle">
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
            className={`px-4 py-1.5 rounded-md text-xs font-label font-bold transition-all flex items-center space-x-2 ${
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
            className={`px-4 py-1.5 rounded-md text-xs font-label font-bold transition-all flex items-center space-x-2 ${
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
          {/* CapEx Calculator Modal Button */}
          <button
            onClick={() => setIsCapExOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-eco-secondary-container hover:bg-eco-secondary-container/80 text-eco-on-secondary-container border border-eco-secondary/30 text-xs font-semibold shadow-subtle transition-all"
          >
            <DollarSign className="w-3.5 h-3.5 text-eco-secondary" />
            <span>CapEx Calculator</span>
          </button>

          {/* Simulate Edge Patrol Drawer Button */}
          <button
            onClick={() => setIsSimOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-eco-primary hover:bg-eco-primary-container text-eco-on-primary text-xs font-bold shadow-subtle transition-all"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>Simulate Edge Patrol</span>
          </button>

          {/* Refresh Live Data */}
          <button
            onClick={loadData}
            disabled={isRefreshing}
            className="p-2 text-eco-on-surface-variant hover:text-eco-on-surface bg-eco-surface-container hover:bg-eco-surface-container-high rounded-lg border border-eco-outline-variant transition-colors"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-eco-primary" : ""}`} />
          </button>

          {/* API Health Check */}
          <a
            href="/api/health"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-lg bg-eco-surface-container hover:bg-eco-surface-container-high border border-eco-outline-variant text-xs text-eco-on-surface font-semibold flex items-center space-x-1 shadow-subtle"
          >
            <span>API Health</span>
            <ExternalLink className="w-3 h-3 text-eco-outline" />
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

      {/* Interactive Simulation Drawer */}
      <SimulationDrawer
        isOpen={isSimOpen}
        onClose={() => setIsSimOpen(false)}
        onSimulationSuccess={loadData}
      />

      {/* Operational Economics & CapEx Audit Modal */}
      <CapExModal
        isOpen={isCapExOpen}
        onClose={() => setIsCapExOpen(false)}
      />
    </main>
  );
}
