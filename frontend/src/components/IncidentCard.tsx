import React from 'react';
import { AlertTriangle, AlertOctagon, Car, Trash2, Send, CheckCircle, Clock } from 'lucide-react';
import { Incident } from '../types';

interface IncidentCardProps {
  incident: Incident;
  isSelected: boolean;
  onSelect: (incident: Incident) => void;
  onQuickDispatch: (e: React.MouseEvent, incident: Incident) => void;
}

export const IncidentCard: React.FC<IncidentCardProps> = ({
  incident,
  isSelected,
  onSelect,
  onQuickDispatch
}) => {
  // Format time ago
  const formatTimeAgo = (dateStr: string) => {
    try {
      const now = new Date();
      const date = new Date(dateStr);
      const diffMin = Math.max(1, Math.floor((now.getTime() - date.getTime()) / (1000 * 60)));
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHour = Math.floor(diffMin / 60);
      if (diffHour < 24) return `${diffHour}h ago`;
      return `${Math.floor(diffHour / 24)}d ago`;
    } catch {
      return 'Just now';
    }
  };

  const isUrgent = incident.urgency === 'URGENT_SAFETY';
  const isResolved = incident.status === 'RESOLVED';

  // Badge label and icon
  const getBadgeDetails = () => {
    switch (incident.defect_type) {
      case 'garbage_overflow':
        return { label: '⚠️ Garbage Overflow', icon: Trash2, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
      case 'open_manhole':
        return { label: '🚨 Open Manhole Hazard', icon: AlertOctagon, color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
      case 'vehicle_crash':
      case 'external_accident':
        return { label: '🚗 Vehicle Collision', icon: Car, color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
      case 'road_pothole':
        return { label: '⚠️ Road Pothole', icon: AlertTriangle, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
      default:
        return { label: `⚠️ ${incident.title}`, icon: AlertTriangle, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' };
    }
  };

  const badge = getBadgeDetails();

  // Status pill styling
  const getStatusBadge = () => {
    switch (incident.status) {
      case 'NEEDS_ACTION':
        return <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/60">Needs Action</span>;
      case 'QRT_DISPATCHED':
        return <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/60">QRT Dispatched</span>;
      case 'RESOLVED':
        return <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60">Resolved</span>;
      default:
        return <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">False Alarm</span>;
    }
  };

  return (
    <div
      onClick={() => onSelect(incident)}
      className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
        isSelected
          ? 'bg-slate-800/90 border-blue-500 ring-2 ring-blue-500/20 shadow-lg'
          : isUrgent && !isResolved
          ? 'bg-rose-950/20 hover:bg-slate-800/60 border-rose-900/40'
          : 'bg-slate-900/70 hover:bg-slate-800/60 border-slate-800'
      }`}
    >
      {/* Top row: Defect Type Tag & Recurrence */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${badge.color}`}>
          {badge.label}
        </span>
        {incident.sighting_count > 1 && (
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-bold" title="Spatial Deduplication Suppression Active">
            {incident.sighting_count}x sightings
          </span>
        )}
      </div>

      {/* Landmark address */}
      <h4 className="text-sm font-semibold text-white tracking-tight line-clamp-1 mb-1">
        {incident.landmark || incident.title}
      </h4>

      {/* Spotted by vehicle info */}
      <div className="flex items-center space-x-1.5 text-xs text-slate-400 mb-2.5">
        <Clock className="w-3 h-3 text-slate-500" />
        <span>Spotted by <strong className="text-slate-300">{incident.spotted_by_label}</strong> • {formatTimeAgo(incident.last_sighting_at)}</span>
      </div>

      {/* Bottom row: Status & Quick Action Button */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
        <div>
          {getStatusBadge()}
        </div>

        {incident.status !== 'RESOLVED' && (
          <button
            onClick={(e) => onQuickDispatch(e, incident)}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 text-xs font-medium transition-colors"
          >
            <Send className="w-3 h-3" />
            <span>Send to Inspector</span>
          </button>
        )}
      </div>
    </div>
  );
};

