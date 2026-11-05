import React from 'react';
import { ShieldAlert, Radio, DollarSign, PlayCircle, MapPin, UserCheck, RefreshCw } from 'lucide-react';

interface HeaderProps {
  selectedZone: string;
  onZoneChange: (zone: string) => void;
  onOpenSimulation: () => void;
  onOpenAnalytics: () => void;
  onOpenMobileConnect: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  selectedZone,
  onZoneChange,
  onOpenSimulation,
  onOpenAnalytics,
  onOpenMobileConnect,
  onRefresh,
  isRefreshing
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 px-5 py-3 flex flex-wrap items-center justify-between gap-4 select-none">
      {/* Brand & Municipality Location */}
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-inner">
          <ShieldAlert className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-white text-base tracking-tight">CivicLens Command</span>
            <span className="text-slate-500">•</span>
            <span className="text-blue-400 font-semibold text-sm">Ward 14 Operations</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-950 text-emerald-400 border border-emerald-800/60 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5"></span>
              Live Edge Feed
            </span>
          </div>
          <p className="text-xs text-slate-400 flex items-center space-x-1 mt-0.5">
            <MapPin className="w-3 h-3 text-slate-500" />
            <span>GVMC Visakhapatnam • Siripuram / Maddilapalem</span>
          </p>
        </div>
      </div>

      {/* Center Zone & Officer Selectors */}
      <div className="flex items-center space-x-3 text-xs">
        <div className="flex items-center space-x-1.5 bg-slate-950 px-3 py-1.5 rounded-md border border-slate-800">
          <span className="text-slate-400 font-medium">Zone:</span>
          <select 
            value={selectedZone}
            onChange={(e) => onZoneChange(e.target.value)}
            className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
          >
            <option value="ZONE-03" className="bg-slate-900">Zone 3 (Central)</option>
            <option value="ZONE-02" className="bg-slate-900">Zone 2 (North)</option>
            <option value="ZONE-04" className="bg-slate-900">Zone 4 (East)</option>
          </select>
        </div>

        <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-md border border-slate-800">
          <UserCheck className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-slate-300 font-medium">K. V. Ramana (Sanitary Inspector)</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors border border-slate-700/60"
          title="Refresh Data"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
        </button>

        <button
          onClick={onOpenAnalytics}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition-colors shadow-sm"
        >
          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          <span>CapEx Calculator</span>
        </button>

        <button
          onClick={onOpenMobileConnect}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-xs font-semibold text-emerald-300 transition-colors shadow-sm"
        >
          <span>📱</span>
          <span>Connect Mobile</span>
        </button>

        <button
          onClick={onOpenSimulation}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-colors"
        >
          <PlayCircle className="w-3.5 h-3.5" />
          <span>Simulate Edge Patrol</span>
        </button>
      </div>
    </header>
  );
};

