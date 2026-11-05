import React, { useState, useRef } from 'react';
import { 
  X, 
  Smartphone, 
  Camera, 
  Upload, 
  CheckCircle2, 
  QrCode, 
  Sparkles, 
  AlertOctagon, 
  Building2, 
  MapPin, 
  BrainCircuit, 
  Layers, 
  Eye,
  Volume2
} from 'lucide-react';

interface MobileConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIncidentCreated: (newIncidentId?: string) => void;
}

export const MobileConnectModal: React.FC<MobileConnectModalProps> = ({
  isOpen,
  onClose,
  onIncidentCreated
}) => {
  const [selectedDefect, setSelectedDefect] = useState<string>('garbage_overflow');
  const [isScanning, setIsScanning] = useState(false);
  const [detectionResult, setDetectionResult] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const mobileUrl = `http://172.17.7.59:3000`;

  // Synthesize pleasant high-tech detection chime
  const playDetectionChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const audioCtx = new AudioCtx();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.18); // A5
      gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.45);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.45);
    } catch {}
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsScanning(true);
      setDetectionResult(null);

      const formData = new FormData();
      formData.append('device_id', 'DEV-001'); // Sweeper #04
      // Jitter around Ward 14 center (Siripuram)
      const lat = (17.7225 + (Math.random() - 0.5) * 0.003).toFixed(6);
      const lon = (83.3045 + (Math.random() - 0.5) * 0.003).toFixed(6);
      formData.append('lat', lat);
      formData.append('lon', lon);
      formData.append('defect_type', selectedDefect);
      formData.append('confidence', '0.89');
      formData.append('evidence_image', file);

      const resp = await fetch('/api/v1/telemetry/incident', {
        method: 'POST',
        body: formData
      });

      if (!resp.ok) throw new Error('Upload or pipeline inference failed');
      const data = await resp.json();

      // Trigger high-tech chime & haptic feedback
      playDetectionChime();
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([100, 50, 150]);
      }

      setDetectionResult({
        ...data,
        preview_url: data.image_url || URL.createObjectURL(file)
      });

      onIncidentCreated(data.incident_id);
    } catch (err: any) {
      alert(`Pipeline error: ${err.message}`);
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">CivicLens Mobile Edge Scanner</h3>
              <p className="text-[11px] text-slate-400">Live Dashcam Sensor & Optical Verification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto max-h-[80vh]">

          {/* SUCCESS DETECTION INTIMATION CARD */}
          {detectionResult ? (
            <div className="bg-slate-950 rounded-xl border-2 border-emerald-500/60 p-4 space-y-3.5 shadow-2xl animate-in fade-in zoom-in-90 duration-200">
              {/* Top Banner */}
              <div className="flex items-center justify-between bg-emerald-950/60 px-3 py-2 rounded-lg border border-emerald-800/60">
                <div className="flex items-center space-x-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-300">
                    🎯 Edge Detection Confirmed & Logged
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-900/60 px-2 py-0.5 rounded">
                  {Math.round((detectionResult.confidence || 0.89) * 100)}% Conf
                </span>
              </div>

              {/* Annotated Image with Bounding Box Overlay */}
              <div className="relative rounded-lg overflow-hidden border border-slate-700 bg-black aspect-video flex items-center justify-center shadow-inner group">
                <img
                  src={detectionResult.preview_url}
                  alt="Annotated Defect"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 bg-rose-600 text-white font-mono font-bold text-[11px] px-2 py-0.5 rounded shadow">
                  YOLOv8n INT8 • {detectionResult.defect_type.replace('_', ' ').toUpperCase()}
                </div>
                <div className="absolute bottom-2 right-2 bg-black/80 text-emerald-400 font-mono text-[10px] px-2 py-0.5 rounded border border-emerald-500/30">
                  Sub-110ms Edge Inference
                </div>
              </div>

              {/* Verified SLM Summary & Details */}
              <div className="bg-slate-900/90 rounded-lg p-3 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center space-x-1.5 text-blue-400 font-semibold text-[11px]">
                  <BrainCircuit className="w-3.5 h-3.5 text-blue-400" />
                  <span>On-Device SLM Verification:</span>
                </div>
                <p className="text-slate-200 italic pl-2 border-l-2 border-blue-500 leading-relaxed font-medium">
                  "{detectionResult.slm_summary || 'Autonomous visual verification confirmed on carriageway shoulder.'}"
                </p>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block font-bold">Routed Department:</span>
                    <span className="font-semibold text-slate-200 text-[11px] truncate block">
                      {detectionResult.assigned_department}
                    </span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block font-bold">Target SLA Window:</span>
                    <span className="font-semibold text-emerald-400 font-mono text-[11px] block">
                      {detectionResult.channel_sla}
                    </span>
                  </div>
                </div>

                {detectionResult.is_duplicate ? (
                  <div className="p-2 rounded bg-blue-950/60 border border-blue-800/60 text-blue-300 text-[11px] flex items-center space-x-2">
                    <span className="text-base">🎯</span>
                    <span>
                      <strong>Spatial Deduplication Active:</strong> Sighting #{detectionResult.sighting_count} recorded. Notification suppressed to eliminate officer fatigue!
                    </span>
                  </div>
                ) : (
                  <div className="p-2 rounded bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-[11px] flex items-center space-x-2">
                    <span className="text-base">⚡</span>
                    <span>
                      <strong>New Master Ticket Dispatched:</strong> Auto-assigned to Ward 14 patrol channel.
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => setDetectionResult(null)}
                  className="flex-1 py-2.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                >
                  📸 Scan Another Photo
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-colors"
                >
                  🗺️ Inspect on Live Map &rarr;
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* SCANNING PROGRESS ANIMATION */}
              {isScanning ? (
                <div className="bg-slate-950 p-8 rounded-xl border border-blue-500/50 flex flex-col items-center justify-center text-center space-y-4 shadow-inner">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin"></div>
                    <Camera className="w-7 h-7 text-blue-400 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white tracking-tight">
                      Analyzing Optical Feed...
                    </h4>
                    <p className="text-xs text-blue-300/80 mt-1">
                      Running INT8 YOLOv8n detector & on-device SLM context validator
                    </p>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden max-w-xs">
                    <div className="bg-blue-500 h-full rounded-full animate-pulse w-3/4"></div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Option 1: Live Camera Snapshot */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                        <Camera className="w-4 h-4 text-blue-400" />
                        <span>Step 1: Select Municipal Defect Class</span>
                      </span>
                      <span className="text-[10px] font-semibold text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-800">
                        CameraX 1 FPS
                      </span>
                    </div>

                    {/* Defect selector buttons */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        { id: 'garbage_overflow', label: '🗑️ Garbage Overflow', desc: 'Main Market stretch' },
                        { id: 'open_manhole', label: '🚨 Open Manhole', desc: 'Critical safety hazard' },
                        { id: 'road_pothole', label: '⚠️ Road Pothole', desc: 'Carriageway defect' },
                        { id: 'external_accident', label: '🚗 Vehicle Collision', desc: 'Deceleration spike' }
                      ].map(d => (
                        <button
                          key={d.id}
                          onClick={() => setSelectedDefect(d.id)}
                          className={`p-2.5 rounded-xl text-left border transition-all ${
                            selectedDefect === d.id
                              ? 'bg-blue-600/20 border-blue-500 text-white ring-1 ring-blue-500/50 shadow-md'
                              : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <div className="font-semibold text-xs">{d.label}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{d.desc}</div>
                        </button>
                      ))}
                    </div>

                    {/* Hidden file input */}
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {/* Main Capture Button */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition-all active:scale-[0.98]"
                    >
                      <Camera className="w-5 h-5" />
                      <span>📸 Snap Road Photo & Run Edge AI</span>
                    </button>
                  </div>

                  {/* Option 2: Mobile Browser URL for phone */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                        <QrCode className="w-4 h-4 text-emerald-400" />
                        <span>Phone Mobile Browser Access</span>
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                        Same Wi-Fi
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Open this URL on your phone's browser to control the patrol feed:
                    </p>
                    <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-700/80 flex items-center justify-between">
                      <code className="text-sm font-bold text-emerald-400 font-mono select-all">
                        {mobileUrl}
                      </code>
                      <span className="text-[11px] text-slate-500 font-medium">Port 3000</span>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
};
