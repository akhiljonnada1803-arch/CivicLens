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
  Sparkles,
  ExternalLink,
} from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"MUNICIPAL" | "CONTRACTOR">("MUNICIPAL");
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Default KPI calibrated to PRD Section 7 GVMC baseline
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
      setIncidents(list);
    } catch (e) {
      console.error("Data load failed:", e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    loadData();
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="h-screen w-screen bg-[#080c14] flex items-center justify-center text-slate-400">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-mono">Initializing CivicLens AI Serverless Engine...</span>
        </div>
      </div>
    );
  }

  return (
    <main className="h-screen w-screen flex flex-col bg-[#080c14] overflow-hidden text-slate-100">
      {/* Top Navigation & Executive Header */}
      <header className="bg-[#0b0f19] border-b border-slate-800 px-6 py-3 flex flex-wrap items-center justify-between gap-4 select-none flex-shrink-0">
        {/* Brand Identity */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-lg shadow-blue-900/30">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-black text-white text-base tracking-tight">
                CivicLens AI
              </h1>
              <span className="text-slate-600">•</span>
              <span className="text-blue-400 font-semibold text-xs uppercase tracking-wider">
                Autonomous Civic Audit
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
                Vercel Serverless
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5 font-mono">
              <MapPin className="w-3 h-3 text-slate-500" />
              <span>GVMC Visakhapatnam • Ward 14 (Siripuram / Maddilapalem)</span>
            </p>
          </div>
        </div>

        {/* Center Executive Tab Switcher */}
        <div className="flex items-center bg-[#070a12] p-1 rounded-xl border border-slate-800 shadow-inner">
          <button
            onClick={() => setActiveTab("MUNICIPAL")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === "MUNICIPAL"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Municipal Command Desk</span>
          </button>
          <button
            onClick={() => setActiveTab("CONTRACTOR")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === "CONTRACTOR"
                ? "bg-amber-600 text-slate-950 shadow-md shadow-amber-600/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Contractor SLA & Proof Vault</span>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={loadData}
            disabled={isRefreshing}
            className="p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-blue-400" : ""}`} />
          </button>
          <a
            href="/api/docs"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 font-mono flex items-center space-x-1"
          >
            <span>FastAPI OpenAPI</span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
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

