import React, { useCallback, useMemo, useState, useEffect, useRef } from "react";
import { Sidebar } from "../components/layout/Sidebar";
import { TopBar } from "../components/layout/TopBar";
import { GuardianMap } from "../components/map/GuardianMap";
import { RiskScoreCard } from "../components/intel/RiskScoreCard";
import { AlertBanner } from "../components/intel/AlertBanner";
import { LayerControls } from "../components/map/LayerControls";
import { SOSButton } from "../components/sos/SOSButton";
import { ToastContainer } from "../components/layout/ToastContainer";
import { StatusBar } from "../components/layout/StatusBar";
import { useJourneyPing } from "../hooks/useJourneyPing";
import { useZoneAlerts } from "../hooks/useZoneAlerts";
import { useSOS } from "../hooks/useSOS";
import { useVoiceActivation } from "../hooks/useVoiceActivation";
import { useToast } from "../hooks/useToast";
import { useGeolocation } from "../hooks/useGeolocation";
import { useReverseGeocoding } from "../hooks/useReverseGeocoding";
import { MobileNav } from "../components/layout/MobileNav";
import { getDemoMode, getDemoUser } from "../services/auth";
import { DemoBanner } from "../components/layout/DemoBanner";
import { api } from "../services/api";
import type { Contact } from "../types/contact";

export default function Dashboard(props: { demo: boolean }): React.ReactElement {
  const demoMode = props.demo || getDemoMode();
  useJourneyPing(true);
  const { alert, dismiss } = useZoneAlerts();
  const { toast, toasts, dismiss: dismissToast } = useToast();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [userName, setUserName] = useState<string>("Trinetra User");
  const [riskZones, setRiskZones] = useState<any[]>([]);

  const lastNotifiedZone = useRef<string | null>(null);
  const notificationCooldown = useRef<number>(0);

  useEffect(() => {
    api.get<Contact[]>("/contacts")
      .then((res) => {
        const data = res.data as any;
        const list = Array.isArray(data) ? data : data.contacts ?? data.data ?? [];
        setContacts(list);
      })
      .catch((err) => console.error("Contacts fetch error:", err));

    const user = getDemoUser();
    if (user?.name) {
      setUserName(user.name);
    }

    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    api.get("/zones/heatmap")
      .then((res) => {
        const data = res.data as any;
        const zones = Array.isArray(data) ? data : data.zones ?? data.data ?? [];
        setRiskZones(zones);
      })
      .catch(() => {});

    document.title = "Security Dashboard";
  }, []);

  const { point } = useGeolocation();
  const { location } = useReverseGeocoding(point?.lat ?? null, point?.lng ?? null);

  const getDistanceMetres = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  };

  const showRiskZoneAlert = (severity: string, zone: any, color: string) => {
    const existing = document.getElementById("trinetra-risk-alert");
    if (existing) existing.remove();

    const el = document.createElement("div");
    el.id = "trinetra-risk-alert";
    el.style.cssText = `
      position: fixed;
      top: 64px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 9000;
      background: #0F1520;
      border: 1px solid ${color};
      border-left: 4px solid ${color};
      border-radius: 10px;
      padding: 14px 20px;
      font-family: 'Inter', sans-serif;
      color: #E2E8F0;
      max-width: 380px;
      width: 90%;
      box-shadow: 0 4px 32px rgba(0,0,0,0.6);
      animation: slideDown 0.3s ease;
      cursor: pointer;
    `;
    el.innerHTML = `
      <div style="display:flex;align-items:flex-start;gap:12px;">
        <div style="font-size:22px;margin-top:1px;">⚠️</div>
        <div style="flex:1;">
          <div style="font-size:11px;letter-spacing:2px;color:${color};font-weight:700;margin-bottom:3px;">
            ${severity} RISK ZONE DETECTED
          </div>
          <div style="font-size:13px;font-weight:500;color:#E2E8F0;margin-bottom:4px;">
            You are entering a dangerous area
          </div>
          <div style="font-size:11px;color:#94A3B8;">
            ${zone.incidentCount || "Multiple"} incidents reported within 300m — Stay alert
          </div>
        </div>
        <div onclick="document.getElementById('trinetra-risk-alert').remove()"
          style="font-size:16px;color:#4B5563;cursor:pointer;padding:2px 4px;line-height:1;">✕</div>
      </div>
      <div style="
        position:absolute;bottom:0;left:0;height:3px;
        background:${color};border-radius:0 0 0 10px;
        animation:shrinkBar 8s linear forwards;
      "></div>
    `;
    document.body.appendChild(el);

    setTimeout(() => {
      if (document.getElementById("trinetra-risk-alert")) {
        el.style.opacity = "0";
        el.style.transition = "opacity 0.4s";
        setTimeout(() => el.remove(), 400);
      }
    }, 8000);
  };

  const checkRiskZoneEntry = (userLat: number, userLng: number, zones: any[]) => {
    const now = Date.now();
    if (now - notificationCooldown.current < 120000) return;

    for (const zone of zones) {
      const distance = getDistanceMetres(userLat, userLng, zone.lat, zone.lng);

      if (distance < 300 && zone.riskScore > 0.6) {
        const zoneKey = `${zone.lat.toFixed(3)},${zone.lng.toFixed(3)}`;
        if (lastNotifiedZone.current === zoneKey) continue;

        lastNotifiedZone.current = zoneKey;
        notificationCooldown.current = now;

        const severity = zone.riskScore > 0.85 ? "CRITICAL" : "HIGH";
        const color = zone.riskScore > 0.85 ? "#FF3B5C" : "#F59E0B";

        showRiskZoneAlert(severity, zone, color);

        if (Notification.permission === "granted") {
          new Notification("⚠️ TRINETRA Safety Alert", {
            body: `You are entering a ${severity} risk area. ${zone.incidentCount || "Multiple"} incidents reported nearby.`,
            icon: "/trinetra-icon.png",
            tag: "risk-zone",
            requireInteraction: true,
          });
        }
        break;
      }
    }
  };

  useEffect(() => {
    if (point?.lat && point?.lng && riskZones.length > 0) {
      checkRiskZoneEntry(point.lat, point.lng, riskZones);
    }
  }, [point, riskZones]);
  
  const handleSosToast = useCallback((title: string, description: string, variant: "success" | "destructive", _mode?: "simulated" | "gateway") => {
    toast({ title, description, variant });
  }, [toast]);
  
  const { confirmTrigger } = useSOS(handleSosToast);
  
  const voiceEnabled =
    typeof window !== "undefined" &&
    window.localStorage.getItem("guardian-voice-activation") === "true";
  useVoiceActivation(voiceEnabled, () => {
    void confirmTrigger();
  });

  return (
    <div style={{
      position: "relative",
      height: "100vh",
      width: "100vw",
      overflow: "hidden",
      background: "#0a0f1a",
      fontFamily: "Inter, -apple-system, sans-serif"
    }}>
      {demoMode ? <DemoBanner /> : null}
      <h1 className="sr-only">Security Dashboard</h1>
      <TopBar areaLabel={location} live={true} />
      <div style={{
        position: "relative",
        display: "flex",
        height: "calc(100vh - 48px)"
      }}>
        <Sidebar />
        <main style={{
          position: "relative",
          flex: 1,
          overflow: "hidden"
        }}>
          <GuardianMap demo={props.demo} userLat={point?.lat} userLng={point?.lng} />

          <LayerControls />

          <div style={{
            pointerEvents: "none",
            position: "absolute",
            right: "16px",
            top: "16px",
            zIndex: 40,
            width: "280px"
          }}>
            <div style={{
              pointerEvents: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "12px"
            }}>
              <AlertBanner alert={alert} onDismiss={dismiss} />
              <RiskScoreCard demo={props.demo} />
            </div>
          </div>

          <SOSButton contacts={contacts} userName={userName} />
        </main>
      </div>
      <MobileNav />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <StatusBar />
    </div>
  );
}

