"use client";

import React, { useEffect, useState } from "react";
import { Incident } from "@/lib/types";
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

interface FleetVehicle {
  id: string;
  label: string;
  registration_no: string;
  current_lat: number;
  current_lon: number;
  fleet_type: string;
  vehicle_type: string;
  speed_kmh: number;
  status: string;
}

export interface LiveMapProps {
  incidents: Incident[];
  selectedIncident: Incident | null;
  onSelectIncident: (inc: Incident) => void;
  fleet?: FleetVehicle[];
}

type MapTheme = "streets" | "satellite" | "canvas";

const MAP_LAYERS: Record<MapTheme, { url: string; attribution: string; maxZoom: number }> = {
  streets: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri, Maxar, Earthstar Geographics",
    maxZoom: 18,
  },
  canvas: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ",
    maxZoom: 16,
  },
};

const DEFAULT_FLEET: FleetVehicle[] = [
  {
    id: "BUS-12",
    label: "Fleet A: APSRTC Bus #12",
    registration_no: "AP-31-Z-4412",
    current_lat: 17.724,
    current_lon: 83.3055,
    fleet_type: "FLEET_A_SCANNER",
    vehicle_type: "TRANSIT_BUS",
    speed_kmh: 24,
    status: "Roving 1 FPS Scan",
  },
  {
    id: "PCR-04",
    label: "Fleet A: Police PCR #04",
    registration_no: "AP-31-P-0904",
    current_lat: 17.725,
    current_lon: 83.303,
    fleet_type: "FLEET_A_SCANNER",
    vehicle_type: "PATROL_VAN",
    speed_kmh: 32,
    status: "Roving 1 FPS Scan",
  },
  {
    id: "TIP-04",
    label: "Fleet B: Tipper #04 (Dual-Cam)",
    registration_no: "AP-31-TT-4402",
    current_lat: 17.7212,
    current_lon: 83.3078,
    fleet_type: "FLEET_B_CLEANER",
    vehicle_type: "TIPPER",
    speed_kmh: 18,
    status: "Dual-Cam Auto Proof Active",
  },
];

const WARD_14_COORDINATES: [number, number][] = [
  [17.7285, 83.301],
  [17.7295, 83.3115],
  [17.724, 83.314],
  [17.7175, 83.3095],
  [17.7185, 83.3015],
  [17.7285, 83.301],
];

// Controller component to smoothly fly to selected incident
const MapController: React.FC<{ selected: Incident | null }> = ({ selected }) => {
  const map = useMap();
  useEffect(() => {
    if (selected && selected.latitude && selected.longitude) {
      map.flyTo([selected.latitude, selected.longitude], 16, {
        animate: true,
        duration: 0.8,
      });
    }
  }, [selected, map]);
  return null;
};

export const LiveMapInner: React.FC<LiveMapProps> = ({
  incidents,
  selectedIncident,
  onSelectIncident,
  fleet = DEFAULT_FLEET,
}) => {
  const [theme, setTheme] = useState<MapTheme>("streets");

  const createIncidentIcon = (incident: Incident, isSelected: boolean) => {
    const isCritical = incident.severity === "CRITICAL";
    const isResolved = incident.status === "RESOLVED";

    let bgStyle = "background-color: #556131; border: 2px solid #dae9ac;"; // eco-tertiary
    let pulseHtml = "";

    if (isResolved) {
      bgStyle = "background-color: #356644; border: 2px solid #b9efc4;"; // eco-primary
    } else if (isCritical) {
      bgStyle = "background-color: #ba1a1a; border: 2px solid #ffdad6;"; // eco-error
      pulseHtml = `<span style="position: absolute; inset: -4px; border-radius: 9999px; background-color: rgba(186, 26, 26, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>`;
    }

    const ringStyle = isSelected
      ? "box-shadow: 0 0 0 4px #356644, 0 4px 12px rgba(24, 29, 25, 0.3); transform: scale(1.25); z-index: 1000;"
      : "box-shadow: 0 2px 6px rgba(24, 29, 25, 0.2);";

    return L.divIcon({
      className: "custom-incident-pin",
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 28px; height: 28px;">
          ${!isResolved ? pulseHtml : ""}
          <div style="position: relative; width: 24px; height: 24px; border-radius: 9999px; ${bgStyle} ${ringStyle} display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 11px; font-weight: bold; transition: all 0.2s ease;">
            ${isResolved ? "✓" : isCritical ? "🚨" : "⚠️"}
          </div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
  };

  const createFleetIcon = (vehicle: FleetVehicle) => {
    const isTipper = vehicle.fleet_type === "FLEET_B_CLEANER" || vehicle.vehicle_type === "TIPPER";
    const emoji = isTipper ? "🚚" : "🚌";
    const bg = isTipper ? "#dae9ac" : "#d2e8d4";
    const color = isTipper ? "#161f00" : "#0d1f13";
    const border = isTipper ? "#6d7a47" : "#506353";

    return L.divIcon({
      className: "custom-fleet-pin",
      html: `
        <div style="display: flex; align-items: center; gap: 4px; background: ${bg}; color: ${color}; border: 1.5px solid ${border}; border-radius: 9999px; padding: 2px 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.15); font-family: 'Atkinson Hyperlegible', sans-serif; white-space: nowrap; user-select: none;">
          <span style="font-size: 12px;">${emoji}</span>
          <span style="font-size: 10px; font-weight: bold;">${vehicle.id}</span>
        </div>
      `,
      iconSize: [85, 24],
      iconAnchor: [42, 12],
    });
  };

  return (
    <div className="relative w-full h-full min-h-[380px] rounded-lg overflow-hidden border border-eco-outline-variant bg-eco-surface-container select-none">
      {/* Top Left Overlay: Ward 14 Legend */}
      <div className="absolute top-3 left-3 z-[1000] bg-eco-surface-container-lowest/90 backdrop-blur-md px-3.5 py-2 rounded-lg border border-eco-outline-variant text-xs text-eco-on-surface shadow-subtle font-label pointer-events-auto">
        <div className="font-headline font-bold text-eco-primary mb-1 flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-eco-primary animate-pulse" />
          <span>GVMC Ward 14 Spatial GIS</span>
        </div>
        <div className="flex items-center space-x-3 text-[11px] text-eco-on-surface-variant">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-eco-secondary" />
            <span>Fleet ({fleet.length})</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-eco-error" />
            <span>Alerts ({incidents.filter((i) => i.status !== "RESOLVED").length})</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-eco-primary" />
            <span>Clean</span>
          </span>
        </div>
      </div>

      {/* Top Right Overlay: Map Theme Selector */}
      <div className="absolute top-3 right-3 z-[1000] bg-eco-surface-container-lowest/90 backdrop-blur-md p-1 rounded-lg border border-eco-outline-variant text-xs shadow-subtle flex items-center space-x-1 font-label pointer-events-auto">
        <button
          onClick={() => setTheme("streets")}
          className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
            theme === "streets"
              ? "bg-eco-primary text-eco-on-primary shadow-sm"
              : "text-eco-on-surface-variant hover:text-eco-on-surface hover:bg-eco-surface-container"
          }`}
        >
          🗺️ Streets
        </button>
        <button
          onClick={() => setTheme("satellite")}
          className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
            theme === "satellite"
              ? "bg-eco-primary text-eco-on-primary shadow-sm"
              : "text-eco-on-surface-variant hover:text-eco-on-surface hover:bg-eco-surface-container"
          }`}
        >
          🛰️ Satellite
        </button>
        <button
          onClick={() => setTheme("canvas")}
          className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
            theme === "canvas"
              ? "bg-eco-primary text-eco-on-primary shadow-sm"
              : "text-eco-on-surface-variant hover:text-eco-on-surface hover:bg-eco-surface-container"
          }`}
        >
          🌓 Canvas
        </button>
      </div>

      <MapContainer
        center={[17.7235, 83.306]}
        zoom={15}
        className="w-full h-full"
        zoomControl={false}
      >
        <MapController selected={selectedIncident} />

        {/* Real OpenStreetMap / Esri Tiles */}
        <TileLayer
          key={theme}
          attribution={MAP_LAYERS[theme].attribution}
          url={MAP_LAYERS[theme].url}
          maxZoom={MAP_LAYERS[theme].maxZoom}
        />

        {/* Ward 14 Boundary Polygon */}
        <Polygon
          positions={WARD_14_COORDINATES}
          pathOptions={{
            color: "#356644",
            weight: 2,
            fillColor: "#4d7f5b",
            fillOpacity: 0.12,
            dashArray: "4, 4",
          }}
        />

        {/* Fleet Vehicle Pins */}
        {fleet.map((v) => (
          <Marker
            key={v.id}
            position={[v.current_lat, v.current_lon]}
            icon={createFleetIcon(v)}
          >
            <Popup>
              <div className="text-xs p-1 space-y-1 font-label">
                <div className="font-bold text-eco-primary text-sm font-headline">{v.label}</div>
                <div className="text-eco-on-surface-variant font-mono">Reg: {v.registration_no}</div>
                <div className="text-eco-on-surface">Speed: {v.speed_kmh} km/h</div>
                <div className="text-eco-secondary font-semibold">{v.status}</div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Incident Alert Pins */}
        {incidents.map((inc) => (
          <Marker
            key={inc.id}
            position={[inc.latitude, inc.longitude]}
            icon={createIncidentIcon(inc, selectedIncident?.id === inc.id)}
            eventHandlers={{
              click: () => onSelectIncident(inc),
            }}
          >
            <Popup>
              <div className="text-xs p-1 max-w-[220px] space-y-1 font-label">
                <div className="font-bold text-eco-on-surface font-headline">{inc.title}</div>
                <div className="text-eco-on-surface-variant font-body">{inc.landmark}</div>
                <div className="text-eco-primary font-mono text-[11px]">Spotted by: {inc.source_fleet}</div>
                <div className="pt-1 flex items-center justify-between text-[10px]">
                  <span className="font-bold uppercase text-eco-error">{inc.severity}</span>
                  <span className="font-semibold text-eco-secondary">{inc.status}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

