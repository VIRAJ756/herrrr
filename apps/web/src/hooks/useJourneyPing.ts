import { useEffect, useRef } from "react";
import { useGeolocation } from "./useGeolocation";
import { useSocket } from "./useSocket";

function getJourneyId(): string {
  const key = "guardian-active-journey-id";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const generated = window.crypto?.randomUUID?.() ?? `journey-${Date.now()}`;
  window.localStorage.setItem(key, generated);
  return generated;
}

export function useJourneyPing(enabled: boolean): { journeyId: string | null } {
  const socket = useSocket();
  const { point } = useGeolocation();
  const journeyIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    journeyIdRef.current = getJourneyId();
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !point || !journeyIdRef.current) return;

    const emitPing = (): void => {
      socket.emit("journey:ping", {
        journeyId: journeyIdRef.current,
        lat: point.lat,
        lng: point.lng,
      });
    };

    emitPing();
    const timer = window.setInterval(emitPing, 5_000);
    return () => window.clearInterval(timer);
  }, [enabled, point, socket]);

  return { journeyId: journeyIdRef.current };
}

