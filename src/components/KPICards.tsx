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
      <div className="bg-eco-surface-container-low rounded-lg p-4 border border-eco-outline-variant/60 shadow-subtle relative overflow-hidden group hover:border-eco-outline transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-label font-semibold text-eco-on-surface-variant uppercase tracking-wider">
            Live Unresolved Spills
          </span>
          <div className="w-8 h-8 rounded-md bg-eco-error-container text-eco-error flex items-center justify-center">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-3xl font-headline font-bold text-eco-on-surface">
            {data.unresolved_spills}
          </span>
          <span className="text-xs font-label font-medium px-2 py-0.5 rounded bg-eco-error-container/60 text-eco-on-error-container border border-eco-error/20">
            Zone 3 (Central)
          </span>
        </div>
        <p className="text-xs font-body text-eco-on-surface-variant mt-1.5">
          Ward 14 • 15m PostGIS Spatial Deduplication
        </p>
      </div>

      {/* 2. Active Roving Fleets */}
      <div className="bg-eco-surface-container-low rounded-lg p-4 border border-eco-outline-variant/60 shadow-subtle relative overflow-hidden group hover:border-eco-outline transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-label font-semibold text-eco-on-surface-variant uppercase tracking-wider">
            Active Roving Fleets
          </span>
          <div className="w-8 h-8 rounded-md bg-eco-secondary-container text-eco-secondary flex items-center justify-center">
            <Truck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-3xl font-headline font-bold text-eco-on-surface">
            {data.active_fleets_total}
          </span>
          <span className="text-xs font-label font-medium px-2 py-0.5 rounded bg-eco-secondary-container/60 text-eco-on-secondary-container border border-eco-secondary/20">
            120 Buses + 50 Tippers
          </span>
        </div>
        <p className="text-xs font-body text-eco-on-surface-variant mt-1.5">
          Fleet A (Eyes) 6am-11pm • Fleet B (Cleaners)
        </p>
      </div>

      {/* 3. Proof Compliance Rate */}
      <div className="bg-eco-surface-container-low rounded-lg p-4 border border-eco-outline-variant/60 shadow-subtle relative overflow-hidden group hover:border-eco-outline transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-label font-semibold text-eco-on-surface-variant uppercase tracking-wider">
            Proof Compliance Rate
          </span>
          <div className="w-8 h-8 rounded-md bg-eco-primary-fixed text-eco-primary flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-3xl font-headline font-bold text-eco-primary">
            {data.proof_compliance_rate.toFixed(1)}%
          </span>
          <span className="text-xs font-label font-medium px-2 py-0.5 rounded bg-eco-primary-fixed-dim/40 text-eco-on-primary-fixed-variant border border-eco-primary/20 flex items-center">
            <ArrowUpRight className="w-3 h-3 mr-0.5" /> +4.2% MoM
          </span>
        </div>
        <p className="text-xs font-body text-eco-on-surface-variant mt-1.5">
          Mandatory Front/Rear Dual-Vision Consensus
        </p>
      </div>

      {/* 4. Estimated Monthly Inefficient Spend Saved */}
      <div className="bg-eco-surface-container-low rounded-lg p-4 border border-eco-outline-variant/60 shadow-subtle relative overflow-hidden group hover:border-eco-outline transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-label font-semibold text-eco-on-surface-variant uppercase tracking-wider">
            Monthly Spend Saved
          </span>
          <div className="w-8 h-8 rounded-md bg-eco-tertiary-fixed text-eco-tertiary flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-3xl font-headline font-bold text-eco-tertiary">
            ₹{(data.monthly_savings_inr / 10000000).toFixed(2)} Cr
          </span>
          <span className="text-xs font-label text-eco-on-surface-variant font-medium">/ month</span>
        </div>
        <p className="text-xs font-body text-eco-on-surface-variant mt-1.5">
          ₹20.52 Cr / yr Target (Ghost Billing & IoT Elimination)
        </p>
      </div>
    </div>
  );
};
