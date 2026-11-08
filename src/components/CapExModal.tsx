"use client";

import React from "react";
import { X, TrendingDown, DollarSign, Smartphone, ShieldCheck, Zap } from "lucide-react";

interface CapExModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CapExModal: React.FC<CapExModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-eco-inverse-surface/60 backdrop-blur-sm flex items-center justify-center p-4 font-body">
      <div className="w-full max-w-2xl bg-eco-surface-container-lowest border border-eco-outline-variant rounded-2xl shadow-tonal overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-eco-outline-variant flex items-center justify-between bg-eco-surface-container font-label">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-eco-primary-container text-eco-on-primary-container flex items-center justify-center shadow-subtle">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-eco-on-surface text-base font-headline">CivicLens Operational Economics & CapEx Audit</h3>
              <p className="text-xs text-eco-on-surface-variant font-body">Target Performance & Financial Feasibility (PRD Section 1 & 7)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-eco-on-surface-variant hover:text-eco-on-surface rounded-md hover:bg-eco-surface-container-high transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* CapEx Comparison Banner */}
          <div className="bg-eco-surface-container p-5 rounded-xl border border-eco-primary/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-eco-primary block mb-1 font-label">
                GVMC 98-Ward Municipal Financial Impact (PRD Section 7)
              </span>
              <div className="text-2xl font-black text-eco-on-surface font-headline flex items-center space-x-2">
                <span>₹20.52 Cr / year</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-eco-primary-fixed text-eco-on-primary-fixed border border-eco-primary/30 font-label">
                  Audited Municipal Savings
                </span>
              </div>
              <p className="text-xs text-eco-on-surface-variant mt-1.5 leading-relaxed font-body">
                City-wide fleet hardware deployment: <strong className="text-eco-primary font-bold">₹8.81 Lakhs</strong> (120 Fleet A + 50 Fleet B units) vs ₹24+ Cr baseline unverified waste & road repair spending.
              </p>
            </div>
            <div className="text-right sm:border-l sm:border-eco-outline-variant sm:pl-5 font-label">
              <div className="text-xs text-eco-on-surface-variant">Total Fleet CapEx</div>
              <div className="text-xl font-bold text-eco-primary font-headline">₹8.81 Lakhs</div>
              <div className="text-[10px] text-eco-on-surface-variant mt-0.5 font-mono">Annual OpEx: ₹2.96 Lakhs</div>
            </div>
          </div>

          {/* Fleet A vs Fleet B Industrial BOM */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-eco-on-surface-variant mb-3 flex items-center space-x-1.5 font-label">
              <Smartphone className="w-4 h-4 text-eco-primary" />
              <span>Fleet Industrial Sizing & Unit BOM (Rockchip RV1126 + Dual Ultracapacitors)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Fleet A */}
              <div className="bg-eco-surface-container-low p-4 rounded-xl border border-eco-outline-variant">
                <div className="flex items-center justify-between font-label">
                  <span className="font-bold text-eco-primary text-sm font-headline">Fleet A: The Scanners</span>
                  <span className="px-2 py-0.5 rounded bg-eco-primary-fixed text-eco-on-primary-fixed text-[10px] font-mono font-bold">120 Units</span>
                </div>
                <p className="text-[11px] text-eco-on-surface-variant mt-1 font-body">100 APSRTC City Buses + 20 Police PCR Vans</p>
                
                <div className="mt-3 pt-2.5 border-t border-eco-outline-variant space-y-1 text-eco-on-surface font-label text-[11px]">
                  <div className="flex justify-between">
                    <span>RV1126 MPU (2.0 TOPS NPU, 1GB RAM)</span>
                    <span className="font-mono">₹3,800</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sony IMX307 1080p Front Lens</span>
                    <span className="font-mono">Included</span>
                  </div>
                  <div className="flex justify-between">
                    <span>DC-DC Buck Converter + Ignition Tap</span>
                    <span className="font-mono">₹700</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tamper-Resistant Torx Header Mount</span>
                    <span className="font-mono">₹300</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-eco-outline-variant font-bold text-eco-primary text-xs">
                    <span>Unit Cost (Fleet A):</span>
                    <span className="font-mono">₹4,800</span>
                  </div>
                </div>
              </div>

              {/* Fleet B */}
              <div className="bg-eco-surface-container-low p-4 rounded-xl border border-eco-outline-variant">
                <div className="flex items-center justify-between font-label">
                  <span className="font-bold text-eco-tertiary text-sm font-headline">Fleet B: The Cleaners</span>
                  <span className="px-2 py-0.5 rounded bg-eco-tertiary-fixed text-eco-on-tertiary-fixed text-[10px] font-mono font-bold">50 Units</span>
                </div>
                <p className="text-[11px] text-eco-on-surface-variant mt-1 font-body">Dedicated Ward Cleanup Tipper Trucks</p>
                
                <div className="mt-3 pt-2.5 border-t border-eco-outline-variant space-y-1 text-eco-on-surface font-label text-[11px]">
                  <div className="flex justify-between">
                    <span>RV1126 MPU (Front + Dual Processing)</span>
                    <span className="font-mono">₹3,800</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Aux IP67/IP69K Rear Bumper Camera (6m)</span>
                    <span className="font-mono text-eco-tertiary font-semibold">₹1,300</span>
                  </div>
                  <div className="flex justify-between">
                    <span>DC-DC Step-Down + Ignition Sensor</span>
                    <span className="font-mono">₹700</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shielded Aviation Cabling Kit</span>
                    <span className="font-mono">₹300</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-eco-outline-variant font-bold text-eco-tertiary text-xs">
                    <span>Unit Cost (Fleet B):</span>
                    <span className="font-mono">₹6,100</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3 Operational Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="bg-eco-surface-container p-3 rounded-lg border border-eco-outline-variant text-center">
              <span className="text-[11px] text-eco-on-surface-variant font-label block">Deduplication Accuracy</span>
              <span className="text-xl font-bold font-headline text-eco-primary">96.4%</span>
              <span className="text-[10px] text-eco-on-surface-variant block mt-0.5">15m PostGIS Window</span>
            </div>
            <div className="bg-eco-surface-container p-3 rounded-lg border border-eco-outline-variant text-center">
              <span className="text-[11px] text-eco-on-surface-variant font-label block">Dual-Camera Compliance</span>
              <span className="text-xl font-bold font-headline text-eco-tertiary">98.2%</span>
              <span className="text-[10px] text-eco-on-surface-variant block mt-0.5">Ghost Billing Elimination</span>
            </div>
            <div className="bg-eco-surface-container p-3 rounded-lg border border-eco-outline-variant text-center">
              <span className="text-[11px] text-eco-on-surface-variant font-label block">Edge Frame Filtering</span>
              <span className="text-xl font-bold font-headline text-eco-secondary">99.5%</span>
              <span className="text-[10px] text-eco-on-surface-variant block mt-0.5">Local RAM INT8 Filter</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-eco-surface-container border-t border-eco-outline-variant flex justify-end font-label">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-eco-primary hover:bg-eco-primary-container text-xs text-eco-on-primary font-bold shadow-sm transition-all"
          >
            Close Audit Breakdown
          </button>
        </div>
      </div>
    </div>
  );
};
