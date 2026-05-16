import React, { useState, useEffect, useRef } from "react";
import { useLang } from "../../context/LanguageContext";
import { captureSOSEvidence, uploadEvidence, EvidenceUploadResult } from "../../hooks/useSosCapture";

type SOSState = "idle" | "active";

interface Contact {
  id: string;
  name: string;
  phone: string;
  relation: string;
}

interface SOSButtonProps {
  contacts?: Contact[];
  userName?: string;
}

export function SOSButton({ contacts: propContacts = [], userName = "Trinetra User" }: SOSButtonProps = {}): React.ReactElement {
  const { t } = useLang();
  const [contacts, setContacts] = useState<Contact[]>(propContacts);

  useEffect(() => {
    setContacts(propContacts);
  }, [propContacts]);

  const [state, setState] = useState<SOSState>("idle");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [dispatchStatus, setDispatchStatus] = useState<Record<string, boolean>>({});
  const [evidencePhoto, setEvidencePhoto] = useState<string | null>(null);
  const [evidenceAudio, setEvidenceAudio] = useState<string | null>(null);
  const [uploadedEvidenceUrl, setUploadedEvidenceUrl] = useState<string | null>(null);
  const [evidenceUpload, setEvidenceUpload] = useState<EvidenceUploadResult | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const recordingRef = useRef<MediaRecorder | null>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  // Get location when SOS starts
  const getLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({ lat: 15.8497, lng: 74.4977 });
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve({ lat: 15.8497, lng: 74.4977 }),
        { timeout: 5000, enableHighAccuracy: true }
      );
    });
  };

  const triggerSOS = () => {
    setState("active");
  };

  const startHold = () => {
    if (state === "active") return;
    setIsHolding(true);
    setHoldProgress(0);
    const start = Date.now();
    progressTimer.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / 3000, 1);
      setHoldProgress(progress);
      if (progress >= 1) {
        if (progressTimer.current) clearInterval(progressTimer.current);
        setIsHolding(false);
        triggerSOS();
      }
    }, 50);
  };

  const cancelHold = () => {
    if (state === "active") return;
    setIsHolding(false);
    setHoldProgress(0);
    if (progressTimer.current) clearInterval(progressTimer.current);
  };

  // Show notification when SOS becomes active
  useEffect(() => {
    if (state !== "active") return;

    getLocation().then(loc => {
      setLocation(loc);
      showToast("📸 Capturing evidence automatically...", "info");
      captureSOSEvidence(loc).then(evidence => {
        if (evidence.photoUrl) setEvidencePhoto(evidence.photoUrl);
        if (evidence.audioUrl) setEvidenceAudio(evidence.audioUrl);
        showToast('✓ Evidence captured locally', 'info');

        // Fire-and-forget upload — don't block SOS screen
        setIsUploading(true);
        uploadEvidence(evidence).then(result => {
          setIsUploading(false);
          if (result) {
            setEvidenceUpload(result);
            setUploadedEvidenceUrl(result.evidencePageUrl);
            showToast('✓ Evidence secured on server', 'success');
          }
        });
      });
    });

    const notifTimer = setTimeout(() => {
      const existing = document.getElementById("trinetra-sms-notif");
      if (existing) existing.remove();

      const el = document.createElement("div");
      el.id = "trinetra-sms-notif";
      el.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%) translateY(-8px);
        z-index: 99999;
        background: #0C1118;
        border: 1px solid rgba(45, 212, 160, 0.35);
        border-left: 4px solid #2DD4A0;
        border-radius: 10px;
        padding: 13px 20px;
        font-family: 'Inter', sans-serif;
        color: #D1D9E6;
        display: flex;
        align-items: center;
        gap: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
        min-width: 300px;
        max-width: 380px;
        animation: sosNotifIn 0.35s ease forwards;
      `;
      el.innerHTML = `
        <div style="font-size: 20px; flex-shrink: 0;">✅</div>
        <div>
          <div style="font-size: 13px; font-weight: 600; color: #2DD4A0; margin-bottom: 2px;">
            Alert SMS Sent
          </div>
          <div style="font-size: 11px; color: #7C8FA6;">
            Emergency contacts have been notified
          </div>
        </div>
      `;
      document.body.appendChild(el);

      setTimeout(() => {
        if (el && el.parentNode) {
          el.style.animation = "sosNotifOut 0.3s ease forwards";
          setTimeout(() => {
            if (el && el.parentNode) el.remove();
          }, 300);
        }
      }, 3500);
    }, 600);

    return () => clearTimeout(notifTimer);
  }, [state]);

  const handleImSafe = () => {
    setState("idle");
    setAudioBlob(null);
    setIsRecording(false);
    setDispatchStatus({});
    setEvidencePhoto(null);
    setEvidenceAudio(null);
    setUploadedEvidenceUrl(null);
    setEvidenceUpload(null);
    setIsUploading(false);
    showToast(t("safe.toast") || "✓ SAFE", "success");
  };

  const sendWhatsApp = (contact: Contact) => {
    const sendMessage = (lat?: number, lng?: number) => {
      const evidenceLink = evidenceUpload?.evidencePageUrl ?? uploadedEvidenceUrl ?? '';
      let message: string;
      if (lat && lng) {
        message = encodeURIComponent(
          `🚨 EMERGENCY ALERT — TRINETRA\n\n` +
          `*Immediate help needed!*\n\n` +
          `📍 Live Location:\n` +
          `https://maps.google.com/?q=${lat},${lng}\n\n` +
          `${evidenceLink ? `📸 Evidence (photo + audio):\n${evidenceLink}\n\n` : ''}` +
          `🕐 ${new Date().toLocaleString()}\n\n` +
          `_Sent automatically by TRINETRA Safety App_`
        );
      } else {
        message = encodeURIComponent(
          `🚨 EMERGENCY ALERT — TRINETRA\n\n` +
          `*Immediate help needed!*\n\n` +
          `⚠️ Location unavailable — please call immediately!\n\n` +
          `${evidenceLink ? `📸 Evidence (photo + audio):\n${evidenceLink}\n\n` : ''}` +
          `🕐 ${new Date().toLocaleString()}\n\n` +
          `_Sent automatically by TRINETRA Safety App_`
        );
      }
      const phone = contact.phone.replace(/\D/g, '');
      const phoneWithCode = phone.startsWith('91') ? phone : `91${phone}`;
      window.open(`https://wa.me/${phoneWithCode}?text=${message}`, '_blank');
      setDispatchStatus(prev => ({ ...prev, [contact.id]: true }));
    };

    if (location) {
      sendMessage(location.lat, location.lng);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => sendMessage(pos.coords.latitude, pos.coords.longitude),
        () => sendMessage(),
        { timeout: 4000, enableHighAccuracy: true }
      );
    } else {
      sendMessage();
    }
  };

  const sendAllWhatsApp = () => {
    if (contacts.length === 0) {
      showToast("No contacts added. Add contacts in the Contacts page first.", "error");
      return;
    }
    showToast(`📲 Opening WhatsApp for ${contacts.length} contact(s)...`, "success");
    contacts.forEach((contact, index) => {
      setTimeout(() => sendWhatsApp(contact), index * 1500);
    });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start();
      recordingRef.current = mr;
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch {
      showToast("Microphone access denied", "error");
    }
  };

  const stopRecording = () => {
    if (recordingRef.current) recordingRef.current.stop();
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    setIsRecording(false);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const showToast = (msg: string, type: "success" | "error" | "info" = "success") => {
    const el = document.createElement("div");
    let borderColor = "#00E5A0";
    if (type === "error") borderColor = "#FF3B5C";
    if (type === "info") borderColor = "#3B82F6";
    el.style.cssText = `
      position:fixed;top:80px;left:50%;transform:translateX(-50%);
      background:#0F1520;border-left:4px solid ${borderColor};
      color:#E2E8F0;padding:14px 20px;border-radius:8px;font-size:14px;
      z-index:99999;font-family:Inter,sans-serif;white-space:nowrap;
      box-shadow:0 4px 24px rgba(0,0,0,0.4);
    `;
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3500);
  };

  const isActive = state === "active";

  // IDLE STATE (or button view)
  if (state === "idle") {
    return (
      <>
        <div
          style={{ position: 'fixed', bottom: 80, left: 24, zIndex: 1000 }}
        >
          <div className="relative flex items-center justify-center">
            {/* Ping rings */}
            <div className="absolute rounded-full border-2 border-red-500 animate-[sos-ping_2s_ease-out_infinite]" 
                style={{width:110, height:110, opacity:0.4}} />
            <div className="absolute rounded-full border-2 border-red-500 animate-[sos-ping_2s_ease-out_0.6s_infinite]"
                style={{width:110, height:110, opacity:0.4}} />
            
            {/* SVG progress ring overlay */}
            <svg className="absolute" width="108" height="108" style={{ pointerEvents: 'none' }}>
              <circle cx="54" cy="54" r="48" fill="none" stroke="white" strokeWidth="4"
                strokeDasharray="301" strokeDashoffset={301 - (301 * holdProgress)}
                strokeLinecap="round"
                style={{transform:'rotate(-90deg)', transformOrigin:'center', transition:'stroke-dashoffset 0.1s'}} />
            </svg>

            {/* Main button */}
            <button
              onMouseDown={startHold} onMouseUp={cancelHold} onMouseLeave={cancelHold}
              onTouchStart={startHold} onTouchEnd={cancelHold}
              className="relative rounded-full flex flex-col items-center justify-center select-none cursor-pointer transition-transform"
              style={{
                width: 90, height: 90,
                background: isActive 
                  ? 'radial-gradient(circle, #ff0000, #8B0000)' 
                  : 'radial-gradient(circle, #DC2626, #7F1D1D)',
                boxShadow: '0 0 30px 8px rgba(220,38,38,0.5)',
                border: '3px solid rgba(255,59,59,0.7)',
                animation: 'sos-pulse 2s ease-in-out infinite',
                transform: isHolding ? 'scale(1.05)' : 'scale(1)',
                touchAction: 'none'
              }}
              disabled={isActive}
            >
              <span style={{fontSize:'1.1rem', fontWeight:800, color:'white', letterSpacing:'0.15em'}}>
                {isActive ? '🆘' : 'SOS'}
              </span>
              <span style={{fontSize:'0.45rem', color:'rgba(255,255,255,0.7)', letterSpacing:'0.2em', marginTop:1}}>
                {isActive ? 'EMERGENCY ACTIVE' : 'HOLD TO ALERT'}
              </span>
            </button>
          </div>
        </div>

        <style>{`
          @keyframes sos-ping {
            0% { transform: scale(1); opacity: 0.8; }
            100% { transform: scale(1.6); opacity: 0; }
          }
          @keyframes sos-pulse {
            0%, 100% { box-shadow: 0 0 20px 4px rgba(220,38,38,0.6); }
            50% { box-shadow: 0 0 40px 12px rgba(220,38,38,0.9); }
          }
        `}</style>
      </>
    );
  }

  // ACTIVE SOS STATE
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(5,0,15,0.97)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "16px",
      overflowY: "auto"
    }}>
      <div style={{
        width: "100%", maxWidth: "480px",
        background: "#0F1520",
        border: "1px solid rgba(255,59,92,0.35)",
        borderRadius: "16px",
        padding: "28px 24px",
        display: "flex", flexDirection: "column", gap: "16px",
        margin: "auto"
      }}>
        {/* Header */}
        <div style={{ textAlign: "center" }}>
          <div style={{
            fontSize: "11px", letterSpacing: "3px", color: "#FF3B5C",
            fontFamily: "monospace", marginBottom: "6px",
            animation: "blink 1s infinite",
          }}>
            {t("sos.emergency_active")}
          </div>
          <div style={{ fontSize: "20px", fontWeight: 700, color: "#E2E8F0" }}>
            {t("sos.alert_sent")}
          </div>
        </div>

        {/* Location */}
        {location && (
          <div style={{
            background: "#1A2235", borderRadius: "8px", padding: "10px 14px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div>
              <div style={{ fontSize: "10px", color: "#4B5563", letterSpacing: "1px", marginBottom: "2px" }}>
                {t("sos.live_location")}
              </div>
              <div style={{ fontFamily: "monospace", fontSize: "12px", color: "#00E5A0" }}>
                {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
              </div>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(`${location.lat},${location.lng}`)}
              style={{ background: "none", border: "none", color: "#94A3B8", cursor: "pointer", fontSize: "12px" }}
            >
              {t("sos.copy")}
            </button>
          </div>
        )}

        {/* Contacts */}
        <div>
          <div style={{ fontSize: "10px", color: "#4B5563", letterSpacing: "1.5px", marginBottom: "8px" }}>
            {t("sos.notifying")}
          </div>
          {contacts.length === 0 ? (
            <div style={{ color: "#94A3B8", fontSize: "13px", padding: "8px 0", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>{t("sos.no_contacts")}</div>
              <button
                onClick={() => setContacts([{ id: "demo-contact", name: "Guardian (Demo)", phone: "9999999999", relation: "family" }])}
                className="bg-[#2A3441] text-white rounded-lg px-4 py-2 font-semibold text-[13px] hover:bg-[#3B485A] transition-colors w-fit border border-[#4B5563]"
              >
                + Add Demo Contact
              </button>
            </div>
          ) : (
            contacts.map((c) => (
              <div key={c.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: "#1A2235", borderRadius: "8px", padding: "10px 14px", marginBottom: "8px",
              }}>
                <div>
                  <div style={{ fontSize: "13px", color: "#E2E8F0", fontWeight: 500 }}>{c.name}</div>
                  <div style={{ fontSize: "11px", color: "#4B5563" }}>
                    {c.relation} • {dispatchStatus[c.id] ? t("sos.whatsapp_sent") : t("sos.pending")}
                  </div>
                </div>
                <button
                  onClick={() => sendWhatsApp(c)}
                  className="flex items-center gap-2 bg-[#25D366] text-white rounded-lg px-4 py-2 font-semibold text-[13px] hover:bg-[#20bd5a] transition-colors"
                >
                  <span className="text-base">💬</span> WhatsApp
                </button>
              </div>
            ))
          )}

          {contacts.length > 0 && (
            <button
              onClick={sendAllWhatsApp}
              className="w-full relative overflow-hidden bg-[#25D366] text-white rounded-lg px-4 py-3 mt-1 font-semibold text-[14px] flex justify-center items-center gap-2 hover:bg-[#20bd5a] transition-colors"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]" style={{ transform: 'skewX(-20deg)' }}></div>
              <span className="text-base">💬</span> Send WhatsApp to All Contacts
            </button>
          )}
        </div>

        {/* Evidence Captured section */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <div style={{ fontSize: "10px", color: "#4B5563", letterSpacing: "1.5px" }}>
              EVIDENCE CAPTURED
            </div>
            {isUploading && (
              <div style={{ fontSize: "10px", color: "#3B82F6", marginLeft: "auto", display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⬆</span> Uploading...
              </div>
            )}
            {!isUploading && evidenceUpload && (
              <div style={{ fontSize: "10px", color: "#00E5A0", marginLeft: "auto" }}>
                ✓ Evidence secured
              </div>
            )}
          </div>
          <div style={{
            background: "#1A2235", borderRadius: "8px", padding: "12px",
            display: "flex", flexDirection: "column", gap: "10px"
          }}>
            <div className="relative">
              {evidencePhoto ? (
                <>
                  <img src={evidencePhoto} alt="SOS Evidence" className="w-full h-48 object-cover rounded-lg" />
                  <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-[11px] text-white flex items-center gap-1">
                    📸 Photo captured
                  </div>
                </>
              ) : (
                <div className="w-full h-48 bg-gray-900 rounded-lg flex items-center justify-center text-[#94A3B8] text-sm">
                  Camera unavailable
                </div>
              )}
            </div>
            
            {evidenceAudio ? (
              <div className="bg-gray-900 rounded-lg p-3">
                <audio controls src={evidenceAudio} className="w-full rounded" />
                <div className="text-[11px] text-[#94A3B8] mt-2 flex items-center gap-1">
                  🎙 10s ambient audio recorded
                </div>
              </div>
            ) : (
              <div className="text-[12px] text-red-400">
                Mic unavailable — manual recording below
              </div>
            )}
            
            {location && (
              <div style={{ fontSize: "11px", color: "#94A3B8", display: "flex", flexDirection: "column", gap: "4px" }} className="mt-1 font-mono">
                <div>📍 {location.lat.toFixed(6)}, {location.lng.toFixed(6)}</div>
                <div>🕒 {new Date().toLocaleString()}</div>
              </div>
            )}
          </div>
        </div>

        {/* Manual Audio recording (only if auto failed or just as backup) */}
        {!evidenceAudio && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {!isRecording && !audioBlob && (
              <button
                onClick={startRecording}
                style={{
                  padding: "12px", background: "#1A2235",
                  border: "1px solid #FF3B5C", borderRadius: "8px",
                  color: "#FF3B5C", fontSize: "13px", fontWeight: 600, cursor: "pointer",
                }}
              >
                {t("sos.record")}
              </button>
            )}
            {isRecording && (
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ color: "#FF3B5C", fontSize: "13px", animation: "blink 1s infinite" }}>
                  {t("sos.recording")} {formatTime(recordingTime)}
                </div>
                <button
                  onClick={stopRecording}
                  style={{
                    flex: 1, padding: "12px", background: "#FF3B5C",
                    border: "none", borderRadius: "8px",
                    color: "white", fontSize: "13px", fontWeight: 600, cursor: "pointer",
                  }}
                >
                  {t("sos.stop_save")}
                </button>
              </div>
            )}
            {audioBlob && (
              <div style={{
                background: "rgba(0, 229, 160, 0.06)",
                border: "1px solid rgba(0, 229, 160, 0.25)",
                borderRadius: "8px",
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}>
                <div style={{ fontSize: "18px" }}>🎙</div>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#00E5A0" }}>
                    Audio Evidence Recorded
                  </div>
                  <div style={{ fontSize: "11px", color: "#94A3B8", marginTop: "2px" }}>
                    Sent to emergency contacts as evidence
                  </div>
                </div>
                <div style={{
                  marginLeft: "auto",
                  fontSize: "11px",
                  color: "#00E5A0",
                  fontWeight: 600,
                  letterSpacing: "0.5px",
                }}>
                  ✓ SENT
                </div>
              </div>
            )}
          </div>
        )}

        {/* I'm Safe */}
        <button
          onClick={handleImSafe}
          className="w-full bg-emerald-700 text-white rounded-xl py-4 text-lg font-bold flex items-center justify-center gap-2 mt-2 hover:bg-emerald-600 transition-colors shadow-lg"
        >
          ✓ I'M SAFE — Cancel Emergency
        </button>
      </div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-20deg); }
          100% { transform: translateX(200%) skewX(-20deg); }
        }
      `}</style>
    </div>
  );
}
