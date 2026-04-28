import { useCallback, useEffect, useRef } from "react";
import { useSOSStore, type SOSStage } from "../store/sosStore";
import { useGeolocation } from "./useGeolocation";
import { useSocket } from "./useSocket";
import { api } from "../services/api";

interface SmsResult {
  success: boolean;
  sent: number;
  failed: number;
  mode: "simulated" | "gateway";
  message: string;
}

export function useSOS(onToast?: (title: string, description: string, variant: "success" | "destructive", mode?: "simulated" | "gateway") => void): {
  stage: SOSStage;
  countdownSeconds: number;
  beginHold: () => void;
  cancel: () => void;
  confirmTrigger: () => Promise<void>;
  cancelActive: () => void;
  openFakeCall: () => void;
} {
  const { stage, countdownSeconds, activeAlertId, setStage, setCountdown, setActiveAlertId, setSosCoordinates } =
    useSOSStore();
  const { requestOnce } = useGeolocation();
  const socket = useSocket();

  const holdTimer = useRef<number | null>(null);
  const countdownTimer = useRef<number | null>(null);

  const beginHold = useCallback(() => {
    if (stage !== "IDLE") return;
    setStage("COUNTDOWN");
    setCountdown(5);
    if ("vibrate" in navigator) navigator.vibrate(50);
  }, [setCountdown, setStage, stage]);

  const cancel = useCallback(() => {
    if (holdTimer.current) window.clearTimeout(holdTimer.current);
    if (countdownTimer.current) window.clearTimeout(countdownTimer.current);
    holdTimer.current = null;
    countdownTimer.current = null;
    setStage("IDLE");
    setCountdown(5);
  }, [setCountdown, setStage]);

  useEffect(() => {
    if (stage !== "COUNTDOWN") return;
    countdownTimer.current = window.setTimeout(() => {
      setCountdown(Math.max(0, countdownSeconds - 1));
    }, 1000);
    return () => {
      if (countdownTimer.current) window.clearTimeout(countdownTimer.current);
      countdownTimer.current = null;
    };
  }, [countdownSeconds, setCountdown, stage]);

  useEffect(() => {
    if (stage !== "COUNTDOWN") return;
    if (countdownSeconds > 0) return;
    void (async () => {
      await confirmTrigger();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdownSeconds, stage]);

  const confirmTrigger = useCallback(async () => {
    const pos = await requestOnce();
    setSosCoordinates({ lat: pos.lat, lng: pos.lng });
    setStage("SENT");
    if ("vibrate" in navigator) navigator.vibrate([100, 50, 100]);

    // Keep socket logic for backend integration
    socket.emit("sos:trigger", { userId: "demo-user", lat: pos.lat, lng: pos.lng });
    
    try {
      await api.post("/sos/trigger", { userId: "demo-user", lat: pos.lat, lng: pos.lng });
    } catch {
      // Silent error - UI-only flow
    }
  }, [requestOnce, setStage, setSosCoordinates, socket]);

  const cancelActive = useCallback(() => {
    if (activeAlertId) {
      socket.emit("sos:resolve", { alertId: activeAlertId });
    }
    setActiveAlertId(undefined);
    setStage("IDLE");
  }, [activeAlertId, setActiveAlertId, setStage, socket]);

  const openFakeCall = useCallback(() => {
    setStage("FAKE_CALL");
    if ("vibrate" in navigator) navigator.vibrate([200, 80, 200]);
  }, [setStage]);

  useEffect(() => {
    const handleActive = (payload: { alertId: string }) => {
      setActiveAlertId(payload.alertId);
      setStage("ACTIVE");
    };
    
    const handleSmsResult = (data: SmsResult) => {
      if (data.success && data.sent > 0) {
        const desc = data.mode === "simulated" 
          ? `${data.message} (${data.sent} contacts - Simulated)` 
          : `${data.message} (${data.sent} contacts)`;
        onToast?.("SOS Sent 🚨", desc, "success", data.mode);
      } else if (!data.success) {
        onToast?.("SMS Failed ❌", data.message || "Could not send alerts. Please try again.", "destructive", data.mode);
      } else if (data.sent === 0 && data.failed === 0) {
        onToast?.("No Contacts ⚠️", data.message || "Add emergency contacts in settings to enable SMS alerts.", "destructive", data.mode);
      }
    };
    
    socket.on("sos:active", handleActive);
    socket.on("sos:sms-result", handleSmsResult);
    
    return () => {
      socket.off("sos:active", handleActive);
      socket.off("sos:sms-result", handleSmsResult);
    };
  }, [setActiveAlertId, setStage, socket, onToast]);

  useEffect(() => {
    return () => {
      if (holdTimer.current) window.clearTimeout(holdTimer.current);
      if (countdownTimer.current) window.clearTimeout(countdownTimer.current);
    };
  }, []);

  return { stage, countdownSeconds, beginHold, cancel, confirmTrigger, cancelActive, openFakeCall };
}

