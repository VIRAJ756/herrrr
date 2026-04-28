import { useCallback, useEffect, useRef } from "react";
import { useSOSStore } from "../store/sosStore";
import { useGeolocation } from "./useGeolocation";
import { useSocket } from "./useSocket";

export function useSOS(): {
  stage: ReturnType<typeof useSOSStore>["stage"];
  countdownSeconds: number;
  beginHold: () => void;
  cancel: () => void;
  confirmTrigger: () => Promise<void>;
} {
  const { stage, countdownSeconds, setStage, setCountdown, setActiveAlertId } = useSOSStore();
  const { requestOnce } = useGeolocation();
  const socket = useSocket();

  const holdTimer = useRef<number | null>(null);
  const countdownTimer = useRef<number | null>(null);

  const beginHold = useCallback(() => {
    if (stage !== "IDLE") return;
    holdTimer.current = window.setTimeout(() => {
      setStage("COUNTDOWN");
      setCountdown(3);
      if ("vibrate" in navigator) navigator.vibrate(50);
    }, 1500);
  }, [setCountdown, setStage, stage]);

  const cancel = useCallback(() => {
    if (holdTimer.current) window.clearTimeout(holdTimer.current);
    if (countdownTimer.current) window.clearTimeout(countdownTimer.current);
    holdTimer.current = null;
    countdownTimer.current = null;
    setStage("IDLE");
    setCountdown(3);
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
    setStage("ACTIVE");
    if ("vibrate" in navigator) navigator.vibrate([100, 50, 100]);

    socket.emit("sos:trigger", { userId: "demo-user", lat: pos.lat, lng: pos.lng });
    setActiveAlertId("local-demo-alert");
  }, [requestOnce, setActiveAlertId, setStage, socket]);

  useEffect(() => {
    return () => {
      if (holdTimer.current) window.clearTimeout(holdTimer.current);
      if (countdownTimer.current) window.clearTimeout(countdownTimer.current);
    };
  }, []);

  return { stage, countdownSeconds, beginHold, cancel, confirmTrigger };
}

