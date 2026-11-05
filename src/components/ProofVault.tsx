"use client";

import React, { useState, useEffect } from "react";
import { ContractorAuditRecord } from "@/lib/types";
import { api } from "@/lib/api";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Scale,
  Clock,
  Printer,
  X,
  Truck,
  ArrowRight,
} from "lucide-react";

export const ProofVault: React.FC = () => {
  const [records, setRecords] = useState<ContractorAuditRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<ContractorAuditRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeNotes, setDisputeNotes] = useState(
    "Location was verified clean at 8:12 AM (Ref Job #8841). Secondary overflow at 1:00 PM was caused by unauthorized roadside vegetable merchant dumping."
  );
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const loadAudits = async () => {
    try {
      const data = await api.getContractorAudits();
      setRecords(data.audits || []);
      if (!selectedRecord && data.audits?.length > 0) {
        setSelectedRecord(data.audits[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAudits();
  }, []);

  const handleDisputeSubmit = async () => {
    if (!selectedRecord) return;
    try {
      const res = await api.submitDispute({
        job_id: selectedRecord.job_id,
        incident_id: selectedRecord.incident_id,
        defense_notes: disputeNotes,
      });
      setActionNotice(`⚖️ ${res.message}`);
      setShowDisputeModal(false);
      await loadAudits();
    } catch (e: any) {
      alert("Dispute submission failed: " + e.message);
    }
  };

  const active = selectedRecord || records[0];

  return (
    <div className="flex-1 flex flex-col overflow-hidden gap-4">
      {/* Notice Banner */}
      {actionNotice && (
        <div className="bg-blue-950/90 border border-blue-800/80 px-4 py-2 rounded-lg flex items-center justify-between text-xs text-blue-200">
          <span>{actionNotice}</span>
          <button onClick={() => setActionNotice(null)} className="text-blue-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Main Split Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden gap-4">
        {/* Left Column: Proof-of-Work Verification Queue */}
        <div className="w-full lg:w-5/12 flex flex-col bg-[#0b0f19] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="p-4 bg-[#0e1422] border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white tracking-wide uppercase">
                Contractor Audit Jobs ({records.length})
              </h2>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60 font-semibold">
              Concessionaire: Apex CleanTech
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {records.map((rec) => {
              const isSelected = active?.job_id === rec.job_id;
              const isVerified = rec.work_state === "CLOSED_VERIFIED";

              return (
                <div
                  key={rec.job_id}
                  onClick={() => setSelectedRecord(rec)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? "bg-slate-800/90 border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg"
                      : isVerified
                      ? "bg-[#0f172a]/70 hover:bg-slate-800/50 border-slate-800"
                      : "bg-rose-950/20 hover:bg-slate-800/50 border-rose-900/40"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-bold font-mono text-white">
                      {rec.job_id}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        isVerified
                          ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                          : "bg-rose-500/10 text-rose-300 border-rose-500/30"
                      }`}
                    >
                      {isVerified ? "✅ AUTO-VERIFIED" : "⚠️ FLAGGED INCOMPLETE"}
                    </span>
                  </div>

                  <h4 className="text-xs font-semibold text-slate-200 line-clamp-1 mb-1">
                    {rec.landmark}
                  </h4>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>
                      Tipper: <strong className="text-amber-300">{rec.vehicle_registration}</strong>
                    </span>
                    <span className="font-mono text-slate-300">
                      {rec.closure_time} ({rec.dwell_duration_sec}s dwell)
                    </span>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-mono">{rec.route_id}</span>
                    <span className={`font-bold ${isVerified ? "text-emerald-400" : "text-rose-400"}`}>
                      {isVerified ? "100% Credit Approved" : "₹5,000 Penalty Levied"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Paired Before & After Visual Inspection Vault */}
        <div className="w-full lg:w-7/12 flex flex-col bg-[#0b0f19] border border-slate-800 rounded-xl overflow-hidden p-5 shadow-xl">
          {active ? (
            <div className="flex-1 flex flex-col justify-between space-y-4 overflow-y-auto">
              {/* Header Details */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold text-white tracking-tight">
                      {active.job_id} • Proof-of-Work Vault Record
                    </h3>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                      {active.route_id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Vehicle: <strong className="text-amber-300">{active.vehicle_registration}</strong> • Verified at {active.closure_time} (+15m Pull-Forward)
                  </p>
                </div>

                <button
                  onClick={() => setShowSlipModal(true)}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Export Verification Slip (PDF)</span>
                </button>
              </div>

              {/* PAIRED BEFORE & AFTER PROOF CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Before Pickup (Front Camera) */}
                <div className="bg-[#080c14] border border-slate-800 rounded-xl p-3 flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <span>[ BEFORE PICKUP ]</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Front Dashcam • {active.arrival_time}</span>
                  </div>

                  <div className="aspect-video bg-black rounded-lg overflow-hidden relative border border-slate-800">
                    <img
                      src={active.before_photo_url}
                      alt="Before Pickup"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-black/80 px-2 py-0.5 rounded text-[10px] font-bold text-rose-400 font-mono">
                      TRASH PRESENT • CONF 89%
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
                    <span>GPS Anchor:</span>
                    <span className="font-mono text-slate-300">
                      {active.latitude.toFixed(4)}° N, {active.longitude.toFixed(4)}° E
                    </span>
                  </div>
                </div>

                {/* 2. After Pickup (Rear Camera) */}
                <div className="bg-[#080c14] border border-emerald-900/40 rounded-xl p-3 flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>[ AFTER PICKUP ]</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Rear IP67 Aux • {active.closure_time}</span>
                  </div>

                  <div className="aspect-video bg-black rounded-lg overflow-hidden relative border border-emerald-950">
                    <img
                      src={active.after_photo_url}
                      alt="After Pickup"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-black/80 px-2 py-0.5 rounded text-[10px] font-bold text-emerald-400 font-mono">
                      CURB SPOTLESS • CONF {Math.round(active.rear_camera_confidence * 100)}%
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
                    <span>Pull-Forward:</span>
                    <span className="font-mono text-emerald-400">
                      +{active.pull_forward_meters}m Verified
                    </span>
                  </div>
                </div>
              </div>

              {/* Autonomous Verification & Billing Audit Slip */}
              <div
                className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${
                  active.billing_credit_approved
                    ? "bg-emerald-950/30 border-emerald-800/60 text-emerald-300"
                    : "bg-rose-950/30 border-rose-800/60 text-rose-300"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-base ${
                      active.billing_credit_approved
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-rose-500/20 text-rose-400"
                    }`}
                  >
                    {active.billing_credit_approved ? "✓" : "!"}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">
                      {active.billing_credit_approved
                        ? "Autonomous Verification: 100% Billing Credit Approved"
                        : "Flagged Incomplete: Unverified Drive-By Route Fraud"}
                    </h4>
                    <p className="text-xs text-slate-400">
                      Dwell Time: {active.dwell_duration_sec}s • Target Coordinate: {active.landmark}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!active.billing_credit_approved && (
                    <button
                      onClick={() => setShowDisputeModal(true)}
                      className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center space-x-1 transition-all"
                    >
                      <Scale className="w-3.5 h-3.5" />
                      <span>Submit Re-Dump Defense</span>
                    </button>
                  )}
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-black/40 border border-white/10">
                    {active.billing_credit_approved ? "₹750 Credit" : "₹5,000 Fine"}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-slate-500 text-sm">
              Select a job record to inspect dual-camera proofs.
            </div>
          )}
        </div>
      </div>

      {/* PDF Verification Slip Modal */}
      {showSlipModal && active && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b0f19] border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">
                  Civic Proof-of-Work Verification Certificate
                </h3>
              </div>
              <button onClick={() => setShowSlipModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="bg-[#080c14] border border-slate-800 p-4 rounded-xl font-mono text-xs text-slate-300 space-y-2">
              <p className="text-emerald-400 font-bold text-sm">
                GREATER VISAKHAPATNAM MUNICIPAL CORPORATION (GVMC)
              </p>
              <p className="text-slate-400">CERTIFIED DUAL-CAMERA CIVIC AUDIT SLIP</p>
              <div className="border-t border-slate-800 pt-2 space-y-1">
                <p>Work Order: {active.job_id} • Status: {active.work_state}</p>
                <p>Concessionaire: {active.concessionaire} • Route: {active.route_id}</p>
                <p>Vehicle: {active.vehicle_registration} • GPS: {active.latitude}° N, {active.longitude}° E</p>
                <p>Before Arrival (Front Cam): {active.arrival_time}</p>
                <p>After Closure (Rear Cam): {active.closure_time} (+15m forward)</p>
                <p>Dwell Duration: {active.dwell_duration_sec} seconds</p>
                <p className="text-emerald-400 font-bold pt-1">
                  SETTLEMENT: 100% BILLING CREDIT APPROVED • GHOST-FRAUD FREE
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowSlipModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                  setShowSlipModal(false);
                }}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs text-white font-semibold flex items-center space-x-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Certificate</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Re-Dump Penalty Dispute Modal */}
      {showDisputeModal && active && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b0f19] border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Scale className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">
                  Submit Re-Dump Penalty Defense (PRD Section 8.4)
                </h3>
              </div>
              <button onClick={() => setShowDisputeModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-slate-400">
              Submit verifiable timeline defense to waive the ₹5,000 ghost-billing fine by referencing prior spotless clearance.
            </p>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Defense Evidence Statement:</label>
              <textarea
                value={disputeNotes}
                onChange={(e) => setDisputeNotes(e.target.value)}
                rows={4}
                className="w-full bg-[#080c14] border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowDisputeModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-xs text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDisputeSubmit}
                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs text-white font-bold"
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

