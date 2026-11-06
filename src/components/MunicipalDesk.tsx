"use client";

import React, { useState } from "react";
import { Incident, SeverityLevel } from "@/lib/types";
import { SpatialMap } from "./SpatialMap";
import { formatTimeAgo } from "@/lib/utils";
import {
  AlertTriangle,
  AlertOctagon,
  Clock,
  MapPin,
  BrainCircuit,
  Eye,
  Send,
  Building2,
  ExternalLink,
  Shield,
  Filter,
} from "lucide-react";

interface MunicipalDeskProps {
  incidents: Incident[];
  onRefresh: () => void;
}

export const MunicipalDesk: React.FC<MunicipalDeskProps> = ({ incidents, onRefresh }) => {
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(
    incidents.length > 0 ? incidents[0] : null
  );
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [dispatchedMap, setDispatchedMap] = useState<Record<string, boolean>>({});

  // Sync selectedIncident when incidents prop updates
  React.useEffect(() => {
    if (!selectedIncident && incidents.length > 0) {
      setSelectedIncident(incidents[0]);
    }
  }, [incidents, selectedIncident]);

  const filtered = incidents.filter((inc) => {
    if (severityFilter === "ALL") return true;
    return inc.severity === severityFilter;
  });

  const active = selectedIncident || filtered[0] || incidents[0];

  const handleNotifyContractor = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDispatchedMap((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden gap-4">
      {/* Left Column: Live Incident Feed & Ward Summary */}
      <div className="w-full lg:w-5/12 flex flex-col bg-[#0b0f19] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        {/* Feed Header & Severity Filter Pills */}
        <div className="p-4 bg-[#0e1422] border-b border-slate-800 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <h2 className="text-sm font-bold text-white tracking-wide uppercase">
                Prioritized Incident Feed ({filtered.length})
              </h2>
            </div>
            <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              Ward 14 • Zone 3
            </span>
          </div>

          {/* Severity Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            {["ALL", "CRITICAL", "HIGH", "MEDIUM"].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSeverityFilter(lvl)}
                className={`px-3 py-1 rounded-md font-semibold text-[11px] transition-all ${
                  severityFilter === lvl
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                {lvl === "ALL" ? "All Hazards" : lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Incident Cards */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              No incidents matching the selected filter.
            </div>
          ) : (
            filtered.map((inc) => {
              const isSelected = active?.id === inc.id;
              const isCritical = inc.severity === "CRITICAL";
              const isDispatched = dispatchedMap[inc.id] || inc.status === "QRT_DISPATCHED";

              return (
                <div
                  key={inc.id}
                  onClick={() => setSelectedIncident(inc)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? "bg-slate-800/90 border-blue-500 ring-2 ring-blue-500/20 shadow-lg"
                      : isCritical
                      ? "bg-rose-950/20 hover:bg-slate-800/50 border-rose-900/40"
                      : "bg-[#0f172a]/70 hover:bg-slate-800/50 border-slate-800/80"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border ${
                        isCritical
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                          : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                      }`}
                    >
                      {isCritical ? "🚨 " : "⚠️ "} {inc.title}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {formatTimeAgo(inc.timestamp)}
                    </span>
                  </div>

                  <h4 className="text-xs font-semibold text-white tracking-tight line-clamp-1 mb-1">
                    {inc.landmark}
                  </h4>

                  <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 mb-2">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>
                      Spotted by <strong className="text-slate-300">{inc.source_fleet}</strong>
                    </span>
                  </div>

                  {/* Card Bottom: Assigned Contractor & Action */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-amber-300 font-medium border border-slate-700/80">
                      Assigned: {inc.concessionaire}
                    </span>

                    <button
                      onClick={(e) => handleNotifyContractor(inc.id, e)}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all flex items-center space-x-1 ${
                        isDispatched
                          ? "bg-blue-900/60 text-blue-200 border border-blue-700/60 cursor-default"
                          : "bg-blue-600 hover:bg-blue-500 text-white shadow"
                      }`}
                    >
                      <Send className="w-3 h-3" />
                      <span>{isDispatched ? "QRT Dispatched" : "Notify Contractor"}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Spatial Map & Selected Incident Inspection */}
      <div className="w-full lg:w-7/12 flex flex-col gap-4 overflow-hidden">
        {/* Interactive Spatial Vector GIS Map */}
        <div className="flex-1 min-h-[340px]">
          <SpatialMap
            incidents={incidents}
            selectedIncident={active}
            onSelectIncident={setSelectedIncident}
          />
        </div>

        {/* Selected Incident Inspector Card */}
        {active && (
          <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-4 shadow-xl">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Evidence Photo with Simulated BBox */}
              <div className="w-full sm:w-56 flex-shrink-0">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center space-x-1">
                    <Eye className="w-3.5 h-3.5 text-blue-400" />
                    <span>1080p Crop w/ BBox</span>
                  </span>
                  <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
                    89% CONF
                  </span>
                </div>
                <div className="relative rounded-lg overflow-hidden border border-slate-700 aspect-video bg-black flex items-center justify-center">
                  <img
                    src={active.image_url}
                    alt={active.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 border-2 border-red-500/80 m-2 rounded pointer-events-none flex items-start justify-end p-1">
                    <span className="bg-red-600 text-white text-[8px] font-bold px-1 rounded uppercase">
                      {active.defect_type.replace("_", " ")}
                    </span>
                  </div>
                </div>
              </div>

              {/* SLM Plain-English Summary & Context */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">{active.title}</h3>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {active.id}
                  </span>
                </div>

                <p className="text-xs text-slate-400 flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-blue-400" />
                  <span>{active.landmark}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-blue-400 font-mono">
                    {active.latitude.toFixed(4)}° N, {active.longitude.toFixed(4)}° E
                  </span>
                </p>

                {/* On-Device SLM (SmolLM-135M) Output */}
                <div className="bg-[#090d16] p-2.5 rounded-lg border border-slate-800">
                  <div className="flex items-center space-x-1.5 text-[10px] font-semibold text-blue-400 mb-0.5">
                    <BrainCircuit className="w-3.5 h-3.5" />
                    <span>On-Device SLM Context Validator (SmolLM-135M):</span>
                  </div>
                  <p className="text-xs text-slate-200 italic pl-2 border-l-2 border-blue-500">
                    "{active.slm_summary}"
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                  <span>Routing: <strong>Public Health & Sanitation</strong></span>
                  <span className="text-emerald-400 font-mono font-medium">SLA: &lt; 2 hours</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

