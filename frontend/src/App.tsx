import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { StatBar } from './components/StatBar';
import { IncidentFeed } from './components/IncidentFeed';
import { MapView } from './components/MapView';
import { SelectedIncidentInspection } from './components/SelectedIncidentInspection';
import { SimulationDrawer } from './components/SimulationDrawer';
import { AnalyticsModal } from './components/AnalyticsModal';
import { MobileConnectModal } from './components/MobileConnectModal';
import { ContractorHub } from './components/ContractorHub';
import { api } from './services/api';
import { Incident, FleetVehicle, Ward, AnalyticsStats, IncidentStatus } from './types';

export const App: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [fleet, setFleet] = useState<FleetVehicle[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [stats, setStats] = useState<AnalyticsStats | null>(null);

  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [selectedZone, setSelectedZone] = useState<string>('ZONE-03');
  const [activePortal, setActivePortal] = useState<'MUNICIPAL' | 'CONTRACTOR'>('MUNICIPAL');
  const [activeStatFilter, setActiveStatFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [isSimulationOpen, setIsSimulationOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isMobileConnectOpen, setIsMobileConnectOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch all initial data
  const loadData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const [incidentsRes, fleetRes, wardsRes, statsRes] = await Promise.all([
        api.getIncidents({ zone_id: selectedZone }),
        api.getFleet(),
        api.getWards(),
        api.getStats()
      ]);

      setIncidents(incidentsRes);
      setFleet(fleetRes);
      setWards(wardsRes);
      setStats(statsRes);

      // Default select first incident if none selected or if selected is missing
      if (!selectedIncident && incidentsRes.length > 0) {
        setSelectedIncident(incidentsRes[0]);
      } else if (selectedIncident) {
        const updated = incidentsRes.find(i => i.id === selectedIncident.id);
        if (updated) setSelectedIncident(updated);
      }
    } catch (err) {
      console.error('Failed to load civic data:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [selectedZone, selectedIncident]);

  useEffect(() => {
    loadData();
    // Real-time polling every 6 seconds for live fleet & telemetry updates
    const timer = setInterval(loadData, 6000);
    return () => clearInterval(timer);
  }, [loadData]);

  // Dispatch incident handler
  const handleDispatch = async (id: string) => {
    const updated = await api.dispatchIncident(id);
    setSelectedIncident(updated);
    setIncidents(prev => prev.map(i => i.id === id ? updated : i));
    const newStats = await api.getStats();
    setStats(newStats);
  };

  // Update incident status handler
  const handleUpdateStatus = async (id: string, status: IncidentStatus, notes?: string) => {
    const updated = await api.updateIncidentStatus(id, status, notes);
    setSelectedIncident(updated);
    setIncidents(prev => prev.map(i => i.id === id ? updated : i));
    const newStats = await api.getStats();
    setStats(newStats);
  };

  // Quick dispatch from card
  const handleQuickDispatch = async (e: React.MouseEvent, inc: Incident) => {
    e.stopPropagation();
    await handleDispatch(inc.id);
  };

  const handleIncidentCreated = async (newIncidentId?: string) => {
    await loadData();
    if (newIncidentId) {
      try {
        const inc = await api.getIncidentById(newIncidentId);
        setSelectedIncident(inc);
        setToastMessage(`🚨 LIVE EDGE SENSOR: ${inc.title} detected at ${inc.landmark || 'Ward 14'}!`);
        setTimeout(() => setToastMessage(null), 5000);
      } catch {}
    }
  };

  // Filter incidents for left pane feed
  const filteredIncidents = incidents.filter(inc => {
    if (activeStatFilter === 'URGENT_SAFETY' && inc.urgency !== 'URGENT_SAFETY') return false;
    if (activeStatFilter === 'SANITATION_ROADS' && inc.urgency !== 'SANITATION_ROADS') return false;
    if (activeStatFilter === 'RESOLVED' && inc.status !== 'RESOLVED') return false;

    if (statusFilter !== 'ALL' && inc.status !== statusFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = inc.title?.toLowerCase().includes(q);
      const matchLandmark = inc.landmark?.toLowerCase().includes(q);
      const matchVehicle = inc.spotted_by_label?.toLowerCase().includes(q);
      const matchSummary = inc.slm_summary?.toLowerCase().includes(q);
      if (!matchTitle && !matchLandmark && !matchVehicle && !matchSummary) return false;
    }
    return true;
  });

  const currentWard = wards.find(w => w.id === 'GVMC-W14') || (wards.length > 0 ? wards[0] : null);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Top Header */}
      <Header
        selectedZone={selectedZone}
        onZoneChange={setSelectedZone}
        activePortal={activePortal}
        onPortalChange={setActivePortal}
        onOpenSimulation={() => setIsSimulationOpen(true)}
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
        onOpenMobileConnect={() => setIsMobileConnectOpen(true)}
        onRefresh={loadData}
        isRefreshing={isRefreshing}
      />

      {/* Portal 2: Contractor Operations & Proof-of-Work Vault (PRD Section 6.2) */}
      {activePortal === 'CONTRACTOR' ? (
        <ContractorHub onBackToConsole={() => setActivePortal('MUNICIPAL')} />
      ) : (
        <>
          {/* Live Toast Notification Banner */}
          {toastMessage && (
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-white text-xs font-bold flex items-center justify-between shadow-lg animate-in slide-in-from-top duration-200">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                <span>{toastMessage}</span>
              </div>
              <button onClick={() => setToastMessage(null)} className="text-white/80 hover:text-white">✕</button>
            </div>
          )}

          {/* Top Stat Bar ([🚨 2 Urgent Safety] [⚠️ 9 Sanitation/Roads] [✅ 28 Resolved]) */}
          <StatBar
            stats={stats}
            activeFilter={activeStatFilter}
            onFilterChange={setActiveStatFilter}
          />

          {/* Main Two-Pane Operations Layout */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
            {/* Left Pane: Incident Feed (Simple Cards) */}
            <IncidentFeed
              incidents={filteredIncidents}
              selectedIncident={selectedIncident}
              onSelectIncident={setSelectedIncident}
              onQuickDispatch={handleQuickDispatch}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
            />

            {/* Right Pane: Live Ward Map & Inspection */}
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950">
              {/* Live GIS Map */}
              <MapView
                incidents={incidents}
                fleet={fleet}
                ward={currentWard}
                selectedIncident={selectedIncident}
                onSelectIncident={setSelectedIncident}
              />

              {/* Selected Incident Inspection Card */}
              <SelectedIncidentInspection
                incident={selectedIncident}
                onDispatch={handleDispatch}
                onUpdateStatus={handleUpdateStatus}
              />
            </div>
          </div>
        </>
      )}

      {/* Simulation Drawer */}
      <SimulationDrawer
        isOpen={isSimulationOpen}
        onClose={() => setIsSimulationOpen(false)}
        onSimulationSuccess={loadData}
      />

      {/* CapEx & Target KPI Analytics Modal */}
      <AnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        stats={stats}
      />

      {/* Mobile Connect & Live Camera Modal */}
      <MobileConnectModal
        isOpen={isMobileConnectOpen}
        onClose={() => setIsMobileConnectOpen(false)}
        onIncidentCreated={handleIncidentCreated}
      />
    </div>
  );
};

export default App;

