import React, { useState } from 'react';
import { Search, Filter, Layers } from 'lucide-react';
import { Incident } from '../types';
import { IncidentCard } from './IncidentCard';

interface IncidentFeedProps {
  incidents: Incident[];
  selectedIncident: Incident | null;
  onSelectIncident: (incident: Incident) => void;
  onQuickDispatch: (e: React.MouseEvent, incident: Incident) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
}

export const IncidentFeed: React.FC<IncidentFeedProps> = ({
  incidents,
  selectedIncident,
  onSelectIncident,
  onQuickDispatch,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange
}) => {
  return (
    <div className="w-full lg:w-[420px] flex-shrink-0 flex flex-col h-full bg-slate-950 border-r border-slate-800">
      {/* Pane Title & Search Filter */}
      <div className="p-4 border-b border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Incident Feed (Simple Cards)
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
            {incidents.length} tickets
          </span>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search landmark, vehicle, or issue..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 text-xs select-none">
          {['ALL', 'NEEDS_ACTION', 'QRT_DISPATCHED', 'RESOLVED'].map((st) => (
            <button
              key={st}
              onClick={() => onStatusFilterChange(st)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {st === 'ALL' ? 'All Tickets' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Incident List Feed */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {incidents.length === 0 ? (
          <div className="text-center py-12 px-4">
            <Filter className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-400">No matching tickets found</p>
            <p className="text-xs text-slate-600 mt-1">Try resetting your search query or filter tags.</p>
          </div>
        ) : (
          incidents.map((inc) => (
            <IncidentCard
              key={inc.id}
              incident={inc}
              isSelected={selectedIncident?.id === inc.id}
              onSelect={onSelectIncident}
              onQuickDispatch={onQuickDispatch}
            />
          ))
        )}
      </div>
    </div>
  );
};

