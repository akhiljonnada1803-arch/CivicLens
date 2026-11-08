"use client";

import React, { useState } from "react";
import { Incident } from "@/lib/types";
import { SpatialMap } from "./SpatialMap";
import { formatTimeAgo } from "@/lib/utils";
import {
  Clock,
  MapPin,
  BrainCircuit,
  Eye,
  Send,
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
      <div className="w-full lg:w-5/12 flex flex-col bg-eco-surface-container-low border border-eco-outline-variant/70 rounded-lg overflow-hidden shadow-subtle">
        {/* Feed Header & Severity Filter Chips */}
        <div className="p-4 bg-eco-surface-container border-b border-eco-outline-variant/60 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-eco-primary animate-pulse" />
              <h2 className="text-sm font-headline font-bold text-eco-on-surface tracking-wide uppercase">
                Prioritized Incident Feed ({filtered.length})
              </h2>
            </div>
            <span className="text-xs font-mono font-medium text-eco-on-surface-variant bg-eco-surface-container-high px-2 py-0.5 rounded border border-eco-outline-variant/50">
              Ward 14 • Zone 3
            </span>
          </div>

          {/* Severity Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-label">
            {["ALL", "CRITICAL", "HIGH", "MEDIUM"].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSeverityFilter(lvl)}
                className={`px-3 py-1 rounded font-semibold text-xs transition-all ${
                  severityFilter === lvl
                    ? "bg-eco-primary text-eco-on-primary shadow-sm"
                    : "bg-eco-surface-container-high text-eco-on-surface-variant hover:text-eco-on-surface hover:bg-eco-surface-container-highest"
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
            <div className="text-center py-12 text-eco-on-surface-variant text-sm font-body">
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
                  className={`p-3.5 rounded-lg border transition-all cursor-pointer relative ${
                    isSelected
                      ? "bg-eco-surface-container-lowest border-eco-primary ring-2 ring-eco-primary/20 shadow-tonal"
                      : isCritical
                      ? "bg-eco-error-container/20 hover:bg-eco-surface-container border-eco-error/30"
                      : "bg-eco-surface-container-lowest/80 hover:bg-eco-surface-container border-eco-outline-variant/60"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5 font-label">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${
                        isCritical
                          ? "bg-eco-error-container text-eco-on-error-container border-eco-error/30"
                          : "bg-eco-tertiary-fixed text-eco-on-tertiary-fixed border-eco-tertiary/30"
                      }`}
                    >
                      {isCritical ? "🚨 " : "⚠️ "} {inc.title}
                    </span>
                    <span className="text-xs text-eco-on-surface-variant font-mono">
                      {formatTimeAgo(inc.timestamp)}
                    </span>
                  </div>

                  <h4 className="text-sm font-headline font-semibold text-eco-on-surface tracking-tight line-clamp-1 mb-1">
                    {inc.landmark}
                  </h4>

                  <div className="flex items-center space-x-1.5 text-xs text-eco-on-surface-variant mb-2.5 font-body">
                    <Clock className="w-3.5 h-3.5 text-eco-outline" />
                    <span>
                      Spotted by <strong className="text-eco-on-surface font-medium">{inc.source_fleet}</strong>
                    </span>
                  </div>

                  {/* Card Bottom: Assigned Contractor & Action */}
                  <div className="flex items-center justify-between pt-2 border-t border-eco-outline-variant/40 font-label">
                    <span className="text-xs px-2 py-0.5 rounded bg-eco-surface-container-high text-eco-secondary font-medium border border-eco-outline-variant/60">
                      Assigned: {inc.concessionaire}
                    </span>

                    <button
                      onClick={(e) => handleNotifyContractor(inc.id, e)}
                      className={`px-3 py-1 rounded text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                        isDispatched
                          ? "bg-eco-secondary-container text-eco-on-secondary-container border border-eco-secondary/40 cursor-default"
                          : "bg-eco-primary hover:bg-eco-primary-container text-eco-on-primary shadow-sm"
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
          <div className="bg-eco-surface-container-low border border-eco-outline-variant/70 rounded-lg p-4 shadow-subtle">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Evidence Photo with Crop BBox */}
              <div className="w-full sm:w-56 flex-shrink-0 font-label">
                <div className="text-xs font-bold uppercase tracking-wider text-eco-on-surface-variant mb-1.5 flex items-center justify-between">
                  <span className="flex items-center space-x-1.5">
                    <Eye className="w-3.5 h-3.5 text-eco-primary" />
                    <span>1080p Crop w/ BBox</span>
                  </span>
                  <span className="text-[10px] font-mono text-eco-primary bg-eco-primary-fixed px-1.5 py-0.5 rounded border border-eco-primary/30">
                    89% CONF
                  </span>
                </div>
                <div className="relative rounded overflow-hidden border border-eco-outline-variant aspect-video bg-black flex items-center justify-center">
                  <img
                    src={active.image_url}
                    alt={active.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 border-2 border-eco-error/80 m-2 rounded pointer-events-none flex items-start justify-end p-1">
                    <span className="bg-eco-error text-eco-on-error text-[8px] font-bold px-1 rounded uppercase font-label">
                      {active.defect_type.replace("_", " ")}
                    </span>
                  </div>
                </div>
              </div>

              {/* SLM Plain-English Context & Routing */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between font-label">
                  <h3 className="text-base font-headline font-bold text-eco-on-surface">{active.title}</h3>
                  <span className="text-xs font-mono text-eco-on-surface-variant bg-eco-surface-container-high px-2 py-0.5 rounded border border-eco-outline-variant/60">
                    {active.id}
                  </span>
                </div>

                <p className="text-xs font-body text-eco-on-surface-variant flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-eco-primary" />
                  <span>{active.landmark}</span>
                  <span className="text-eco-outline-variant">•</span>
                  <span className="text-eco-primary font-mono font-medium">
                    {active.latitude.toFixed(4)}° N, {active.longitude.toFixed(4)}° E
                  </span>
                </p>

                {/* On-Device SLM (SmolLM-135M) Output */}
                <div className="bg-eco-surface-container p-2.5 rounded border border-eco-outline-variant/60">
                  <div className="flex items-center space-x-1.5 text-xs font-label font-semibold text-eco-primary mb-1">
                    <BrainCircuit className="w-3.5 h-3.5" />
                    <span>On-Device SLM Context Validator (SmolLM-135M):</span>
                  </div>
                  <p className="text-xs font-body text-eco-on-surface italic pl-2.5 border-l-2 border-eco-primary leading-relaxed">
                    "{active.slm_summary}"
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs font-label text-eco-on-surface-variant">
                  <span>Routing: <strong className="text-eco-on-surface">Public Health & Sanitation</strong></span>
                  <span className="text-eco-primary font-mono font-semibold">SLA: &lt; 2 hours</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
