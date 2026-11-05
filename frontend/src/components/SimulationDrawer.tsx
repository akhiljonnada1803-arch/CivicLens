import React, { useState } from 'react';
import { 
  X, 
  Play, 
  Trash2, 
  AlertOctagon, 
  Car, 
  Navigation, 
  RotateCcw, 
  Terminal, 
  Layers, 
  ShieldCheck,
  Zap
} from 'lucide-react';
import { api } from '../services/api';

interface SimulationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSimulationSuccess: () => void;
}

export const SimulationDrawer: React.FC<SimulationDrawerProps> = ({
  isOpen,
  onClose,
  onSimulationSuccess
}) => {
  const [logs, setLogs] = useState<string[]>([
    'CivicLens Edge Simulator initialized.',
    'Ready to simulate autonomous municipal vehicle patrol.'
  ]);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  if (!isOpen) return null;

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${time}] ${msg}`, ...prev.slice(0, 20)]);
  };

  const handleTrigger = async (name: string, index: number, forceDuplicate = false) => {
    try {
      setLoadingAction(name);
      addLog(`Simulating event: ${name}...`);
      const res = await api.triggerSimulationIncident(index, forceDuplicate);
      if (res.is_duplicate) {
        addLog(`🎯 DEDUPLICATION HIT: Recurrence count = ${res.sighting_count}. Alert suppressed to prevent officer fatigue.`);
      } else {
        addLog(`🚨 NEW TICKET: "${res.title}" created & dispatched to ${res.department} (${res.sla}).`);
      }
      onSimulationSuccess();
    } catch (e: any) {
      addLog(`❌ Error: ${e.message}`);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleStepFleet = async () => {
    try {
      setLoadingAction('step');
      addLog('Advancing fleet patrol vehicles along Ward 14 routes...');
      const res = await api.stepFleet();
      addLog(`✓ Updated ${res.updated_vehicles} vehicles: Sweeper #04, Bus #12, Tipper #02.`);
      onSimulationSuccess();
    } catch (e: any) {
      addLog(`❌ Error: ${e.message}`);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleClear = async () => {
    try {
      setLoadingAction('clear');
      addLog('Wiping all incidents and sightings from database...');
      await api.clearData();
      addLog('✅ Database cleared! All tickets wiped to 0. Operations board is completely fresh.');
      onSimulationSuccess();
    } catch (e: any) {
      addLog(`❌ Error: ${e.message}`);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleReset = async () => {
    try {
      setLoadingAction('reset');
      addLog('Reseeding GVMC Ward 14 PRD baseline data...');
      await api.resetData();
      addLog('✓ Database successfully reseeded with 39 baseline tickets.');
      onSimulationSuccess();
    } catch (e: any) {
      addLog(`❌ Error: ${e.message}`);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-sm">Edge AI Vehicle Simulator</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls */}
        <div className="p-4 space-y-3 flex-1 overflow-y-auto">
          <p className="text-xs text-slate-400">
            Simulate real-time edge triggers from vehicle-mounted smartphones without needing physical hardware connected.
          </p>

          <div className="space-y-2 pt-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              1-Click Event Injections
            </h4>

            {/* Garbage Overflow */}
            <button
              onClick={() => handleTrigger('Garbage Overflow', 0)}
              disabled={!!loadingAction}
              className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/70 text-left transition-colors text-xs"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-slate-100">Waste Overflow (Main Market)</div>
                  <div className="text-[10px] text-slate-400">Sweeper #04 • YOLOv8n Conf 88%</div>
                </div>
              </div>
              <Play className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Open Manhole */}
            <button
              onClick={() => handleTrigger('Open Manhole', 1)}
              disabled={!!loadingAction}
              className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/70 text-left transition-colors text-xs"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <AlertOctagon className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-slate-100">Open Manhole (Station Road)</div>
                  <div className="text-[10px] text-slate-400">Bus #12 • Water Board & Sewerage</div>
                </div>
              </div>
              <Play className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Vehicle Collision */}
            <button
              onClick={() => handleTrigger('Vehicle Collision', 2)}
              disabled={!!loadingAction}
              className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/70 text-left transition-colors text-xs"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <Car className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-slate-100">Collision / 4.6g Deceleration</div>
                  <div className="text-[10px] text-slate-400">Tipper #02 • Traffic Police & 108</div>
                </div>
              </div>
              <Play className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Test PostGIS Deduplication */}
            <button
              onClick={() => handleTrigger('Duplicate Pass', 0, true)}
              disabled={!!loadingAction}
              className="w-full flex items-center justify-between p-2.5 rounded-lg bg-blue-950/40 hover:bg-blue-900/40 border border-blue-800/50 text-left transition-colors text-xs"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-blue-200">Test Spatial Deduplication (15m)</div>
                  <div className="text-[10px] text-blue-300/70">Increments count, suppresses alert</div>
                </div>
              </div>
              <Play className="w-3.5 h-3.5 text-blue-400" />
            </button>
          </div>

          <div className="pt-2 space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Fleet Movement Controls
            </h4>

            {/* Step Fleet */}
            <button
              onClick={handleStepFleet}
              disabled={!!loadingAction}
              className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors"
            >
              <Navigation className="w-3.5 h-3.5 text-blue-400" />
              <span>Step Fleet Vehicle Waypoints</span>
            </button>

            {/* Clear Database (0 Tickets) */}
            <button
              onClick={handleClear}
              disabled={!!loadingAction}
              className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-lg bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800 text-xs font-bold text-rose-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
              <span>🧹 Clear Database (Wipe to 0 Tickets)</span>
            </button>

            {/* Reseed PRD Baseline */}
            <button
              onClick={handleReset}
              disabled={!!loadingAction}
              className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-slate-300 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
              <span>🔄 Reseed PRD Baseline Dataset</span>
            </button>
          </div>

          {/* Terminal Logs */}
          <div className="pt-2">
            <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-slate-400 mb-1">
              <Terminal className="w-3.5 h-3.5" />
              <span>Edge Telemetry Log</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-[10px] text-slate-300 h-36 overflow-y-auto space-y-1">
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

