import React from "react";
import { AlertCircle, Truck, ShieldCheck, DollarSign, ArrowUpRight } from "lucide-react";
import { KPIData } from "@/lib/types";

interface KPICardsProps {
  data: KPIData;
}

export const KPICards: React.FC<KPICardsProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Live Unresolved Spills */}
      <div className="bg-[#0f172a]/80 backdrop-blur-md rounded-xl p-4 border border-slate-800/80 shadow-lg relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-bl-full pointer-events-none transition-all group-hover:scale-110" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Live Unresolved Spills
          </span>
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-2xl font-bold font-mono text-white">
            {data.unresolved_spills}
          </span>
          <span className="text-xs text-rose-400 font-medium">Zone 3 (Central)</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-1">
          Ward 14 • 15m PostGIS Spatial Deduplication Active
        </p>
      </div>

      {/* 2. Active Roving Fleets (Buses + Tippers) */}
      <div className="bg-[#0f172a]/80 backdrop-blur-md rounded-xl p-4 border border-slate-800/80 shadow-lg relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full pointer-events-none transition-all group-hover:scale-110" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Active Roving Fleets
          </span>
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <Truck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-2xl font-bold font-mono text-white">
            {data.active_fleets_total}
          </span>
          <span className="text-xs text-blue-400 font-medium">
            120 Buses + 50 Tippers
          </span>
        </div>
        <p className="text-[11px] text-slate-500 mt-1">
          Fleet A (Eyes) 6am-11pm • Fleet B (Dual-Cam Hands)
        </p>
      </div>

      {/* 3. Contractor Proof Compliance Rate */}
      <div className="bg-[#0f172a]/80 backdrop-blur-md rounded-xl p-4 border border-slate-800/80 shadow-lg relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none transition-all group-hover:scale-110" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Proof Compliance Rate
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-2xl font-bold font-mono text-emerald-400">
            {data.proof_compliance_rate.toFixed(1)}%
          </span>
          <span className="text-xs text-emerald-400/80 font-medium flex items-center">
            <ArrowUpRight className="w-3 h-3 mr-0.5" /> +4.2% MoM
          </span>
        </div>
        <p className="text-[11px] text-slate-500 mt-1">
          Mandatory Front/Rear 15m Consensus Verified
        </p>
      </div>

      {/* 4. Estimated Monthly Inefficient Spend Saved */}
      <div className="bg-[#0f172a]/80 backdrop-blur-md rounded-xl p-4 border border-slate-800/80 shadow-lg relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none transition-all group-hover:scale-110" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Monthly Inefficient Spend Saved
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-2xl font-bold font-mono text-amber-400">
            ₹{(data.monthly_savings_inr / 10000000).toFixed(2)} Cr
          </span>
          <span className="text-xs text-slate-400 font-medium">/ month</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-1">
          ₹20.52 Cr / yr Target (Ghost-Billing + In-Bin IoT Recovery)
        </p>
      </div>
    </div>
  );
};

