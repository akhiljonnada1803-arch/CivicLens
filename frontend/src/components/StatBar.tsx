import React from 'react';
import { AlertOctagon, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { AnalyticsStats } from '../types';

interface StatBarProps {
  stats: AnalyticsStats | null;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export const StatBar: React.FC<StatBarProps> = ({
  stats,
  activeFilter,
  onFilterChange
}) => {
  const urgentCount = stats?.urgent_safety_count ?? 2;
  const sanitationCount = stats?.sanitation_roads_count ?? 9;
  const resolvedCount = stats?.resolved_count ?? 28;

  return (
    <div className="bg-slate-900/90 border-b border-slate-800 px-5 py-2.5 flex items-center gap-3 select-none">
      {/* 🚨 Urgent Safety Button */}
      <button
        onClick={() => onFilterChange(activeFilter === 'URGENT_SAFETY' ? 'ALL' : 'URGENT_SAFETY')}
        className={`flex-1 flex items-center justify-between px-4 py-2 rounded-lg border transition-all ${
          activeFilter === 'URGENT_SAFETY'
            ? 'bg-rose-950/70 border-rose-500 shadow-md shadow-rose-950/50'
            : 'bg-slate-950/60 hover:bg-slate-900 border-rose-900/40 text-slate-300'
        }`}
      >
        <div className="flex items-center space-x-2.5">
          <div className="w-6 h-6 rounded bg-rose-500/20 flex items-center justify-center text-rose-400">
            <AlertOctagon className="w-4 h-4 text-rose-500 animate-pulse" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-200">
            🚨 Urgent Safety
          </span>
        </div>
        <span className="text-lg font-black text-rose-400 font-mono">
          {urgentCount}
        </span>
      </button>

      {/* ⚠️ Sanitation & Roads Button */}
      <button
        onClick={() => onFilterChange(activeFilter === 'SANITATION_ROADS' ? 'ALL' : 'SANITATION_ROADS')}
        className={`flex-1 flex items-center justify-between px-4 py-2 rounded-lg border transition-all ${
          activeFilter === 'SANITATION_ROADS'
            ? 'bg-amber-950/70 border-amber-500 shadow-md shadow-amber-950/50'
            : 'bg-slate-950/60 hover:bg-slate-900 border-amber-900/40 text-slate-300'
        }`}
      >
        <div className="flex items-center space-x-2.5">
          <div className="w-6 h-6 rounded bg-amber-500/20 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-200">
            ⚠️ Sanitation / Roads
          </span>
        </div>
        <span className="text-lg font-black text-amber-400 font-mono">
          {sanitationCount}
        </span>
      </button>

      {/* ✅ Resolved Button */}
      <button
        onClick={() => onFilterChange(activeFilter === 'RESOLVED' ? 'ALL' : 'RESOLVED')}
        className={`flex-1 flex items-center justify-between px-4 py-2 rounded-lg border transition-all ${
          activeFilter === 'RESOLVED'
            ? 'bg-emerald-950/70 border-emerald-500 shadow-md shadow-emerald-950/50'
            : 'bg-slate-950/60 hover:bg-slate-900 border-emerald-900/40 text-slate-300'
        }`}
      >
        <div className="flex items-center space-x-2.5">
          <div className="w-6 h-6 rounded bg-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-200">
            ✅ Resolved
          </span>
        </div>
        <span className="text-lg font-black text-emerald-400 font-mono">
          {resolvedCount}
        </span>
      </button>

      {/* Clear Filter if active */}
      {activeFilter !== 'ALL' && (
        <button
          onClick={() => onFilterChange('ALL')}
          className="text-xs text-slate-400 hover:text-slate-200 underline px-2 py-1"
        >
          Reset Filter
        </button>
      )}
    </div>
  );
};

