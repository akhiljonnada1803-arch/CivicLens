import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Incident, FleetVehicle, Ward } from '../types';
import { Truck, Bus, Car, AlertTriangle, AlertOctagon, CheckCircle2, Layers } from 'lucide-react';

interface MapViewProps {
  incidents: Incident[];
  fleet: FleetVehicle[];
  ward: Ward | null;
  selectedIncident: Incident | null;
  onSelectIncident: (incident: Incident) => void;
}

type MapTheme = 'dark' | 'streets' | 'satellite';

const MAP_LAYERS: Record<MapTheme, { url: string; attribution: string; maxZoom: number }> = {
  dark: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
    maxZoom: 16
  },
  streets: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics',
    maxZoom: 18
  }
};

// Controller component to smoothly fly to selected incident or ward
const MapController: React.FC<{ selectedIncident: Incident | null; ward: Ward | null }> = ({
  selectedIncident,
  ward
}) => {
  const map = useMap();

  useEffect(() => {
    if (selectedIncident) {
      map.flyTo([selectedIncident.latitude, selectedIncident.longitude], 16, {
        animate: true,
        duration: 1.0
      });
    } else if (ward) {
      map.flyTo([ward.center_lat, ward.center_lon], 14, {
        animate: true,
        duration: 1.0
      });
    }
  }, [selectedIncident, ward, map]);

  return null;
};

// Custom icons generator using Leaflet DivIcon
const createIncidentIcon = (incident: Incident, isSelected: boolean) => {
  const isUrgent = incident.urgency === 'URGENT_SAFETY';
  const isResolved = incident.status === 'RESOLVED';

  let bgClass = 'bg-amber-500 border-amber-300';
  let pulseClass = '';
  if (isResolved) {
    bgClass = 'bg-emerald-500 border-emerald-300';
  } else if (isUrgent) {
    bgClass = 'bg-rose-500 border-rose-300';
    pulseClass = 'animate-ping';
  }

  const ringClass = isSelected ? 'ring-4 ring-blue-400 scale-125 z-50' : 'ring-2 ring-slate-900';

  return L.divIcon({
    className: 'custom-incident-pin',
    html: `
      <div class="relative flex items-center justify-center w-7 h-7">
        ${!isResolved ? `<span class="absolute inline-flex h-full w-full rounded-full ${bgClass} opacity-75 ${pulseClass}"></span>` : ''}
        <div class="relative w-6 h-6 rounded-full ${bgClass} ${ringClass} flex items-center justify-center text-white shadow-lg text-xs font-bold transition-transform">
          ${isUrgent ? '🚨' : isResolved ? '✓' : '⚠️'}
        </div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
};

const createFleetIcon = (vehicle: FleetVehicle) => {
  const isFleetB = vehicle.fleet_type === 'FLEET_B_CLEANER' || vehicle.vehicle_type === 'TIPPER';
  const isBus = vehicle.vehicle_type === 'TRANSIT_BUS';
  const emoji = isFleetB ? '🚚' : isBus ? '🚌' : '🧹';
  const borderColor = isFleetB ? 'border-amber-500/80' : 'border-blue-500/60';
  const tagColor = isFleetB ? 'text-amber-300' : 'text-blue-300';
  const fleetTag = isFleetB ? 'B:Cleaner' : 'A:Scanner';

  return L.divIcon({
    className: 'custom-fleet-pin',
    html: `
      <div class="flex items-center space-x-1.5 bg-slate-950/95 ${tagColor} border ${borderColor} rounded-full px-2.5 py-0.5 shadow-lg select-none">
        <span class="text-xs">${emoji}</span>
        <span class="text-[10px] font-bold text-slate-100">${vehicle.label.replace(' (Fleet B)', '').replace(' (APSRTC)', '')}</span>
        <span class="text-[9px] px-1 rounded ${isFleetB ? 'bg-amber-500/30 text-amber-200' : 'bg-blue-500/30 text-blue-200'} font-mono">${fleetTag}</span>
      </div>
    `,
    iconSize: [110, 26],
    iconAnchor: [55, 13]
  });
};

export const MapView: React.FC<MapViewProps> = ({
  incidents,
  fleet,
  ward,
  selectedIncident,
  onSelectIncident
}) => {
  const [theme, setTheme] = useState<MapTheme>('dark');

  // Parse Ward Polygon
  const polygonPositions = useMemo(() => {
    if (!ward) return [];
    try {
      const geo = JSON.parse(ward.polygon_geojson);
      if (geo.type === 'Polygon' && geo.coordinates && geo.coordinates[0]) {
        // GeoJSON is [lon, lat], Leaflet needs [lat, lon]
        return geo.coordinates[0].map(([lon, lat]: [number, number]) => [lat, lon]);
      }
    } catch (e) {
      console.error('Failed to parse ward polygon:', e);
    }
    return [];
  }, [ward]);

  const defaultCenter: [number, number] = ward ? [ward.center_lat, ward.center_lon] : [17.7225, 83.3045];

  return (
    <div className="relative w-full h-full min-h-[300px] flex-1 bg-slate-950">
      {/* Map Legend & Stats Overlay */}
      <div className="absolute top-3 left-3 z-[1000] bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-800 text-xs text-slate-300 shadow-xl pointer-events-auto">
        <div className="font-semibold text-white mb-1.5 flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          <span>Ward 14 Boundary Map</span>
        </div>
        <div className="flex items-center space-x-3 text-[11px]">
          <span className="flex items-center space-x-1 text-blue-400">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span>Blue = Fleet ({fleet.length})</span>
          </span>
          <span className="flex items-center space-x-1 text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span>Red = Alerts ({incidents.filter(i => i.status !== 'RESOLVED').length})</span>
          </span>
        </div>
      </div>

      {/* Map Style Selector Overlay (Zero API Keys) */}
      <div className="absolute top-3 right-3 z-[1000] bg-slate-900/90 backdrop-blur-md p-1 rounded-lg border border-slate-800 text-xs text-slate-300 shadow-xl flex items-center space-x-1 pointer-events-auto">
        {(['dark', 'streets', 'satellite'] as MapTheme[]).map((t) => (
          <button
            key={t}
            onClick={() => setTheme(t)}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors capitalize ${
              theme === t
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {t === 'dark' ? '🌓 Dark' : t === 'streets' ? '🗺️ Streets' : '🛰️ Satellite'}
          </button>
        ))}
      </div>

      <MapContainer
        center={defaultCenter}
        zoom={14}
        className="w-full h-full"
        zoomControl={false}
      >
        <MapController selectedIncident={selectedIncident} ward={ward} />

        {/* 100% Free, Public, Open Tiles (NO Watermark, Zero API Key Required) */}
        <TileLayer
          key={theme}
          attribution={MAP_LAYERS[theme].attribution}
          url={MAP_LAYERS[theme].url}
          maxZoom={MAP_LAYERS[theme].maxZoom}
        />

        {/* Ward 14 Boundary Polygon */}
        {polygonPositions.length > 0 && (
          <Polygon
            positions={polygonPositions}
            pathOptions={{
              color: '#38bdf8',
              weight: 2,
              fillColor: '#0284c7',
              fillOpacity: 0.12,
              dashArray: '5, 5'
            }}
          />
        )}

        {/* Fleet Vehicles Markers */}
        {fleet.map((v) => (
          <Marker
            key={v.id}
            position={[v.current_lat, v.current_lon]}
            icon={createFleetIcon(v)}
          >
            <Popup>
              <div className="text-xs p-1 space-y-1">
                <div className="font-bold text-blue-400 text-sm">{v.label}</div>
                <div className="text-slate-300">Reg: {v.registration_no}</div>
                <div className="text-slate-300">Speed: {v.speed_kmh} km/h</div>
                <div className="text-slate-300">SoC Temp: {v.battery_temp_c}°C ({v.thermal_state})</div>
                <div className="text-emerald-400 font-semibold">{v.status}</div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Incident Markers */}
        {incidents.map((inc) => (
          <Marker
            key={inc.id}
            position={[inc.latitude, inc.longitude]}
            icon={createIncidentIcon(inc, selectedIncident?.id === inc.id)}
            eventHandlers={{
              click: () => onSelectIncident(inc)
            }}
          >
            <Popup>
              <div className="text-xs p-1 max-w-[200px] space-y-1">
                <div className="font-bold text-white">{inc.title}</div>
                <div className="text-slate-400">{inc.landmark}</div>
                <div className="text-slate-300">Spotted by: {inc.spotted_by_label}</div>
                <div className="text-amber-400 font-semibold">Sightings: {inc.sighting_count}x</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

