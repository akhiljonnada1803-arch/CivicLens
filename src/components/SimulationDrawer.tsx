"use client";

import React, { useState } from "react";
import {
  X,
  Play,
  Trash2,
  AlertOctagon,
  Car,
  Navigation,
  RotateCcw,
  Terminal,
  ShieldCheck,
  Zap,
  Activity,
} from "lucide-react";
import { api } from "@/lib/api";

interface SimulationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSimulationSuccess: () => void;
}

export const SimulationDrawer: React.FC<SimulationDrawerProps> = ({
  isOpen,
  onClose,
  onSimulationSuccess,
}) => {
  const [logs, setLogs] = useState<string[]>([
    "CivicLens RV1126 Industrial Edge Simulator initialized.",
    "Ready to simulate autonomous municipal vehicle patrol (1 FPS YOLO INT8 + SmolLM-135M).",
  ]);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  if (!isOpen) return null;

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${time}] ${msg}`, ...prev.slice(0, 25)]);
  };

  const handleTrigger = async (
    name: string,
    defectType: string,
    severity: string,
    lat: number,
    lon: number,
    landmark: string,
    fleet: string,
    slm: string
  ) => {
    try {
      setLoadingAction(name);
      addLog(`Simulating edge detection event: ${name}...`);
      const payload = {
        defect_type: defectType,
        severity: severity,
        latitude: lat,
        longitude: lon,
        landmark: landmark,
        source_fleet: fleet,
        slm_summary: slm,
      };
      const res = await api.ingestTelemetry(payload);
      if (res.is_duplicate) {
        addLog(`🎯 DEDUPLICATION HIT (${res.ticket_id}): Sighting count ${res.sighting_count}x. Duplicate alert suppressed.`);
      } else {
        addLog(`🚨 NEW TICKET ${res.ticket_id}: Ingested & dispatched to ${res.assigned_concessionaire}.`);
      }
      onSimulationSuccess();
    } catch (e: any) {
      addLog(`❌ Ingestion failed: ${e.message}`);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleStepFleet = async () => {
    setLoadingAction("step");
    addLog("Advancing fleet patrol waypoints across Ward 14...");
    setTimeout(() => {
      addLog("✓ Updated 3 vehicles: APSRTC Bus #12, Police PCR #04, Tipper #04 (+0.0004° coordinate tick).");
      onSimulationSuccess();
      setLoadingAction(null);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-eco-inverse-surface/60 backdrop-blur-sm flex justify-end font-body">
      <div className="w-full max-w-md bg-eco-surface-container-lowest border-l border-eco-outline-variant h-full flex flex-col shadow-tonal animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 bg-eco-surface-container border-b border-eco-outline-variant flex items-center justify-between font-label">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-eco-primary" />
            <div>
              <h3 className="font-bold text-eco-on-surface text-sm font-headline">Edge AI Patrol Simulator</h3>
              <p className="text-[10px] text-eco-on-surface-variant font-mono">Rockchip RV1126 • 1 FPS INT8 Pipeline</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-eco-on-surface-variant hover:text-eco-on-surface rounded-md hover:bg-eco-surface-container-high transition-colors text-base"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Controls */}
        <div className="p-4 space-y-3.5 flex-1 overflow-y-auto">
          <p className="text-xs text-eco-on-surface-variant leading-relaxed">
            Inject real-time edge triggers from simulated vehicle dashcams without needing physical vehicle hardware connected.
          </p>

          <div className="space-y-2 pt-1 font-label">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-eco-on-surface-variant/80">
              1-Click Event Injections
            </h4>

            {/* Garbage Overflow */}
            <button
              onClick={() =>
                handleTrigger(
                  "Waste Overflow",
                  "garbage_overflow",
                  "HIGH",
                  17.7225,
                  83.3045,
                  "Main Market Road, Pillar 42",
                  "Fleet A (APSRTC Bus #12)",
                  "Commercial market overflow spilling onto pedestrian footpath."
                )
              }
              disabled={!!loadingAction}
              className="w-full flex items-center justify-between p-2.5 rounded-lg bg-eco-surface-container hover:bg-eco-surface-container-high border border-eco-outline-variant text-left transition-colors text-xs shadow-subtle group"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded bg-eco-tertiary-container text-eco-on-tertiary-container flex items-center justify-center">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-eco-on-surface">Waste Overflow (Main Market)</div>
                  <div className="text-[10px] text-eco-on-surface-variant">Bus #12 • YOLOv8n INT8 Conf 91%</div>
                </div>
              </div>
              <Play className="w-3.5 h-3.5 text-eco-primary group-hover:scale-110 transition-transform" />
            </button>

            {/* Open Manhole */}
            <button
              onClick={() =>
                handleTrigger(
                  "Open Manhole",
                  "open_manhole",
                  "CRITICAL",
                  17.7238,
                  83.3056,
                  "Station Road Junction",
                  "Fleet A (Police PCR #04)",
                  "Uncovered stormwater chamber in active driving lane. Emergency priority."
                )
              }
              disabled={!!loadingAction}
              className="w-full flex items-center justify-between p-2.5 rounded-lg bg-eco-surface-container hover:bg-eco-surface-container-high border border-eco-outline-variant text-left transition-colors text-xs shadow-subtle group"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded bg-eco-error-container text-eco-on-error-container flex items-center justify-center">
                  <AlertOctagon className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-eco-on-surface">Open Manhole (Station Road)</div>
                  <div className="text-[10px] text-eco-on-surface-variant">PCR #04 • Critical Road Safety</div>
                </div>
              </div>
              <Play className="w-3.5 h-3.5 text-eco-error group-hover:scale-110 transition-transform" />
            </button>

            {/* Vehicle Collision */}
            <button
              onClick={() =>
                handleTrigger(
                  "Vehicle Collision",
                  "vehicle_crash",
                  "CRITICAL",
                  17.7211,
                  83.3074,
                  "Bypass Flyover Descent",
                  "Fleet B (Tipper #02 IMU: 4.8g)",
                  "Multi-vehicle impact with moderate debris blocking left carriageway."
                )
              }
              disabled={!!loadingAction}
              className="w-full flex items-center justify-between p-2.5 rounded-lg bg-eco-surface-container hover:bg-eco-surface-container-high border border-eco-outline-variant text-left transition-colors text-xs shadow-subtle group"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded bg-eco-error-container text-eco-on-error-container flex items-center justify-center">
                  <Car className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-eco-on-surface">Collision / 4.8g Decel Spike</div>
                  <div className="text-[10px] text-eco-on-surface-variant">Tipper #02 • IMU Spike Detection</div>
                </div>
              </div>
              <Play className="w-3.5 h-3.5 text-eco-error group-hover:scale-110 transition-transform" />
            </button>

            {/* Deduplication Test */}
            <button
              onClick={() =>
                handleTrigger(
                  "Duplicate Pass",
                  "garbage_overflow",
                  "HIGH",
                  17.7225,
                  83.3045,
                  "Main Market Road, Pillar 42",
                  "Fleet A (Transit Bus #12)",
                  "PostGIS 15m proximity hit: sighting counter updated."
                )
              }
              disabled={!!loadingAction}
              className="w-full flex items-center justify-between p-2.5 rounded-lg bg-eco-primary-container/20 hover:bg-eco-primary-container/30 border border-eco-primary/30 text-left transition-colors text-xs shadow-subtle group"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded bg-eco-primary text-eco-on-primary flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-eco-primary">Test Spatial Deduplication (15m)</div>
                  <div className="text-[10px] text-eco-on-surface-variant">Suppresses officer alert fatigue</div>
                </div>
              </div>
              <Play className="w-3.5 h-3.5 text-eco-primary group-hover:scale-110 transition-transform" />
            </button>
          </div>

          <div className="pt-2 space-y-2 font-label">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-eco-on-surface-variant/80">
              Fleet Movement Controls
            </h4>

            {/* Step Fleet */}
            <button
              onClick={handleStepFleet}
              disabled={!!loadingAction}
              className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-lg bg-eco-surface-container hover:bg-eco-surface-container-high border border-eco-outline-variant text-xs font-semibold text-eco-on-surface transition-colors shadow-subtle"
            >
              <Navigation className="w-3.5 h-3.5 text-eco-primary" />
              <span>Step Fleet Vehicle Waypoints</span>
            </button>
          </div>

          {/* Terminal Logs */}
          <div className="pt-2">
            <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-eco-on-surface-variant mb-1 font-label">
              <Terminal className="w-3.5 h-3.5 text-eco-primary" />
              <span>Edge Telemetry Log</span>
            </div>
            <div className="bg-eco-surface-container-highest p-2.5 rounded-lg border border-eco-outline-variant font-mono text-[10px] text-eco-on-surface h-36 overflow-y-auto space-y-1">
              {logs.map((log, i) => (
                <div key={i} className="leading-tight">{log}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

