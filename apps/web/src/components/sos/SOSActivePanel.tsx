import React, { useMemo, useState, useCallback, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../services/api";
import { useSOSStore } from "../../store/sosStore";
import { useSOS } from "../../hooks/useSOS";
import { useGeolocation } from "../../hooks/useGeolocation";
import type { Contact } from "../../types/contact";

type ContactNotifyState = { 
  name: string; 
  phone: string;
  status: "SENDING" | "NOTIFIED";
  mode?: "simulated" | "gateway";
};

async function fetchContacts(): Promise<Contact[]> {
  const response = await api.get<Contact[]>("/contacts");
  return response.data;
}

/** Generate WhatsApp message with GPS coordinates */
const generateWhatsAppMessage = (lat: number, lng: number, userName: string) => {
  const googleMapsLink = `https://www.google.com/maps?q=${lat},${lng}`;
  const message = `🚨 SOS ALERT from ${userName}!\n\nI need help immediately. This is an emergency.\n\n📍 My exact location:\n${googleMapsLink}\n\nCoordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}\n\nSent via TRINETRA Safety App`;
  return encodeURIComponent(message);
};

/** Send WhatsApp message to a phone number with coordinates */
const sendWhatsApp = (phone: string, lat: number, lng: number, userName: string) => {
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const message = generateWhatsAppMessage(lat, lng, userName);
  window.open(`https://wa.me/${cleanPhone}?text=${message}`, "_blank");
};

export function SOSActivePanel(): React.ReactElement {
  const { setStage, sosCoordinates } = useSOSStore();
  const { cancelActive, openFakeCall } = useSOS();
  const { point } = useGeolocation();
  const [smsMode, setSmsMode] = useState<"simulated" | "gateway" | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  
  const contactsQuery = useQuery({
    queryKey: ["contacts"],
    queryFn: fetchContacts,
  });

  const handleSmsResult = useCallback((data: { mode?: "simulated" | "gateway" }) => {
    setSmsMode(data.mode || "simulated");
  }, []);

  const contacts = useMemo<ContactNotifyState[]>(
    () =>
      (contactsQuery.data ?? []).map((contact) => ({
        name: `${contact.name} (${contact.relation})`,
        phone: contact.phone,
        status: "NOTIFIED",
        mode: smsMode || "simulated",
      })),
    [contactsQuery.data, smsMode],
  );

  // Use stored SOS coordinates, fallback to current geolocation, fallback to map center
  const lat = sosCoordinates?.lat ?? point?.lat ?? 12.9716;
  const lng = sosCoordinates?.lng ?? point?.lng ?? 77.5946;
  const userName = "User";

  const handleCancel = () => {
    cancelActive();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setAudioBlob(null);
      setAudioUrl(null);

      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error starting recording:", err);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const downloadAudio = () => {
    if (audioUrl) {
      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = 'streeastra-sos-audio.webm';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isRecording]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ backgroundColor: "rgba(5, 0, 15, 0.97)" }}
      role="alert"
      aria-live="assertive"
    >
      <div
        className="w-full max-w-[480px] mx-auto"
        style={{
          backgroundColor: "#0F1520",
          border: "1px solid rgba(255, 59, 92, 0.3)",
          borderRadius: "16px",
          padding: "28px",
          margin: "16px"
        }}
      >
        {/* Header */}
        <div
          className="text-center mb-6"
          style={{
            color: "#FF3B5C",
            fontSize: "22px",
            fontWeight: "700",
            letterSpacing: "2px",
            animation: "signal-blink 1s infinite"
          }}
        >
          🚨 EMERGENCY ACTIVE
        </div>

        {/* Location */}
        <div className="mb-6 pb-4" style={{ borderBottom: "1px solid rgba(148,163,184,0.1)" }}>
          <div className="text-sm mb-2" style={{ color: "#94A3B8" }}>📍 Sharing live location</div>
          <div
            className="font-mono text-sm flex items-center gap-2"
            style={{ color: "#94A3B8", fontSize: "13px" }}
          >
            {lat.toFixed(4)}° N, {lng.toFixed(4)}° E
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#94A3B8", cursor: "pointer" }}>
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
          </div>
        </div>

        {/* Contacts */}
        <div className="mb-6">
          <div className="text-xs font-mono tracking-widest mb-3" style={{ color: "#4B5563" }}>
            NOTIFYING CONTACTS
          </div>
          <div className="space-y-2">
            {contacts.map((c) => (
              <div
                key={c.name}
                className="flex items-center justify-between"
                style={{
                  backgroundColor: "#1A2235",
                  borderRadius: "8px",
                  padding: "12px 16px"
                }}
              >
                <div className="flex-1">
                  <div style={{ color: "#E2E8F0", fontSize: "14px" }}>{c.name}</div>
                </div>
                <button
                  type="button"
                  onClick={() => sendWhatsApp(c.phone, lat, lng, userName)}
                  style={{
                    backgroundColor: "#25D366",
                    color: "white",
                    borderRadius: "6px",
                    padding: "6px 14px",
                    fontSize: "12px",
                    fontWeight: "600"
                  }}
                >
                  WhatsApp ↗
                </button>
              </div>
            ))}
          </div>
          {contacts.length > 0 && (
            <button
              type="button"
              onClick={() => {
                contacts.forEach((c) => sendWhatsApp(c.phone, lat, lng, userName));
              }}
              style={{
                width: "100%",
                backgroundColor: "#25D366",
                color: "white",
                fontSize: "15px",
                fontWeight: "700",
                padding: "14px",
                borderRadius: "10px",
                marginTop: "12px"
              }}
            >
              Send WhatsApp to All Contacts
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mb-6 pb-4" style={{ borderBottom: "1px solid rgba(148,163,184,0.1)" }}>
          <div className="flex gap-3 mb-3">
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              style={{
                flex: 1,
                backgroundColor: "#1A2235",
                border: "1px solid #FF3B5C",
                color: "#FF3B5C",
                height: "48px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600"
              }}
            >
              {isRecording ? (
                <span className="flex items-center justify-center gap-2">
                  <span 
                    className="h-3 w-3 rounded-full"
                    style={{ 
                      backgroundColor: "#FF3B5C",
                      animation: "signal-blink 1s infinite"
                    }}
                  />
                  RECORDING... {formatTime(recordingTime)}
                </span>
              ) : audioBlob ? (
                "🎙 RECORD AGAIN"
              ) : (
                "🎙 RECORD AUDIO"
              )}
            </button>
            <button
              type="button"
              onClick={openFakeCall}
              style={{
                flex: 1,
                backgroundColor: "#1A2235",
                border: "1px solid #94A3B8",
                color: "#94A3B8",
                height: "48px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600"
              }}
            >
              📞 FAKE CALL ESCAPE
            </button>
          </div>
          
          {isRecording && (
            <button
              type="button"
              onClick={stopRecording}
              style={{
                width: "100%",
                backgroundColor: "#FF3B5C",
                color: "white",
                height: "40px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600"
              }}
            >
              STOP & SHARE
            </button>
          )}
          
          {audioBlob && !isRecording && (
            <div style={{ marginTop: "12px" }}>
              <div className="text-sm mb-2" style={{ color: "#94A3B8" }}>
                Audio recorded ({formatTime(recordingTime)}) — Download to share on WhatsApp
              </div>
              <button
                type="button"
                onClick={downloadAudio}
                style={{
                  width: "100%",
                  backgroundColor: "#1A2235",
                  border: "1px solid #00E5A0",
                  color: "#00E5A0",
                  height: "40px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "600"
                }}
              >
                DOWNLOAD AUDIO
              </button>
              <div className="text-xs mt-2" style={{ color: "#4B5563" }}>
                Download the audio and attach it manually in WhatsApp
              </div>
            </div>
          )}
        </div>

        {/* Cancel Button */}
        <button
          type="button"
          onClick={handleCancel}
          style={{
            width: "100%",
            backgroundColor: "transparent",
            border: "2px solid #00E5A0",
            color: "#00E5A0",
            fontSize: "16px",
            fontWeight: "700",
            padding: "14px",
            borderRadius: "10px"
          }}
        >
          ✓ I'M SAFE — Cancel Emergency
        </button>
      </div>
    </div>
  );
}

