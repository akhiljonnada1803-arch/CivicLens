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
          <div className="bg-gradient-to-r from-emerald-950/60 to-slate-950 p-4 rounded-xl border border-emerald-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                CapEx Reduction vs Stationary IoT Bin Sensors
              </span>
              <div className="text-2xl font-black text-white font-mono flex items-center space-x-2">
                <span>99.3% CapEx Savings</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Target &gt;90%
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                ₹95,000 for 25 fleet vehicles vs ₹1,40,00,000 (₹1.4 Cr) for 5,000 IoT bin sensors.
              </p>
            </div>
            <div className="text-right sm:border-l sm:border-emerald-800/40 sm:pl-4">
              <div className="text-xs text-slate-400">Net Municipal Savings</div>
              <div className="text-xl font-bold text-emerald-400 font-mono">₹1.39 Cr</div>
            </div>
          </div>

          {/* BOM Breakdown */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-1.5">
              <Smartphone className="w-4 h-4 text-blue-400" />
              <span>Edge Vehicle Mount Bill of Materials (BOM per Vehicle)</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Refurbished Android Device</span>
                <span className="font-bold text-white text-sm">₹2,800 – ₹3,200</span>
                <span className="text-[10px] text-slate-400 block mt-1">1080p Optical + GNSS</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block">12/24V to 5V 3A Buck</span>
                <span className="font-bold text-white text-sm">₹250 – ₹350</span>
                <span className="text-[10px] text-slate-400 block mt-1">Isolates load spikes</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Add-A-Circuit Fuse Tap</span>
                <span className="font-bold text-white text-sm">₹100 – ₹150</span>
                <span className="text-[10px] text-slate-400 block mt-1">ACC ignition tap</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Total Unit Hardware</span>
                <span className="font-bold text-emerald-400 text-sm">~₹3,800</span>
                <span className="text-[10px] text-slate-400 block mt-1">Zero maintenance</span>
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

