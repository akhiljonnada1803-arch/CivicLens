"use client";

import React, { useState, useEffect } from "react";
import { ContractorAuditRecord } from "@/lib/types";
import { api } from "@/lib/api";
import {
  ShieldCheck,
  AlertTriangle,
  FileText,
  Scale,
  Printer,
  Truck,
  CheckCircle2,
  XCircle,
  Camera,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  Info,
} from "lucide-react";

const INITIAL_AUDIT_RECORDS: ContractorAuditRecord[] = [
  {
    job_id: "JOB-GVMC-8841",
    incident_id: "inc-8841-gvmc",
    concessionaire: "Apex CleanTech",
    route_id: "Route #14B - Siripuram",
    vehicle_registration: "AP-31-TT-4402",
    landmark: "Main Market Road, Pillar 42",
    latitude: 17.7225,
    longitude: 83.3045,
    before_photo_url: "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80",
    after_photo_url: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80",
    arrival_time: "1:41 PM",
    closure_time: "1:44 PM",
    dwell_duration_sec: 180,
    pull_forward_meters: 15.0,
    rear_camera_confidence: 0.94,
    work_state: "CLOSED_VERIFIED",
    billing_credit_approved: true,
    credit_amount_inr: 750.0,
    penalty_amount_inr: 0.0,
    dispute_status: "NONE",
  },
  {
    job_id: "JOB-GVMC-8839",
    incident_id: "inc-8839-gvmc",
    concessionaire: "Apex CleanTech",
    route_id: "Route #14A - Sector 4",
    vehicle_registration: "AP-31-TY-9912",
    landmark: "Sector 4 Commercial Corridor",
    latitude: 17.7245,
    longitude: 83.3080,
    before_photo_url: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80",
    after_photo_url: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80",
    arrival_time: "11:20 AM",
    closure_time: "11:20 AM",
    dwell_duration_sec: 8,
    pull_forward_meters: 0.0,
    rear_camera_confidence: 0.42,
    work_state: "FLAGGED_INCOMPLETE",
    billing_credit_approved: false,
    credit_amount_inr: 0.0,
    penalty_amount_inr: 5000.0,
    dispute_status: "PENALTY_LEVIED",
  },
  {
    job_id: "JOB-GVMC-8835",
    incident_id: "inc-8835-gvmc",
    concessionaire: "GreenHorizon Infra",
    route_id: "Route #14C - Maddilapalem",
    vehicle_registration: "AP-31-TU-6109",
    landmark: "Maddilapalem Sub-way Entry",
    latitude: 17.7265,
    longitude: 83.3090,
    before_photo_url: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80",
    after_photo_url: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80",
    arrival_time: "10:05 AM",
    closure_time: "10:11 AM",
    dwell_duration_sec: 360,
    pull_forward_meters: 18.2,
    rear_camera_confidence: 0.96,
    work_state: "CLOSED_VERIFIED",
    billing_credit_approved: true,
    credit_amount_inr: 750.0,
    penalty_amount_inr: 0.0,
    dispute_status: "NONE",
  }
];

export const ProofVault: React.FC = () => {
  const [records, setRecords] = useState<ContractorAuditRecord[]>(INITIAL_AUDIT_RECORDS);
  const [selectedRecord, setSelectedRecord] = useState<ContractorAuditRecord | null>(INITIAL_AUDIT_RECORDS[0]);
  const [loading, setLoading] = useState(false);
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeNotes, setDisputeNotes] = useState(
    "Location was verified clean at 8:12 AM (Ref Job #8841). Secondary overflow at 1:00 PM was caused by unauthorized roadside merchant dumping after morning clearing."
  );
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const loadAudits = async () => {
    try {
      const data = await api.getContractorAudits();
      if (data && data.audits && data.audits.length > 0) {
        setRecords(data.audits);
        if (!selectedRecord) {
          setSelectedRecord(data.audits[0]);
        }
      }
    } catch (e) {
      console.warn("Using offline audit records baseline:", e);
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
      setActionNotice(`⚖️ ${res.message || "Dispute registered for municipal arbitration."}`);
      setShowDisputeModal(false);
      await loadAudits();
    } catch (e: any) {
      alert("Dispute submission failed: " + e.message);
    }
  };

  const active = selectedRecord || records[0];

  return (
    <div className="flex-1 flex flex-col overflow-hidden gap-4 font-body">
      {/* Notice Banner */}
      {actionNotice && (
        <div className="bg-eco-secondary-container text-eco-on-secondary-container border border-eco-secondary/30 px-4 py-2.5 rounded-lg flex items-center justify-between text-xs font-label shadow-subtle">
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4 text-eco-secondary" />
            <span>{actionNotice}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-eco-on-secondary-container hover:text-eco-on-surface font-bold text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Split Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden gap-4">
        {/* Left Column: Proof-of-Work Verification Queue */}
        <div className="w-full lg:w-5/12 flex flex-col bg-eco-surface-container-low border border-eco-outline-variant/70 rounded-lg overflow-hidden shadow-subtle">
          {/* Queue Header */}
          <div className="p-4 bg-eco-surface-container border-b border-eco-outline-variant/60 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-eco-primary" />
              <h2 className="text-sm font-headline font-bold text-eco-on-surface tracking-wide uppercase">
                Contractor Audit Jobs ({records.length})
              </h2>
            </div>
            <span className="text-xs font-mono font-medium text-eco-primary bg-eco-primary-fixed px-2 py-0.5 rounded border border-eco-primary/20">
              Concessionaire Audit Active
            </span>
          </div>

          {/* Job Cards List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {records.map((rec) => {
              const isSelected = active?.job_id === rec.job_id;
              const isVerified = rec.work_state === "CLOSED_VERIFIED";

              return (
                <div
                  key={rec.job_id}
                  onClick={() => setSelectedRecord(rec)}
                  className={`p-3.5 rounded-lg border transition-all cursor-pointer relative ${
                    isSelected
                      ? "bg-eco-surface-container-lowest border-eco-primary ring-2 ring-eco-primary/25 shadow-tonal"
                      : isVerified
                      ? "bg-eco-surface-container-lowest/80 hover:bg-eco-surface-container border-eco-outline-variant/60"
                      : "bg-eco-error-container/20 hover:bg-eco-surface-container border-eco-error/30"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5 font-label">
                    <span className="text-xs font-bold font-mono text-eco-on-surface">
                      {rec.job_id}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        isVerified
                          ? "bg-eco-primary-container text-eco-on-primary-container border-eco-primary/30"
                          : "bg-eco-error-container text-eco-on-error-container border-eco-error/30"
                      }`}
                    >
                      {isVerified ? "✅ AUTO-VERIFIED" : "⚠️ FLAGGED INCOMPLETE"}
                    </span>
                  </div>

                  <h4 className="text-sm font-headline font-semibold text-eco-on-surface line-clamp-1 mb-1">
                    {rec.landmark}
                  </h4>

                  <div className="flex items-center justify-between text-xs text-eco-on-surface-variant font-body">
                    <span>
                      Tipper: <strong className="text-eco-on-surface font-mono font-medium">{rec.vehicle_registration}</strong>
                    </span>
                    <span className="font-mono text-eco-on-surface-variant">
                      {rec.closure_time} ({rec.dwell_duration_sec}s dwell)
                    </span>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-eco-outline-variant/40 flex items-center justify-between text-xs font-label">
                    <span className="text-eco-on-surface-variant font-mono">{rec.route_id}</span>
                    <span
                      className={`font-semibold ${
                        isVerified ? "text-eco-primary" : "text-eco-error"
                      }`}
                    >
                      {isVerified ? "100% Credit Approved" : "₹5,000 Penalty Levied"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Paired Before & After Visual Inspection Vault */}
        <div className="w-full lg:w-7/12 flex flex-col bg-eco-surface-container-low border border-eco-outline-variant/70 rounded-lg overflow-hidden p-5 shadow-subtle">
          {active ? (
            <div className="flex-1 flex flex-col justify-between space-y-4 overflow-y-auto">
              {/* Header Details */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-eco-outline-variant/60 pb-3 gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-headline font-bold text-eco-on-surface tracking-tight">
                      {active.job_id} • Proof-of-Work Vault
                    </h3>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-eco-surface-container text-eco-on-surface-variant border border-eco-outline-variant">
                      {active.route_id}
                    </span>
                  </div>
                  <p className="text-xs text-eco-on-surface-variant mt-1 font-body">
                    Vehicle: <strong className="text-eco-on-surface font-mono">{active.vehicle_registration}</strong> • Verified at {active.closure_time} (+15m Pull-Forward)
                  </p>
                </div>

                <button
                  onClick={() => setShowSlipModal(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-eco-primary hover:bg-eco-primary-container text-eco-on-primary text-xs font-label font-semibold flex items-center space-x-1.5 shadow-sm transition-all"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Export Verification Slip (PDF)</span>
                </button>
              </div>

              {/* PAIRED BEFORE & AFTER PROOF CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Before Pickup (Front Camera) */}
                <div className="bg-eco-surface-container border border-eco-outline-variant/70 rounded-lg p-3 flex flex-col">
                  <div className="flex items-center justify-between mb-2 font-label">
                    <span className="text-xs font-bold text-eco-error uppercase tracking-wider flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-eco-error" />
                      <span>[ BEFORE PICKUP ]</span>
                    </span>
                    <span className="text-[11px] font-mono text-eco-on-surface-variant">Front Dashcam • {active.arrival_time}</span>
                  </div>

                  <div className="aspect-video bg-black rounded overflow-hidden relative border border-eco-outline-variant">
                    <img
                      src={active.before_photo_url}
                      alt="Before Pickup"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-eco-inverse-surface/85 px-2 py-0.5 rounded text-[10px] font-bold text-eco-error-container font-mono border border-eco-error/30">
                      WASTE DETECTED • CONF 89%
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-eco-on-surface-variant flex items-center justify-between font-label">
                    <span>GPS Anchor:</span>
                    <span className="font-mono text-eco-on-surface font-medium">
                      {active.latitude.toFixed(4)}° N, {active.longitude.toFixed(4)}° E
                    </span>
                  </div>
                </div>

                {/* 2. After Pickup (Rear Camera) */}
                <div className="bg-eco-surface-container border border-eco-primary/30 rounded-lg p-3 flex flex-col">
                  <div className="flex items-center justify-between mb-2 font-label">
                    <span className="text-xs font-bold text-eco-primary uppercase tracking-wider flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-eco-primary animate-pulse" />
                      <span>[ AFTER PICKUP ]</span>
                    </span>
                    <span className="text-[11px] font-mono text-eco-on-surface-variant">Rear IP67 Aux • {active.closure_time}</span>
                  </div>

                  <div className="aspect-video bg-black rounded overflow-hidden relative border border-eco-primary/30">
                    <img
                      src={active.after_photo_url}
                      alt="After Pickup"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-eco-inverse-surface/85 px-2 py-0.5 rounded text-[10px] font-bold text-eco-primary-fixed font-mono border border-eco-primary/30">
                      CURB SPOTLESS • CONF {Math.round(active.rear_camera_confidence * 100)}%
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-eco-on-surface-variant flex items-center justify-between font-label">
                    <span>Pull-Forward:</span>
                    <span className="font-mono text-eco-primary font-bold">
                      +{active.pull_forward_meters}m Verified
                    </span>
                  </div>
                </div>
              </div>

              {/* Autonomous Verification & Billing Audit Slip */}
              <div
                className={`p-4 rounded-lg border flex flex-col sm:flex-row items-center justify-between gap-3 ${
                  active.billing_credit_approved
                    ? "bg-eco-primary-fixed/30 border-eco-primary/30 text-eco-on-surface"
                    : "bg-eco-error-container/30 border-eco-error/30 text-eco-on-surface"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-base ${
                      active.billing_credit_approved
                        ? "bg-eco-primary text-eco-on-primary"
                        : "bg-eco-error text-eco-on-error"
                    }`}
                  >
                    {active.billing_credit_approved ? "✓" : "!"}
                  </div>
                  <div>
                    <h4 className="text-sm font-headline font-bold">
                      {active.billing_credit_approved
                        ? "Autonomous Verification: 100% Billing Credit Approved"
                        : "Flagged Incomplete: Unverified Drive-By Route Fraud"}
                    </h4>
                    <p className="text-xs text-eco-on-surface-variant font-body">
                      Dwell Time: {active.dwell_duration_sec}s • Target Coordinate: {active.landmark}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 font-label">
                  {!active.billing_credit_approved && (
                    <button
                      onClick={() => setShowDisputeModal(true)}
                      className="px-3 py-1.5 rounded bg-eco-tertiary hover:bg-eco-tertiary-container text-eco-on-tertiary text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition-all"
                    >
                      <Scale className="w-3.5 h-3.5" />
                      <span>Submit Re-Dump Defense</span>
                    </button>
                  )}
                  <span
                    className={`text-xs font-mono font-bold px-3 py-1 rounded border ${
                      active.billing_credit_approved
                        ? "bg-eco-primary-container text-eco-on-primary-container border-eco-primary/40"
                        : "bg-eco-error-container text-eco-on-error-container border-eco-error/40"
                    }`}
                  >
                    {active.billing_credit_approved ? "₹750 Credit" : "₹5,000 Fine"}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-eco-on-surface-variant text-sm font-body">
              Select a job record to inspect dual-camera proofs.
            </div>
          )}
        </div>
      </div>

      {/* PDF Verification Slip Modal */}
      {showSlipModal && active && (
        <div className="fixed inset-0 z-50 bg-eco-inverse-surface/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-eco-surface-container-lowest border border-eco-outline-variant rounded-xl max-w-xl w-full p-6 shadow-tonal space-y-4">
            <div className="flex items-center justify-between border-b border-eco-outline-variant pb-3 font-label">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-eco-primary" />
                <h3 className="text-base font-headline font-bold text-eco-on-surface">
                  Civic Proof-of-Work Verification Certificate
                </h3>
              </div>
              <button
                onClick={() => setShowSlipModal(false)}
                className="text-eco-on-surface-variant hover:text-eco-on-surface font-bold text-base"
              >
                ✕
              </button>
            </div>

            <div className="bg-eco-surface-container border border-eco-outline-variant/80 p-4 rounded-lg font-mono text-xs text-eco-on-surface space-y-2">
              <p className="text-eco-primary font-bold text-sm">
                GREATER VISAKHAPATNAM MUNICIPAL CORPORATION (GVMC)
              </p>
              <p className="text-eco-on-surface-variant">CERTIFIED DUAL-CAMERA CIVIC AUDIT SLIP</p>
              <div className="border-t border-eco-outline-variant/60 pt-2 space-y-1">
                <p>Work Order: {active.job_id} • Status: {active.work_state}</p>
                <p>Concessionaire: {active.concessionaire} • Route: {active.route_id}</p>
                <p>Vehicle: {active.vehicle_registration} • GPS: {active.latitude}° N, {active.longitude}° E</p>
                <p>Before Arrival (Front Cam): {active.arrival_time}</p>
                <p>After Closure (Rear Cam): {active.closure_time} (+15m forward)</p>
                <p>Dwell Duration: {active.dwell_duration_sec} seconds</p>
                <p className="text-eco-primary font-bold pt-1">
                  SETTLEMENT: 100% BILLING CREDIT APPROVED • GHOST-FRAUD FREE
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 font-label">
              <button
                onClick={() => setShowSlipModal(false)}
                className="px-4 py-2 rounded-lg bg-eco-surface-container hover:bg-eco-surface-container-high text-xs text-eco-on-surface font-medium"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                  setShowSlipModal(false);
                }}
                className="px-4 py-2 rounded-lg bg-eco-primary hover:bg-eco-primary-container text-xs text-eco-on-primary font-semibold flex items-center space-x-1.5 shadow-sm"
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
        <div className="fixed inset-0 z-50 bg-eco-inverse-surface/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-eco-surface-container-lowest border border-eco-outline-variant rounded-xl max-w-lg w-full p-6 shadow-tonal space-y-4">
            <div className="flex items-center justify-between border-b border-eco-outline-variant pb-3 font-label">
              <div className="flex items-center space-x-2">
                <Scale className="w-5 h-5 text-eco-tertiary" />
                <h3 className="text-base font-headline font-bold text-eco-on-surface">
                  Submit Re-Dump Penalty Defense (PRD Section 8.4)
                </h3>
              </div>
              <button
                onClick={() => setShowDisputeModal(false)}
                className="text-eco-on-surface-variant hover:text-eco-on-surface font-bold text-base"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-eco-on-surface-variant font-body">
              Submit verifiable timeline defense to waive the ₹5,000 ghost-billing fine by referencing prior spotless clearance.
            </p>

            <div>
              <label className="text-xs font-label font-semibold text-eco-on-surface block mb-1">Defense Evidence Statement:</label>
              <textarea
                value={disputeNotes}
                onChange={(e) => setDisputeNotes(e.target.value)}
                rows={4}
                className="w-full bg-eco-surface-container border border-eco-outline-variant rounded-lg p-2.5 text-xs text-eco-on-surface focus:outline-none focus:border-eco-primary font-body"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 font-label">
              <button
                onClick={() => setShowDisputeModal(false)}
                className="px-4 py-2 rounded-lg bg-eco-surface-container text-xs text-eco-on-surface-variant hover:text-eco-on-surface"
              >
                Cancel
              </button>
              <button
                onClick={handleDisputeSubmit}
                className="px-4 py-2 rounded-lg bg-eco-tertiary hover:bg-eco-tertiary-container text-xs text-eco-on-tertiary font-bold shadow-sm"
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
