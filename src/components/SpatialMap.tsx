"use client";

import React, { useState } from "react";
import { Incident } from "@/lib/types";

interface SpatialMapProps {
  incidents: Incident[];
  selectedIncident: Incident | null;
  onSelectIncident: (inc: Incident) => void;
}

// Bounding box for Ward 14 (Siripuram / Maddilapalem)
const MIN_LAT = 17.716;
const MAX_LAT = 17.732;
const MIN_LON = 83.298;
const MAX_LON = 83.315;

export const SpatialMap: React.FC<SpatialMapProps> = ({
  incidents,
  selectedIncident,
  onSelectIncident,
}) => {
  const [mapLayer, setMapLayer] = useState<"ECO_GIS" | "TERRAIN">("ECO_GIS");

  const projectCoords = (lat: number, lon: number) => {
    const x = ((lon - MIN_LON) / (MAX_LON - MIN_LON)) * 100;
    const y = (1 - (lat - MIN_LAT) / (MAX_LAT - MIN_LAT)) * 100;
    return {
      x: Math.max(6, Math.min(94, x)),
      y: Math.max(6, Math.min(94, y)),
    };
  };

  const fleetVehicles = [
    { id: "BUS-12", label: "Fleet A: APSRTC Bus #12", lat: 17.724, lon: 83.3055, type: "BUS" },
    { id: "PCR-04", label: "Fleet A: Police PCR #04", lat: 17.725, lon: 83.303, type: "PCR" },
    { id: "TIP-04", label: "Fleet B: Tipper #04 (Dual-Cam)", lat: 17.7212, lon: 83.3078, type: "TIPPER" },
  ];

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-lg overflow-hidden border border-eco-outline-variant/80 bg-eco-surface-container flex flex-col shadow-subtle select-none">
      {/* Top Map Toolbar */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2 bg-eco-surface-container-lowest/90 backdrop-blur-md px-3 py-1.5 rounded border border-eco-outline-variant text-xs text-eco-on-surface shadow-subtle font-label">
        <div className="w-2 h-2 rounded-full bg-eco-primary animate-pulse" />
        <span className="font-semibold text-eco-primary">GVMC Ward 14 Spatial Vector GIS</span>
        <span className="text-eco-outline-variant">|</span>
        <span className="text-eco-on-surface-variant font-mono">15m Deduplication Active</span>
      </div>

      <div className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-eco-surface-container-lowest/90 backdrop-blur-md p-1 rounded border border-eco-outline-variant text-xs shadow-subtle font-label">
        <button
          onClick={() => setMapLayer("ECO_GIS")}
          className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
            mapLayer === "ECO_GIS"
              ? "bg-eco-primary text-eco-on-primary shadow-sm"
              : "text-eco-on-surface-variant hover:text-eco-on-surface hover:bg-eco-surface-container-high"
          }`}
        >
          Eco GIS
        </button>
        <button
          onClick={() => setMapLayer("TERRAIN")}
          className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
            mapLayer === "TERRAIN"
              ? "bg-eco-primary text-eco-on-primary shadow-sm"
              : "text-eco-on-surface-variant hover:text-eco-on-surface hover:bg-eco-surface-container-high"
          }`}
        >
          Terrain Grid
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
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#e0e3dd" strokeWidth="0.5" />
            </pattern>
            <linearGradient id="wardFill" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#4d7f5b" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#9ed3a9" stopOpacity="0.08" />
            </linearGradient>
          </defs>

          {/* Grid Background */}
          <rect width="100" height="100" fill="url(#grid)" />

          {/* Ward 14 Boundary Polygon */}
          <polygon
            points="15,20 85,15 92,65 60,90 20,85 15,20"
            fill="url(#wardFill)"
            stroke="#356644"
            strokeWidth="0.8"
            strokeDasharray="2, 1"
          />

          {/* Major Road Arteries */}
          <path d="M 10 45 Q 45 48 90 40" fill="none" stroke="#c1c9bf" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M 35 15 Q 48 55 65 92" fill="none" stroke="#c1c9bf" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M 15 80 Q 55 75 90 70" fill="none" stroke="#b7ccb8" strokeWidth="1.8" />
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
                className={`flex items-center space-x-1 px-2.5 py-0.5 rounded-full border shadow-subtle backdrop-blur-md font-label ${
                  isTipper
                    ? "bg-eco-tertiary-fixed text-eco-on-tertiary-fixed border-eco-tertiary/60"
                    : "bg-eco-secondary-fixed text-eco-on-secondary-fixed border-eco-secondary/60"
                }`}
              >
                <span className="text-xs">{isTipper ? "🚚" : "🚌"}</span>
                <span className="text-[10px] font-bold font-mono">{v.id}</span>
              </div>
              {/* Tooltip */}
              <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2.5 py-1 bg-eco-inverse-surface text-eco-inverse-on-surface rounded text-xs whitespace-nowrap shadow-tonal z-30 font-label">
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
              {isCritical && !isResolved && (
                <span className="absolute -inset-2 rounded-full bg-eco-error/25 animate-ping" />
              )}

              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-subtle transition-all ${
                  isSelected
                    ? "ring-4 ring-eco-primary bg-eco-primary text-eco-on-primary scale-110 z-20"
                    : isResolved
                    ? "bg-eco-primary-container text-eco-on-primary-container border border-eco-primary"
                    : isCritical
                    ? "bg-eco-error text-eco-on-error border border-eco-error-container"
                    : "bg-eco-tertiary text-eco-on-tertiary font-bold border border-eco-tertiary-container"
                }`}
              >
                {isResolved ? "✓" : isCritical ? "🚨" : "⚠️"}
              </div>

              {/* Pin Hover Tooltip */}
              <div className="hidden group-hover:block absolute top-full left-1/2 -translate-x-1/2 mt-1.5 px-3 py-1.5 bg-eco-surface-container-lowest border border-eco-outline-variant rounded-md text-xs text-eco-on-surface whitespace-nowrap shadow-tonal z-30 font-label">
                <p className="font-bold text-eco-on-surface font-headline">{inc.title}</p>
                <p className="text-eco-on-surface-variant font-body">{inc.landmark}</p>
                <p className="text-eco-primary font-mono mt-0.5">{inc.source_fleet}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Map Bottom Legend */}
      <div className="bg-eco-surface-container-high border-t border-eco-outline-variant px-4 py-2 flex items-center justify-between text-xs text-eco-on-surface-variant font-label">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-eco-secondary" />
            <span>Fleet A (Scanners)</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-eco-tertiary" />
            <span>Fleet B (Tippers)</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-eco-error" />
            <span>Critical Hazard</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-eco-primary" />
            <span>Verified Clean</span>
          </span>
        </div>
        <div className="font-mono text-eco-on-surface-variant/80">
          Lat: 17.7225° N • Lon: 83.3045° E (GVMC W14)
        </div>
      </div>
    </div>
  );
};
