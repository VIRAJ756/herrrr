import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSOSStore } from "../store/sosStore";
import { useLang } from "../context/LanguageContext";
import { clearDemoUser, getDemoMode, getDemoUser, setDemoMode } from "../services/auth";
import { MobileNav } from "../components/layout/MobileNav";
import { DemoBanner } from "../components/layout/DemoBanner";

export default function Settings(): React.ReactElement {
  const { t } = useLang();
  const navigate = useNavigate();
  const { fakeCallerName, setFakeCallerName } = useSOSStore();
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("guardian-voice-activation") === "true";
  });
  const [demoModeEnabled, setDemoModeEnabled] = useState<boolean>(() => getDemoMode());
  const user = getDemoUser();

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("guardian-voice-activation", String(voiceEnabled));
  }, [voiceEnabled]);
  useEffect(() => {
    setDemoMode(demoModeEnabled);
  }, [demoModeEnabled]);

  return (
    <main style={{
      background: "#0a0f1a",
      padding: "24px",
      minHeight: "100vh",
      fontFamily: "Inter, -apple-system, sans-serif"
    }}>
      <button
        onClick={() => window.history.back()}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'transparent',
          border: 'none',
          color: '#94a3b8',
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer',
          padding: '12px 0',
          marginBottom: '8px'
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5"/>
          <path d="M12 19l-7-7 7-7"/>
        </svg>
        Back
      </button>
      <DemoBanner />
      <div className="mx-auto max-w-3xl">
        <div style={{
          fontSize: "13px",
          fontWeight: 600,
          letterSpacing: "0.1em",
          color: "#4a5568",
          marginBottom: "20px"
        }}>
          SETTINGS
        </div>
        <div style={{
          background: "#111827",
          border: "1px solid #1e2d3d",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.4)"
        }}>
          <div style={{ fontSize: "14px", color: "#cbd5e1", fontWeight: 400 }}>
            Profile + fake-call customization + notification permissions.
          </div>
          <div style={{ marginTop: "16px" }}>
            <label className="block">
              <div style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "#4a5568",
                letterSpacing: "0.1em",
                marginBottom: "8px"
              }}>
                FAKE CALLER NAME
              </div>
              <input
                value={fakeCallerName}
                onChange={(event) => setFakeCallerName(event.target.value)}
                style={{
                  width: "100%",
                  borderRadius: "10px",
                  border: "1px solid #1e2d3d",
                  background: "#0d1520",
                  padding: "14px 16px",
                  fontSize: "15px",
                  color: "#ffffff",
                  outline: "none"
                }}
              />
            </label>
            <button
              type="button"
              role="switch"
              aria-checked={voiceEnabled}
              onClick={() => setVoiceEnabled((value) => !value)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderRadius: "12px",
                border: "1px solid #1e2d3d",
                background: "#111827",
                padding: "16px 20px",
                marginBottom: "8px",
                cursor: "pointer"
              }}
            >
              <span style={{ fontSize: "15px", color: "#ffffff", fontWeight: 400 }}>Say "Help" or "SOS" to trigger</span>
              <div style={{
                width: "44px",
                height: "24px",
                borderRadius: "12px",
                background: voiceEnabled ? "#22c55e" : "#1f2937",
                position: "relative",
                transition: "background-color 150ms"
              }}>
                <span style={{
                  position: "absolute",
                  top: "2px",
                  left: voiceEnabled ? "22px" : "2px",
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  background: "#ffffff",
                  transition: "transform 150ms"
                }}></span>
              </div>
            </button>
            <button
              type="button"
              role="switch"
              aria-checked={demoModeEnabled}
              onClick={() => setDemoModeEnabled((value) => !value)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderRadius: "12px",
                border: "1px solid #1e2d3d",
                background: "#111827",
                padding: "16px 20px",
                marginBottom: "8px",
                cursor: "pointer"
              }}
            >
              <span style={{ fontSize: "15px", color: "#ffffff", fontWeight: 400 }}>Demo mode</span>
              <div style={{
                width: "44px",
                height: "24px",
                borderRadius: "12px",
                background: demoModeEnabled ? "#22c55e" : "#1f2937",
                position: "relative",
                transition: "background-color 150ms"
              }}>
                <span style={{
                  position: "absolute",
                  top: "2px",
                  left: demoModeEnabled ? "22px" : "2px",
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  background: "#ffffff",
                  transition: "transform 150ms"
                }}></span>
              </div>
            </button>
            <div style={{
              borderRadius: "12px",
              border: "1px solid #1e2d3d",
              background: "#111827",
              padding: "16px 20px"
            }}>
              <div style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "#4a5568",
                letterSpacing: "0.1em",
                marginBottom: "8px"
              }}>
                ACCOUNT
              </div>
              <div style={{ fontSize: "16px", fontWeight: 600, color: "#ffffff" }}>
                {user?.name ?? "Demo User"}
              </div>
              <div style={{ fontSize: "14px", color: "#6b7280", marginTop: "2px" }}>
                {user?.email ?? "demo@trinetra.app"}
              </div>
              <button
                type="button"
                onClick={() => {
                  clearDemoUser();
                  navigate("/login");
                }}
                style={{
                  width: "100%",
                  height: "52px",
                  background: "transparent",
                  border: "1px solid #ef4444",
                  color: "#ef4444",
                  fontSize: "15px",
                  fontWeight: 600,
                  borderRadius: "12px",
                  marginTop: "12px",
                  cursor: "pointer",
                  transition: "background-color 150ms"
                }}
                onMouseOver={(e) => e.currentTarget.style.background = "rgba(239,68,68,0.08)"}
                onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
      <MobileNav />
    </main>
  );
}

