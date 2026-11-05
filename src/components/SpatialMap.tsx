"use client";

import React, { useState } from "react";
import { Incident } from "@/lib/types";
import { MapPin, Navigation, Layers, ShieldAlert, CheckCircle2 } from "lucide-react";

interface SpatialMapProps {
  incidents: Incident[];
  selectedIncident: Incident | null;
  onSelectIncident: (inc: Incident) => void;
}

// Bounding box for Ward 14 (Siripuram / Maddilapalem)
// Lat: ~17.716 to 17.732, Lon: ~83.298 to 83.315
const MIN_LAT = 17.716;
const MAX_LAT = 17.732;
const MIN_LON = 83.298;
const MAX_LON = 83.315;

export const SpatialMap: React.FC<SpatialMapProps> = ({
  incidents,
  selectedIncident,
  onSelectIncident,
}) => {
  const [mapLayer, setMapLayer] = useState<"DARK_GIS" | "SATELLITE">("DARK_GIS");

  // Project GPS lat/lon to SVG 0-100% coordinates
  const projectCoords = (lat: number, lon: number) => {
    const x = ((lon - MIN_LON) / (MAX_LON - MIN_LON)) * 100;
    const y = (1 - (lat - MIN_LAT) / (MAX_LAT - MIN_LAT)) * 100;
    return {
      x: Math.max(5, Math.min(95, x)),
      y: Math.max(5, Math.min(95, y)),
    };
  };

  // Sample fleet vehicles patrolling Ward 14
  const fleetVehicles = [
    { id: "BUS-12", label: "Fleet A: APSRTC Bus #12", lat: 17.724, lon: 83.3055, type: "BUS" },
    { id: "PCR-04", label: "Fleet A: Police PCR #04", lat: 17.725, lon: 83.303, type: "PCR" },
    { id: "TIP-04", label: "Fleet B: Tipper #04 (Dual-Cam)", lat: 17.7212, lon: 83.3078, type: "TIPPER" },
  ];

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-xl overflow-hidden border border-slate-800 bg-[#090d16] flex flex-col shadow-inner select-none">
      {/* Map Header Toolbar */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2 bg-[#0d1322]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/80 text-xs text-slate-300 shadow-xl">
        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
        <span className="font-semibold text-white">GVMC Ward 14 Spatial Vector GIS</span>
        <span className="text-slate-500">|</span>
        <span className="text-blue-400 font-mono">15m Deduplication Grid</span>
      </div>

      <div className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-[#0d1322]/90 backdrop-blur-md p-1 rounded-lg border border-slate-700/80 text-xs shadow-xl">
        <button
          onClick={() => setMapLayer("DARK_GIS")}
          className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
            mapLayer === "DARK_GIS" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
          }`}
        >
          Dark GIS
        </button>
        <button
          onClick={() => setMapLayer("SATELLITE")}
          className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
            mapLayer === "SATELLITE" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
          }`}
        >
          Aerial Grid
        </button>
      </div>

      {/* SVG Canvas Map Surface */}
      <div className="flex-1 w-full h-full relative">
        <svg
          className="w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#17223b" strokeWidth="0.4" />
            </pattern>
            <linearGradient id="wardFill" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.08" />
            </linearGradient>
          </defs>

          {/* Grid Background */}
          <rect width="100" height="100" fill="url(#grid)" />

          {/* Ward 14 Boundary Polygon */}
          <polygon
            points="15,20 85,15 92,65 60,90 20,85 15,20"
            fill="url(#wardFill)"
            stroke="#38bdf8"
            strokeWidth="0.75"
            strokeDasharray="2, 1"
          />

          {/* Major Road Arteries */}
          {/* Main Market Road */}
          <path d="M 10 45 Q 45 48 90 40" fill="none" stroke="#334155" strokeWidth="1.2" strokeLinecap="round" />
          {/* Station Road Cross */}
          <path d="M 35 15 Q 48 55 65 92" fill="none" stroke="#334155" strokeWidth="1.2" strokeLinecap="round" />
          {/* Bypass Flyover Ramp */}
          <path d="M 15 80 Q 55 75 90 70" fill="none" stroke="#1e293b" strokeWidth="1.8" />
        </svg>

        {/* Fleet Vehicle Pins */}
        {fleetVehicles.map((v) => {
          const { x, y } = projectCoords(v.lat, v.lon);
          const isTipper = v.type === "TIPPER";
          return (
            <div
              key={v.id}
              style={{ left: `${x}%`, top: `${y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-auto group cursor-pointer"
            >
              <div
                className={`flex items-center space-x-1 px-2 py-0.5 rounded-full border shadow-lg backdrop-blur-md ${
                  isTipper
                    ? "bg-amber-950/90 text-amber-300 border-amber-500/80"
                    : "bg-blue-950/90 text-blue-300 border-blue-500/80"
                }`}
              >
                <span className="text-[10px]">{isTipper ? "🚚" : "🚌"}</span>
                <span className="text-[9px] font-bold font-mono">{v.id}</span>
              </div>
              {/* Tooltip */}
              <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-[10px] text-slate-200 whitespace-nowrap shadow-xl z-30">
                {v.label}
              </div>
            </div>
          );
        })}

        {/* Incident Alert Pins */}
        {incidents.map((inc) => {
          const { x, y } = projectCoords(inc.latitude, inc.longitude);
          const isSelected = selectedIncident?.id === inc.id;
          const isResolved = inc.status === "RESOLVED";
          const isCritical = inc.severity === "CRITICAL";

          return (
            <div
              key={inc.id}
              onClick={() => onSelectIncident(inc)}
              style={{ left: `${x}%`, top: `${y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer group transition-transform hover:scale-125"
            >
              {/* Pulse halo if critical and unresolved */}
              {isCritical && !isResolved && (
                <span className="absolute -inset-2 rounded-full bg-rose-500/30 animate-ping" />
              )}

              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-lg transition-all ${
                  isSelected
                    ? "ring-4 ring-blue-400 bg-blue-600 text-white scale-110 z-20"
                    : isResolved
                    ? "bg-emerald-600 text-white border border-emerald-400"
                    : isCritical
                    ? "bg-rose-600 text-white border border-rose-400"
                    : "bg-amber-500 text-slate-950 font-bold border border-amber-300"
                }`}
              >
                {isResolved ? "✓" : isCritical ? "🚨" : "⚠️"}
              </div>

              {/* Pin Label Hover Tooltip */}
              <div className="hidden group-hover:block absolute top-full left-1/2 -translate-x-1/2 mt-1.5 px-2.5 py-1 bg-slate-900/95 border border-slate-700 rounded-md text-[10px] text-slate-200 whitespace-nowrap shadow-2xl z-30">
                <p className="font-bold text-white">{inc.title}</p>
                <p className="text-slate-400">{inc.landmark}</p>
                <p className="text-blue-400 font-mono mt-0.5">{inc.source_fleet}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Map Bottom Legend */}
      <div className="bg-[#0b101c]/90 border-t border-slate-800 px-4 py-2 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span>Fleet A (Scanners)</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Fleet B (Tippers)</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Critical Hazard</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Verified Clean</span>
          </span>
        </div>
        <div className="font-mono text-slate-500">
          Lat: 17.7225° N • Lon: 83.3045° E (GVMC W14)
        </div>
      </div>
    </div>
  );
};
