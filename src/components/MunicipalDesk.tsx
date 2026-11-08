"use client";

import React, { useState } from "react";
import { Incident } from "@/lib/types";
import { LiveMap } from "./LiveMap";
import { formatTimeAgo } from "@/lib/utils";
import { api } from "@/lib/api";
import {
  Clock,
  MapPin,
  BrainCircuit,
  Eye,
  Send,
  Search,
  CheckCircle2,
  XCircle,
  ExternalLink,
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
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  React.useEffect(() => {
    if (!selectedIncident && incidents.length > 0) {
      setSelectedIncident(incidents[0]);
    } else if (selectedIncident) {
      const match = incidents.find((i) => i.id === selectedIncident.id);
      if (match) setSelectedIncident(match);
    }
  }, [incidents, selectedIncident]);

  const filtered = incidents.filter((inc) => {
    if (severityFilter !== "ALL" && inc.severity !== severityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = inc.title?.toLowerCase().includes(q);
      const matchLandmark = inc.landmark?.toLowerCase().includes(q);
      const matchVehicle = inc.source_fleet?.toLowerCase().includes(q);
      const matchSummary = inc.slm_summary?.toLowerCase().includes(q);
      if (!matchTitle && !matchLandmark && !matchVehicle && !matchSummary) return false;
    }
    return true;
  });

  const isSelectedInFiltered = filtered.some((i) => i.id === selectedIncident?.id);
  const active = (isSelectedInFiltered ? selectedIncident : filtered[0]) || incidents[0];

  const handleUpdateStatus = async (status: string, notes?: string) => {
    if (!active) return;
    try {
      setIsUpdating(true);
      await api.updateIncidentStatus(active.id, status, notes);
      setStatusMessage(`Status updated to ${status}`);
      setTimeout(() => setStatusMessage(null), 3500);
      onRefresh();
    } catch (e: any) {
      alert("Failed to update status: " + e.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const mapsUrl = active ? `https://www.google.com/maps?q=${active.latitude},${active.longitude}` : "#";

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden gap-4 font-body">
      {/* Left Column: Live Incident Feed & Ward Summary */}
      <div className="w-full lg:w-5/12 flex flex-col bg-eco-surface-container-low border border-eco-outline-variant/70 rounded-lg overflow-hidden shadow-subtle">
        {/* Feed Header & Controls */}
        <div className="p-3.5 bg-eco-surface-container border-b border-eco-outline-variant/60 flex flex-col gap-2.5">
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

          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-eco-outline" />
            <input
              type="text"
              placeholder="Search landmark, vehicle, or hazard keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-eco-surface-container-lowest border border-eco-outline-variant rounded-md pl-9 pr-3 py-1.5 text-xs text-eco-on-surface placeholder:text-eco-on-surface-variant/60 focus:outline-none focus:border-eco-primary font-label"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-eco-on-surface-variant hover:text-eco-on-surface"
              >
                ✕
              </button>
            )}
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
              No incidents matching the filter or search query.
            </div>
          ) : (
            filtered.map((inc) => {
              const isSelected = active?.id === inc.id;
              const isCritical = inc.severity === "CRITICAL";
              const isDispatched = inc.status === "QRT_DISPATCHED";
              const isResolved = inc.status === "RESOLVED";

              return (
                <div
                  key={inc.id}
                  onClick={() => setSelectedIncident(inc)}
                  className={`p-3.5 rounded-lg border transition-all cursor-pointer relative ${
                    isSelected
                      ? "bg-eco-surface-container-lowest border-eco-primary ring-2 ring-eco-primary/25 shadow-tonal"
                      : isResolved
                      ? "bg-eco-surface-container-lowest/60 hover:bg-eco-surface-container border-eco-outline-variant/40 opacity-70"
                      : isCritical
                      ? "bg-eco-error-container/20 hover:bg-eco-surface-container border-eco-error/30"
                      : "bg-eco-surface-container-lowest/80 hover:bg-eco-surface-container border-eco-outline-variant/60"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5 font-label">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${
                        isResolved
                          ? "bg-eco-primary-container text-eco-on-primary-container border-eco-primary/30"
                          : isCritical
                          ? "bg-eco-error-container text-eco-on-error-container border-eco-error/30"
                          : "bg-eco-tertiary-fixed text-eco-on-tertiary-fixed border-eco-tertiary/30"
                      }`}
                    >
                      {isResolved ? "✅ RESOLVED" : isCritical ? "🚨 " + inc.title : "⚠️ " + inc.title}
                    </span>
                    <span className="text-xs text-eco-on-surface-variant font-mono">
                      {formatTimeAgo(inc.timestamp)}
                    </span>
                  </div>

                  <h4 className="text-sm font-headline font-semibold text-eco-on-surface tracking-tight line-clamp-1 mb-1">
                    {inc.landmark}
                  </h4>

                  <div className="flex items-center space-x-1.5 text-xs text-eco-on-surface-variant mb-2 font-body">
                    <Clock className="w-3.5 h-3.5 text-eco-outline" />
                    <span>
                      Spotted by <strong className="text-eco-on-surface font-medium">{inc.source_fleet}</strong>
                    </span>
                  </div>

                  {/* Card Bottom: Assigned Contractor & Action */}
                  <div className="flex items-center justify-between pt-2 border-t border-eco-outline-variant/40 font-label">
                    <span className="text-xs px-2 py-0.5 rounded bg-eco-surface-container-high text-eco-secondary font-medium border border-eco-outline-variant/60">
                      {inc.concessionaire}
                    </span>

                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                        isResolved
                          ? "bg-eco-primary-container text-eco-on-primary-container border-eco-primary/30"
                          : isDispatched
                          ? "bg-eco-secondary-container text-eco-on-secondary-container border-eco-secondary/40"
                          : "bg-eco-surface-container text-eco-on-surface-variant border-eco-outline-variant"
                      }`}
                    >
                      {isResolved ? "Closed / Verified" : isDispatched ? "QRT Dispatched" : "Needs Action"}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Live GIS Map & Selected Incident Inspection */}
      <div className="w-full lg:w-7/12 flex flex-col gap-4 overflow-hidden">
        {/* Interactive Spatial Leaflet GIS Map */}
        <div className="flex-1 min-h-[350px]">
          <LiveMap
            incidents={incidents}
            selectedIncident={active}
            onSelectIncident={setSelectedIncident}
          />
        </div>

        {/* Selected Incident Inspector Card */}
        {active && (
          <div className="bg-eco-surface-container-low border border-eco-outline-variant/70 rounded-lg p-4 shadow-subtle flex-shrink-0">
            {statusMessage && (
              <div className="mb-2 text-xs font-label bg-eco-primary-container text-eco-on-primary-container px-3 py-1.5 rounded border border-eco-primary/30 animate-in fade-in duration-200">
                ✓ {statusMessage}
              </div>
            )}

            <div className="flex flex-col lg:flex-row gap-4">
              {/* Evidence Photo with Crop BBox */}
              <div className="w-full sm:w-52 lg:w-56 flex-shrink-0 font-label">
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
                  <MapPin className="w-3.5 h-3.5 text-eco-primary flex-shrink-0" />
                  <span>{active.landmark}</span>
                  <span className="text-eco-outline-variant">•</span>
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-eco-primary hover:underline font-mono font-medium inline-flex items-center space-x-0.5"
                  >
                    <span>{active.latitude.toFixed(4)}° N, {active.longitude.toFixed(4)}° E</span>
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </a>
                </p>

                {/* On-Device SLM (SmolLM-135M) Output */}
                <div className="bg-eco-surface-container p-2 rounded border border-eco-outline-variant/60">
                  <div className="flex items-center space-x-1.5 text-[11px] font-label font-semibold text-eco-primary mb-0.5">
                    <BrainCircuit className="w-3 h-3" />
                    <span>On-Device SLM Context Validator (SmolLM-135M):</span>
                  </div>
                  <p className="text-xs font-body text-eco-on-surface italic pl-2 border-l-2 border-eco-primary leading-relaxed">
                    "{active.slm_summary}"
                  </p>
                </div>

                <div className="flex items-center justify-between pt-0.5 text-xs font-label text-eco-on-surface-variant">
                  <span>Routing: <strong className="text-eco-on-surface">Public Health & Sanitation</strong></span>
                  <span className="text-eco-primary font-mono font-semibold">SLA: &lt; 2 hours</span>
                </div>
              </div>

              {/* Action Buttons Panel */}
              <div className="w-full lg:w-48 flex-shrink-0 flex flex-col justify-center space-y-2 font-label select-none">
                {/* 1. Dispatch to Telegram */}
                <button
                  onClick={() => handleUpdateStatus("QRT_DISPATCHED", "Dispatched to GVMC Emergency Telegram Bot.")}
                  disabled={isUpdating || active.status === "RESOLVED"}
                  className={`w-full flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all shadow-sm ${
                    active.status === "QRT_DISPATCHED"
                      ? "bg-eco-secondary-container text-eco-on-secondary-container border border-eco-secondary/40 cursor-default"
                      : "bg-eco-primary hover:bg-eco-primary-container text-eco-on-primary"
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{active.status === "QRT_DISPATCHED" ? "✓ Telegram Dispatched" : "📲 Dispatch to Bot"}</span>
                </button>

                {/* 2. Mark Resolved */}
                <button
                  onClick={() => handleUpdateStatus("RESOLVED", "Cleared and verified by sanitation tipper unit.")}
                  disabled={isUpdating || active.status === "RESOLVED"}
                  className={`w-full flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${
                    active.status === "RESOLVED"
                      ? "bg-eco-surface-container text-eco-on-surface-variant border-eco-outline-variant cursor-default"
                      : "bg-eco-primary-container/20 hover:bg-eco-primary-container text-eco-primary hover:text-eco-on-primary border-eco-primary/30"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{active.status === "RESOLVED" ? "✓ Verified Resolved" : "✓ Mark Resolved"}</span>
                </button>

                {/* 3. False Alarm */}
                <button
                  onClick={() => handleUpdateStatus("FALSE_ALARM", "Flagged as false positive by supervisor.")}
                  disabled={isUpdating || active.status === "RESOLVED"}
                  className="w-full flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-lg bg-eco-surface-container hover:bg-eco-surface-container-high text-eco-on-surface-variant text-xs font-medium border border-eco-outline-variant transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>✕ False Alarm</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
