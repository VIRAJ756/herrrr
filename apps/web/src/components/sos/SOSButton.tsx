import React, { useState, useEffect, useRef } from "react";
import { useLang } from "../../context/LanguageContext";

type SOSState = "idle" | "countdown" | "active" | "safe";

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

export function SOSButton({ contacts = [], userName = "Stree Astra User" }: SOSButtonProps = {}): React.ReactElement {
  const { t } = useLang();
  const [state, setState] = useState<SOSState>("idle");
  const [count, setCount] = useState(5);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [dispatchStatus, setDispatchStatus] = useState<Record<string, boolean>>({});

  console.log("SOSButton contacts prop:", contacts);
  
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
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

  const handleSOSClick = () => {
    if (state !== "idle") return;
    setState("countdown");
    setCount(5);
  };

  // Countdown logic
  useEffect(() => {
    if (state !== "countdown") return;

    getLocation().then(setLocation);

    countdownRef.current = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!);
          setState("active");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [state]);

  const handleCancel = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setState("idle");
    setCount(5);
    showToast(t("sos.activating") + " — " + t("safe.toast"), "success");
  };

  // Show notification when SOS becomes active
  useEffect(() => {
    if (state !== "active") return;

    // Fetch location in background
    getLocation().then(loc => {
      setLocation(loc);
    });

    // Show "Alert SMS Sent" notification after a 600ms delay
    // (slight delay so it appears after the panel has rendered)
    const notifTimer = setTimeout(() => {
      const existing = document.getElementById("streeastra-sms-notif");
      if (existing) existing.remove();

      const el = document.createElement("div");
      el.id = "streeastra-sms-notif";
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

      // Auto dismiss after 3.5 seconds
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
    setCount(5);
    setAudioBlob(null);
    setIsRecording(false);
    setDispatchStatus({});
    showToast(t("safe.toast"), "success");
  };

  const sendWhatsApp = (contact: Contact) => {
    const sendMessage = (lat?: number, lng?: number) => {
      let message: string;
      if (lat && lng) {
        const mapsLink = `https://www.google.com/maps?q=${lat},${lng}`;
        message = encodeURIComponent(
          `🚨 *SOS EMERGENCY ALERT*\n\n` +
          `*${userName}* needs immediate help!\n\n` +
          `⚠️ This is a REAL emergency. Please respond NOW.\n\n` +
          `📍 *Live Location:*\n${mapsLink}\n\n` +
          `🗺 Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}\n\n` +
          `🕐 Time: ${new Date().toLocaleString()}\n\n` +
          `Please call her immediately or send help to the above location.\n\n` +
          `— Sent via STREE ASTRA Safety App`
        );
      } else {
        message = encodeURIComponent(
          `🚨 *SOS EMERGENCY ALERT*\n\n` +
          `*${userName}* needs immediate help!\n\n` +
          `⚠️ Location unavailable — please call her immediately!\n\n` +
          `🕐 Time: ${new Date().toLocaleString()}\n\n` +
          `— Sent via STREE ASTRA Safety App`
        );
      }
      const phone = contact.phone.replace(/[^0-9+]/g, "");
      window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
      setDispatchStatus((prev) => ({ ...prev, [contact.id]: true }));
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

  const downloadAudio = () => {
    if (!audioBlob) return;
    const url = URL.createObjectURL(audioBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "streeastra-sos-audio.webm";
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  // Toast helper (simple)
  const showToast = (msg: string, type: "success" | "error") => {
    const el = document.createElement("div");
    el.style.cssText = `
      position:fixed;top:80px;left:50%;transform:translateX(-50%);
      background:#0F1520;border-left:4px solid ${type === "success" ? "#00E5A0" : "#FF3B5C"};
      color:#E2E8F0;padding:14px 20px;border-radius:8px;font-size:14px;
      z-index:99999;font-family:Inter,sans-serif;white-space:nowrap;
      box-shadow:0 4px 24px rgba(0,0,0,0.4);
    `;
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3500);
  };

  // IDLE STATE — just show the button
  if (state === "idle") {
    return (
      <button
        onClick={handleSOSClick}
        aria-label="Emergency SOS"
        style={{
          position: "fixed",
          bottom: "90px",
          left: "50px",
          width: "88px",
          height: "88px",
          borderRadius: "50%",
          background: "#f43f5e",
          border: "3px solid rgba(255,255,255,0.3)",
          outline: "3px solid rgba(244,63,94,0.4)",
          outlineOffset: "4px",
          boxShadow: "0 0 0 6px rgba(244,63,94,0.15), 0 0 0 12px rgba(244,63,94,0.08), 0 8px 32px rgba(244,63,94,0.5)",
          color: "white",
          fontSize: "18px",
          fontWeight: 800,
          fontFamily: "'JetBrains Mono', monospace",
          cursor: "pointer",
          zIndex: 999,
          letterSpacing: "0.1em",
          animation: "sosPulse 2s ease-out infinite",
        }}
      >
        SOS
      </button>
    );
  }

  // COUNTDOWN STATE
  if (state === "countdown") {
    return (
      <div style={{
        position: "fixed", inset: 0, zIndex: 9998,
        background: "rgba(0,0,0,0.9)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: "24px",
      }}>
        <div style={{
          fontSize: "120px", fontWeight: 700, color: "#FF3B5C",
          fontFamily: "'JetBrains Mono', monospace",
          lineHeight: 1,
          animation: "countPulse 1s ease-in-out infinite",
        }}>
          {count}
        </div>
        <p style={{ color: "#94A3B8", fontSize: "16px", margin: 0 }}>
          {t("sos.activating")}
        </p>
        <button
          onClick={handleCancel}
          style={{
            padding: "14px 48px",
            background: "transparent",
            border: "2px solid #E2E8F0",
            borderRadius: "10px",
            color: "#E2E8F0",
            fontSize: "16px",
            fontWeight: 600,
            cursor: "pointer",
            marginTop: "8px",
            letterSpacing: "1px",
          }}
        >
          {t("sos.cancel")}
        </button>
      </div>
    );
  }

  // ACTIVE SOS STATE
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(5,0,15,0.97)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "16px",
    }}>
      <div style={{
        width: "100%", maxWidth: "480px",
        background: "#0F1520",
        border: "1px solid rgba(255,59,92,0.35)",
        borderRadius: "16px",
        padding: "28px 24px",
        display: "flex", flexDirection: "column", gap: "16px",
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
            <div style={{ color: "#94A3B8", fontSize: "13px", padding: "8px 0" }}>
              {t("sos.no_contacts")}
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
                  style={{
                    background: "#25D366", color: "white", border: "none",
                    borderRadius: "6px", padding: "6px 12px",
                    fontSize: "12px", fontWeight: 600, cursor: "pointer",
                  }}
                >
                  WhatsApp
                </button>
              </div>
            ))
          )}

          {contacts.length > 0 && (
            <button
              onClick={sendAllWhatsApp}
              style={{
                width: "100%", padding: "13px",
                background: "#25D366", color: "white", border: "none",
                borderRadius: "10px", fontSize: "14px", fontWeight: 700, cursor: "pointer",
                marginTop: "4px",
              }}
            >
              {t("sos.whatsapp_all")}
            </button>
          )}
        </div>

        {/* Audio recording */}
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

        {/* I'm Safe */}
        <button
          onClick={handleImSafe}
          style={{
            width: "100%", padding: "14px",
            background: "transparent",
            border: "2px solid #00E5A0",
            borderRadius: "10px", color: "#00E5A0",
            fontSize: "15px", fontWeight: 700, cursor: "pointer",
            letterSpacing: "0.5px",
          }}
        >
          {t("sos.im_safe")}
        </button>
      </div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }
        @keyframes sosPulse {
          0%{box-shadow:0 0 0 0 rgba(244,63,94,0.4), 0 8px 32px rgba(244,63,94,0.5)}
          70%{box-shadow:0 0 0 20px rgba(244,63,94,0), 0 8px 32px rgba(244,63,94,0.5)}
          100%{box-shadow:0 0 0 0 rgba(244,63,94,0), 0 8px 32px rgba(244,63,94,0.5)}
        }
        @keyframes countPulse {
          0%,100%{transform:scale(1)} 50%{transform:scale(1.05)}
        }
      `}</style>
    </div>
  );
}

