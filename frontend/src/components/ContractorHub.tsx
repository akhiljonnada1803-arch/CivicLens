import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ContractorHubData } from '../types';

interface ContractorHubProps {
  onBackToConsole: () => void;
}

export const ContractorHub: React.FC<ContractorHubProps> = ({ onBackToConsole }) => {
  const [data, setData] = useState<ContractorHubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedJobIndex, setSelectedJobIndex] = useState(0);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [showAppealModal, setShowAppealModal] = useState(false);
  const [appealText, setAppealText] = useState('Location was fully cleared and spotless at 8:12 AM (Ref Job #8841). Sighting at 1:00 PM represents post-market secondary unauthorized dumping by commercial vendors.');
  const [showPdfModal, setShowPdfModal] = useState(false);

  const fetchData = async () => {
    try {
      const res = await api.getContractorHub('Apex CleanTech');
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleSendDetour = async () => {
    try {
      setActionMessage('📲 Sending GPS detour dispatch to Tipper #04 (AP-31-TT-4402)...');
      const arrivalRes = await api.simulateTipperArrival();
      setActionMessage(arrivalRes.message);
      await fetchData();
    } catch (e: any) {
      setActionMessage('Error dispatching detour: ' + e.message);
    }
  };

  const handleSimulateClosure = async () => {
    try {
      setActionMessage('🔄 Tipper pulled forward 15m. Rear IP67 camera triggering...');
      const closureRes = await api.simulateTipperClosure();
      setActionMessage(closureRes.message);
      await fetchData();
    } catch (e: any) {
      setActionMessage('Error closing ticket: ' + e.message);
    }
  };

  const handleSimulateGhostBilling = async () => {
    try {
      const res = await api.simulateGhostBilling();
      setActionMessage(`⚠️ ${res.message} (${res.penalty_amount})`);
      await fetchData();
    } catch (e: any) {
      setActionMessage('Error: ' + e.message);
    }
  };

  const handleAppealSubmit = async () => {
    if (!selectedRecord) return;
    try {
      const res = await api.appealRedump(selectedRecord.id, appealText);
      setActionMessage(`⚖️ ${res.message}`);
      setShowAppealModal(false);
      await fetchData();
    } catch (e: any) {
      setActionMessage('Appeal error: ' + e.message);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-950 text-slate-300">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span>Connecting to Apex CleanTech Concessionaire Portal...</span>
        </div>
      </div>
    );
  }

  const conc = data?.concessionaire;
  const overflows = data?.active_overflows || [];
  const vault = data?.vault_records || [];
  const selectedRecord = vault[selectedJobIndex] || vault[0];

  return (
    <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden text-slate-200">
      {/* Vendor Hub Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xl">
            🚚
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-100 tracking-wide">
                CivicLens Vendor Hub
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-medium border border-amber-500/40">
                {conc?.name || 'Apex CleanTech'}
              </span>
              <span className="text-xs text-slate-400">
                • {conc?.zone || 'Zone 3 Fleet'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              PRD Section 6.2 Concessionaire SLA & Proof-of-Work Verification Vault
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onBackToConsole}
            className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <span>🏛️ Switch to Municipal Admin</span>
          </button>
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionMessage && (
        <div className="bg-blue-950/80 border-b border-blue-800/60 px-6 py-2 flex items-center justify-between text-xs text-blue-200 animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="text-blue-400 font-bold">⚡ LIVE EVENT:</span>
            <span>{actionMessage}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-blue-400 hover:text-blue-200 text-sm leading-none"
          >
            ✕
          </button>
        </div>
      )}

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-4 gap-4 px-6 py-3 bg-slate-900/60 border-b border-slate-800/80">
        <div className="bg-slate-900/90 rounded-lg p-3 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Active Sanitation Tippers</p>
            <p className="text-xl font-bold text-slate-100 mt-0.5">{conc?.active_tippers || 18} Units</p>
          </div>
          <div className="p-2.5 rounded-md bg-blue-500/10 text-blue-400 text-lg">🚚</div>
        </div>

        <div className="bg-slate-900/90 rounded-lg p-3 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Verified Clean Rate</p>
            <p className="text-xl font-bold text-emerald-400 mt-0.5">{conc?.clean_rate_pct?.toFixed(1) || '98.2'}%</p>
          </div>
          <div className="p-2.5 rounded-md bg-emerald-500/10 text-emerald-400 text-lg">🎯</div>
        </div>

        <div className="bg-slate-900/90 rounded-lg p-3 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Route Fraud Penalties</p>
            <p className={`text-xl font-bold mt-0.5 ${conc?.penalty_balance_inr ? 'text-red-400' : 'text-emerald-400'}`}>
              ₹{conc?.penalty_balance_inr?.toLocaleString() || '0'}
            </p>
          </div>
          <div className="p-2.5 rounded-md bg-amber-500/10 text-amber-400 text-lg">🛡️</div>
        </div>

        <div className="bg-slate-900/90 rounded-lg p-3 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">100% Verified Credits</p>
            <p className="text-xl font-bold text-sky-400 mt-0.5">₹{conc?.total_credits_inr?.toLocaleString() || '2,45,000'}</p>
          </div>
          <div className="p-2.5 rounded-md bg-sky-500/10 text-sky-400 text-lg">💰</div>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="flex-1 flex overflow-hidden p-6 gap-6">
        {/* Left Column: Live Overflows on Route */}
        <div className="w-5/12 flex flex-col bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <h2 className="text-sm font-bold text-slate-100 tracking-wide uppercase">
                Live Overflows on Route ({overflows.length})
              </h2>
            </div>
            <span className="text-xs text-slate-400">Dynamic Tipper Rerouting</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {overflows.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">
                No active overflows on assigned route. All zones clean!
              </div>
            ) : (
              overflows.map((ov) => (
                <div
                  key={ov.id}
                  className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-lg p-4 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-amber-400 text-sm">⚠️</span>
                        <h3 className="font-semibold text-slate-100 text-sm">{ov.landmark}</h3>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Flagged by {ov.spotted_by} • {ov.time_ago}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {ov.route}
                    </span>
                  </div>

                  <div className="mt-3.5 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs">
                    <div className="text-slate-300">
                      <span className="text-slate-400">Nearest:</span>{' '}
                      <span className="text-blue-400 font-medium">{ov.nearest_tipper}</span>
                    </div>
                    <div className="text-slate-300">
                      <span className="text-slate-400">SLA Window:</span>{' '}
                      <span className="text-amber-300 font-medium">⏳ {ov.remaining_sla_mins} mins</span>
                    </div>
                  </div>

                  <div className="mt-3.5 flex items-center gap-2">
                    <button
                      onClick={handleSendDetour}
                      className="flex-1 py-1.5 px-3 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow"
                    >
                      <span>📲 Send Detour to Driver</span>
                    </button>
                    <button
                      onClick={() => setShowAppealModal(true)}
                      className="py-1.5 px-3 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs transition-colors"
                      title="Contest if post-cleanup refill"
                    >
                      <span>Flag Re-Dump</span>
                    </button>
                  </div>
                </div>
              ))
            )}

            {/* Re-Dump Dispute Example Card */}
            <div className="bg-slate-800/50 border border-purple-500/30 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-purple-400 text-sm">⚖️</span>
                    <h3 className="font-semibold text-purple-200 text-sm">Station Road Container 02</h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Cleaned 8:12 AM; Refilled by shops at 1:00 PM
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  FLAGGED RE-DUMP
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-2 bg-slate-900/60 p-2 rounded border border-slate-700/60">
                Protected by Immutable Audit Vault: Prior 8:12 AM rear-camera proof verified.
              </p>
              <div className="mt-2.5 flex justify-end">
                <button
                  onClick={() => setShowAppealModal(true)}
                  className="px-2.5 py-1 text-xs rounded bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors"
                >
                  ⚖️ Submit Re-Dump Defense
                </button>
              </div>
            </div>
          </div>

          {/* Quick Simulation Bar */}
          <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-semibold text-[11px]">Demo:</span>
            <button
              onClick={handleSendDetour}
              className="px-2 py-1 rounded bg-blue-600/80 hover:bg-blue-600 text-white text-[11px]"
            >
              1. Tipper Arrival
            </button>
            <button
              onClick={handleSimulateClosure}
              className="px-2 py-1 rounded bg-emerald-600/80 hover:bg-emerald-600 text-white text-[11px]"
            >
              2. 15m Closure
            </button>
            <button
              onClick={handleSimulateGhostBilling}
              className="px-2 py-1 rounded bg-red-600/80 hover:bg-red-600 text-white text-[11px]"
            >
              3. Ghost Billing
            </button>
          </div>
        </div>

        {/* Right Column: Proof-of-Work Audit Vault */}
        <div className="w-7/12 flex flex-col bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-5 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400">🛡️</span>
              <h2 className="text-sm font-bold text-slate-100 tracking-wide uppercase">
                Proof-of-Work Audit Vault (PRD Section 6.2)
              </h2>
            </div>
            {selectedRecord && (
              <span className="text-xs px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                {selectedRecord.job_number}
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {selectedRecord ? (
              <div className="space-y-4">
                {/* Job Metadata Header */}
                <div className="bg-slate-800/80 rounded-lg p-3.5 border border-slate-700/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400">Assigned Route:</span>{' '}
                    <span className="font-semibold text-slate-100">{selectedRecord.route}</span>
                    <span className="mx-2 text-slate-500">•</span>
                    <span className="text-slate-400">Tipper Unit:</span>{' '}
                    <span className="font-semibold text-amber-300">{selectedRecord.vehicle_registration}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Verification Time:</span>{' '}
                    <span className="font-semibold text-emerald-400">{selectedRecord.cleared_time}</span>
                  </div>
                </div>

                {/* Side-by-Side Dual-Camera Proof Images */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Before Photo (Front Camera) */}
                  <div className="bg-slate-950 rounded-lg border border-slate-800 p-2.5 flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        [ BEFORE PHOTO ]
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">Front Dashcam • 1:41 PM</span>
                    </div>
                    <div className="aspect-video bg-slate-900 rounded overflow-hidden relative border border-slate-800">
                      {selectedRecord.before_image_url ? (
                        <img
                          src={selectedRecord.before_image_url}
                          alt="Before Cleanup Proof"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                          Awaiting Front Cam Ingestion...
                        </div>
                      )}
                    </div>
                    <div className="mt-2 text-xs text-slate-300 flex items-center justify-between">
                      <span className="text-slate-400">Condition:</span>
                      <span className="text-red-400 font-semibold">Trash Detected (Conf 89%)</span>
                    </div>
                  </div>

                  {/* After Photo (Rear Aux Camera) */}
                  <div className="bg-slate-950 rounded-lg border border-emerald-900/40 p-2.5 flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        [ AFTER PHOTO ]
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">Rear IP67 Cam • 1:44 PM</span>
                    </div>
                    <div className="aspect-video bg-slate-900 rounded overflow-hidden relative border border-emerald-950">
                      {selectedRecord.after_image_url ? (
                        <img
                          src={selectedRecord.after_image_url}
                          alt="After Cleanup Proof"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                          Awaiting 15m Pull-Forward Trigger...
                        </div>
                      )}
                    </div>
                    <div className="mt-2 text-xs text-slate-300 flex items-center justify-between">
                      <span className="text-slate-400">Condition:</span>
                      <span className="text-emerald-400 font-semibold">Curb Spotless (Conf 94%)</span>
                    </div>
                  </div>
                </div>

                {/* Verification & Billing Status Card */}
                <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                        ✓
                      </div>
                      <div>
                        <h4 className="font-bold text-emerald-300 text-sm">
                          {selectedRecord.work_state === 'CLOSED_VERIFIED'
                            ? '✅ Auto-Verified Clean (Dual-Camera Consensus)'
                            : selectedRecord.work_state === 'FLAGGED_INCOMPLETE'
                            ? '⚠️ Flagged Incomplete (Residual Waste)'
                            : '⏳ Inspection In Progress'}
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Dwell Duration: {selectedRecord.dwell_duration_sec}s • Pull-Forward: +15m anchor verified
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-3 py-1 rounded bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30">
                        {selectedRecord.billing_credit_approved ? 'Billing Credit: Approved (100%)' : 'Billing Credit: Pending'}
                      </span>
                      {selectedRecord.penalty_amount_inr > 0 && (
                        <p className="text-xs text-red-400 font-semibold mt-1">
                          Penalty: ₹{selectedRecord.penalty_amount_inr.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Audit Vault Actions */}
                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => setShowPdfModal(true)}
                    className="flex-1 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors flex items-center justify-center gap-2 shadow"
                  >
                    <span>📄 Download Verification PDF Certificate</span>
                  </button>
                  <button
                    onClick={() => setShowAppealModal(true)}
                    className="py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-xs border border-slate-700 transition-colors flex items-center gap-1.5"
                  >
                    <span>⚖️ Submit Re-Dump Defense</span>
                  </button>
                </div>

                {/* Vault Records History Tabs */}
                <div className="pt-3 border-t border-slate-800">
                  <p className="text-xs text-slate-400 font-medium mb-2 uppercase tracking-wide">
                    Recent Verified Shift Records
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {vault.map((rec, idx) => (
                      <button
                        key={rec.id}
                        onClick={() => setSelectedJobIndex(idx)}
                        className={`p-2.5 rounded text-left border transition-all ${
                          selectedJobIndex === idx
                            ? 'bg-slate-800 border-emerald-500/60 shadow'
                            : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/50'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-200">{rec.job_number}</span>
                          <span className="text-emerald-400 font-medium">100% Cr</span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{rec.landmark}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-slate-500 text-sm">
                No verified records in vault. Run milestone closure simulation!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PDF Verification Certificate Modal */}
      {showPdfModal && selectedRecord && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">📄</span>
                <h3 className="font-bold text-slate-100 text-base">Civic Proof-of-Work Verification Certificate</h3>
              </div>
              <button onClick={() => setShowPdfModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="mt-4 space-y-3 text-xs text-slate-300 bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono">
              <p className="text-emerald-400 font-bold text-sm">GVMC AUDITED WORK ORDER CERTIFICATE</p>
              <p>Job ID: {selectedRecord.job_number} • Concessionaire: Apex CleanTech</p>
              <p>Vehicle: {selectedRecord.vehicle_registration} • Route: {selectedRecord.route}</p>
              <p>Target GPS: 17.7225° N, 83.3045° E ({selectedRecord.landmark})</p>
              <p>Arrival Time: {selectedRecord.arrived_time} • Dwell: {selectedRecord.dwell_duration_sec}s</p>
              <p>Rear Cam Pull-Forward: 15m verified at {selectedRecord.cleared_time}</p>
              <p className="text-emerald-300 font-bold">STATUS: 100% BILLING CREDIT APPROVED • ZERO GHOST FRAUD</p>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setShowPdfModal(false)}
                className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-200"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                  setShowPdfModal(false);
                }}
                className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-xs text-white font-medium"
              >
                Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Re-Dump Defense Modal */}
      {showAppealModal && selectedRecord && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚖️</span>
                <h3 className="font-bold text-slate-100 text-base">Submit Re-Dump Penalty Defense (Section 8.4)</h3>
              </div>
              <button onClick={() => setShowAppealModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <p className="text-xs text-slate-400 mt-3">
              Immutable Timeline Vault Defense: Submits timestamped rear-camera proof proving that waste was cleared prior to secondary dumping by market vendors.
            </p>
            <div className="mt-3">
              <label className="text-xs text-slate-300 font-medium block mb-1">Defense Statement:</label>
              <textarea
                value={appealText}
                onChange={(e) => setAppealText(e.target.value)}
                rows={4}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setShowAppealModal(false)}
                className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAppealSubmit}
                className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-500 text-xs text-white font-medium"
              >
                Submit Immutable Defense
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
