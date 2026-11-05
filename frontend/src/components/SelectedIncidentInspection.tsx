import React, { useState } from 'react';
import { 
  Send, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  Clock, 
  MapPin, 
  BrainCircuit, 
  Building2, 
  Eye, 
  AlertOctagon,
  Sparkles
} from 'lucide-react';
import { Incident } from '../types';

interface SelectedIncidentInspectionProps {
  incident: Incident | null;
  onDispatch: (id: string) => Promise<void>;
  onUpdateStatus: (id: string, status: any, notes?: string) => Promise<void>;
}

export const SelectedIncidentInspection: React.FC<SelectedIncidentInspectionProps> = ({
  incident,
  onDispatch,
  onUpdateStatus
}) => {
  const [isDispatching, setIsDispatching] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [dispatchSuccess, setDispatchSuccess] = useState(false);

  if (!incident) {
    return (
      <div className="h-64 flex flex-col items-center justify-center p-6 bg-slate-900/60 border-t border-slate-800 text-center select-none">
        <Eye className="w-10 h-10 text-slate-600 mb-2" />
        <h4 className="text-sm font-semibold text-slate-400">No Incident Selected</h4>
        <p className="text-xs text-slate-600 mt-1">
          Click an alert card from the feed or a pin on the map to inspect AI visual evidence.
        </p>
      </div>
    );
  }

  const handleDispatch = async () => {
    try {
      setIsDispatching(true);
      await onDispatch(incident.id);
      setDispatchSuccess(true);
      setTimeout(() => setDispatchSuccess(false), 3000);
    } catch (e) {
      alert('Dispatch failed: ' + e);
    } finally {
      setIsDispatching(false);
    }
  };

  const handleResolve = async () => {
    try {
      setIsUpdating(true);
      await onUpdateStatus(incident.id, 'RESOLVED', 'Cleared by municipal field unit.');
    } catch (e) {
      alert('Status update failed: ' + e);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFalseAlarm = async () => {
    try {
      setIsUpdating(true);
      await onUpdateStatus(incident.id, 'FALSE_ALARM', 'Inspected and verified as false positive.');
    } catch (e) {
      alert('Status update failed: ' + e);
    } finally {
      setIsUpdating(false);
    }
  };

  const mapsUrl = `https://www.google.com/maps?q=${incident.latitude},${incident.longitude}`;

  return (
    <div className="bg-slate-900/95 border-t border-slate-800 p-4 max-h-[45vh] overflow-y-auto">
      <div className="flex flex-col lg:flex-row gap-5">
        {/* Left column: Photo Evidence with AI Bounding Box */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
            <span className="flex items-center space-x-1.5">
              <Eye className="w-3.5 h-3.5 text-blue-400" />
              <span>{incident.after_image_url ? 'Dual-Camera Closed-Loop Proof' : 'Photo Evidence (AI BBox)'}</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/60">
              {Math.round(incident.confidence * 100)}% Conf
            </span>
          </div>

          {incident.after_image_url ? (
            <div className="grid grid-cols-2 gap-2">
              <div className="relative rounded-lg overflow-hidden border border-slate-700 bg-slate-950 aspect-video">
                <img
                  src={incident.before_image_url || incident.image_url}
                  alt="Before Proof"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-1 left-1 bg-black/80 px-1.5 py-0.5 rounded text-[9px] font-bold text-red-400">
                  FRONT: BEFORE
                </div>
              </div>
              <div className="relative rounded-lg overflow-hidden border border-emerald-800 bg-slate-950 aspect-video">
                <img
                  src={incident.after_image_url}
                  alt="After Proof"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-1 left-1 bg-black/80 px-1.5 py-0.5 rounded text-[9px] font-bold text-emerald-400">
                  REAR: AFTER
                </div>
              </div>
            </div>
          ) : (
            <div className="relative rounded-lg overflow-hidden border border-slate-700 bg-slate-950 aspect-video flex items-center justify-center shadow-inner group">
              {incident.image_url ? (
                <img
                  src={incident.image_url}
                  alt="AI Evidence"
                  className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                />
              ) : (
                <div className="text-xs text-slate-500">Dashcam image processing...</div>
              )}
              <div className="absolute bottom-1.5 left-1.5 bg-black/75 backdrop-blur-sm text-[10px] text-slate-200 px-2 py-0.5 rounded border border-white/10 font-mono">
                WebP 42 KB • 1080p
              </div>
            </div>
          )}
        </div>

        {/* Center column: Verification Details & Plain-English SLM Context */}
        <div className="flex-1 space-y-2.5">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                {incident.title}
              </h3>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Ticket: {incident.id.slice(0, 8)}
              </span>
              {incident.concessionaire_name && (
                <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold">
                  Concessionaire: {incident.concessionaire_name}
                </span>
              )}
              {incident.billing_credit_approved && (
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                  ✓ 100% Billing Credit Approved
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 flex items-center space-x-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
              <span>{incident.landmark || 'Ward Central Route'}</span>
              <span className="text-slate-600">•</span>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 hover:text-blue-300 underline inline-flex items-center space-x-0.5"
              >
                <span>{incident.latitude.toFixed(4)}° N, {incident.longitude.toFixed(4)}° E (Maps)</span>
                <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
              </a>
            </p>
          </div>

          {/* On-Device SLM Summary (Italics quote) */}
          <div className="bg-slate-950/80 rounded-lg p-2.5 border border-slate-800/80">
            <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-blue-400 mb-1">
              <BrainCircuit className="w-3.5 h-3.5 text-blue-400" />
              <span>On-Device SLM Context Validator (SmolLM-135M):</span>
            </div>
            <p className="text-xs text-slate-200 italic font-medium leading-relaxed pl-2 border-l-2 border-blue-500">
              "{incident.slm_summary || 'Autonomous visual verification confirmed on carriageway.'}"
            </p>
          </div>

          {/* Sighting Count and Routing SLA */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Department Routing:</span>
              <span className="text-slate-200 font-semibold flex items-center space-x-1 mt-0.5">
                <Building2 className="w-3 h-3 text-amber-400 flex-shrink-0" />
                <span className="truncate">{incident.assigned_department}</span>
              </span>
            </div>
            <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Channel SLA:</span>
              <span className="text-emerald-400 font-mono font-semibold flex items-center space-x-1 mt-0.5">
                <Clock className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                <span>{incident.channel_sla}</span>
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-400 flex items-center space-x-2">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>Spotted <strong>{incident.sighting_count}x</strong> in past 4 hours by <strong>{incident.spotted_by_label}</strong></span>
          </div>
        </div>

        {/* Right column: Action Dispatch Buttons */}
        <div className="w-full lg:w-56 flex-shrink-0 flex flex-col justify-center space-y-2 select-none">
          {/* Dispatch to Telegram Bot */}
          <button
            onClick={handleDispatch}
            disabled={isDispatching || incident.status === 'RESOLVED'}
            className={`w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-lg text-xs font-bold transition-all shadow-md ${
              incident.telegram_dispatched
                ? 'bg-blue-900/60 text-blue-200 border border-blue-700/60 cursor-default'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>
              {isDispatching ? 'Pushing Bot Alert...' : incident.telegram_dispatched ? '✓ Dispatched to Telegram' : '📲 Dispatch to Telegram Bot'}
            </span>
          </button>

          {/* Mark Resolved */}
          <button
            onClick={handleResolve}
            disabled={isUpdating || incident.status === 'RESOLVED'}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 text-xs font-semibold transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>✓ Mark Resolved</span>
          </button>

          {/* False Alarm */}
          <button
            onClick={handleFalseAlarm}
            disabled={isUpdating || incident.status === 'RESOLVED'}
            className="w-full flex items-center justify-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>✕ False Alarm</span>
          </button>
        </div>
      </div>
    </div>
  );
};

