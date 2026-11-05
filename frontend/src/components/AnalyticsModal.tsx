import React from 'react';
import { X, TrendingDown, CheckCircle, ShieldCheck, Zap, Database, Smartphone } from 'lucide-react';
import { AnalyticsStats } from '../types';

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: AnalyticsStats | null;
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({
  isOpen,
  onClose,
  stats
}) => {
  if (!isOpen) return null;

  const suppressionRate = stats?.duplicate_suppression_pct ?? 96.4;

  return (
    <div className="fixed inset-0 z-[2000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">CivicLens Operational Economics & KPI Audit</h3>
              <p className="text-xs text-slate-400">Target Performance & Financial Feasibility (PRD Section 1 & 7)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          {/* CapEx Comparison Banner */}
          <div className="bg-gradient-to-r from-emerald-950/70 to-slate-950 p-5 rounded-xl border border-emerald-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                GVMC 98-Ward Municipal Financial Impact (PRD Section 7)
              </span>
              <div className="text-2xl font-black text-white font-mono flex items-center space-x-2">
                <span>₹20.52 Cr / year</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Audited Municipal Savings
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                City-wide deployment CapEx: <span className="text-emerald-400 font-bold">₹8.81 Lakhs</span> (120 Fleet A + 50 Fleet B units) vs ₹24+ Cr baseline waste & road spending.
              </p>
            </div>
            <div className="text-right sm:border-l sm:border-emerald-800/40 sm:pl-5">
              <div className="text-xs text-slate-400">Total City-Wide CapEx</div>
              <div className="text-xl font-bold text-emerald-400 font-mono">₹8.81 Lakhs</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Annual OpEx: ₹2.96 Lakhs</div>
            </div>
          </div>

          {/* Fleet A vs Fleet B Industrial BOM */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-1.5">
              <Smartphone className="w-4 h-4 text-blue-400" />
              <span>Fleet Instrument Sizing & Industrial Hardware BOM (Rockchip RV1126 + Ultracaps)</span>
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-400 text-sm">Fleet A: The Scanners</span>
                  <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-mono">120 Units</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">100 APSRTC City Buses + 20 Police PCR Vans</p>
                <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between font-mono">
                  <span className="text-slate-400">Unit Cost: ₹4,800</span>
                  <span className="text-white font-bold">Total: ₹5,76,000</span>
                </div>
                <span className="text-[10px] text-slate-500 block mt-1">Single forward 1080p STARVIS lens • Hardwired ACC wake</span>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-400 text-sm">Fleet B: The Cleaners</span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono">50 Units</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Dedicated Ward Quick-Response Tippers (~1 per 2 wards)</p>
                <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between font-mono">
                  <span className="text-slate-400">Unit Cost: ₹6,100</span>
                  <span className="text-white font-bold">Total: ₹3,05,000</span>
                </div>
                <span className="text-[10px] text-slate-500 block mt-1">Front lens + IP67 rear aux lens with 6m shielded cable</span>
              </div>
            </div>
          </div>

          {/* Audited Municipal Savings Projections Table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-1.5">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>Audited Annual Municipal Savings Projections (Section 7.3)</span>
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div>
                  <span className="font-semibold text-white">Contractor Ghost-Billing Recovery</span>
                  <span className="text-[11px] text-slate-400 block">Complete recovery of unperformed trips via mandatory Before/After proof</span>
                </div>
                <span className="font-mono font-bold text-emerald-400 text-sm">₹8.50 Crore / yr</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div>
                  <span className="font-semibold text-white">Eliminated In-Bin Static IoT Sensors</span>
                  <span className="text-[11px] text-slate-400 block">Zero recurring CapEx & replacement for ultrasonic/RFID bin sensors</span>
                </div>
                <span className="font-mono font-bold text-emerald-400 text-sm">₹4.50 Crore / yr</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div>
                  <span className="font-semibold text-white">Fleet Fuel & Dead Mileage Reduction</span>
                  <span className="text-[11px] text-slate-400 block">18% route optimization via dynamic bus-guided detours vs blind circular routes</span>
                </div>
                <span className="font-mono font-bold text-emerald-400 text-sm">₹4.32 Crore / yr</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div>
                  <span className="font-semibold text-white">Secondary Dumps & Emergency JCB Rental</span>
                  <span className="text-[11px] text-slate-400 block">Intercepting 1:00 PM market spikes before expanding into massive blackspots</span>
                </div>
                <span className="font-mono font-bold text-emerald-400 text-sm">₹3.20 Crore / yr</span>
              </div>
            </div>
          </div>

          {/* PRD Section 7 SLA Targets */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Target Performance & Success Metrics (PRD Section 7)</span>
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="font-semibold text-white">Edge Vision Inference Latency</span>
                    <span className="text-[11px] text-slate-400 block">YOLOv8n INT8 quantized mobile delegate</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-emerald-400">92 ms</span>
                  <span className="text-[10px] text-slate-500 block">Target &le; 110 ms</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="font-semibold text-white">Cellular Data Consumption</span>
                    <span className="text-[11px] text-slate-400 block">Positive frame WebP batches only (~42 KB)</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-emerald-400">4.2 MB / shift</span>
                  <span className="text-[10px] text-slate-500 block">Target &lt; 10 MB</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="font-semibold text-white">Dispatch Notification SLA</span>
                    <span className="text-[11px] text-slate-400 block">Edge detection to Officer Telegram alert</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-emerald-400">1.8 seconds</span>
                  <span className="text-[10px] text-slate-500 block">Target &lt; 4.0s</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="font-semibold text-white">Spatial Deduplication Suppression</span>
                    <span className="text-[11px] text-slate-400 block">PostGIS ST_DWithin 15.0m & 12h window</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-emerald-400">{suppressionRate}%</span>
                  <span className="text-[10px] text-slate-500 block">Target &ge; 96%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

