import { useEffect, useRef } from "react";
import { useGeolocation } from "./useGeolocation";
import { useSocket } from "./useSocket";
import { useJourneyStore } from "../store/journeyStore";

export function useJourneyPing(enabled: boolean): { journeyId: string | null } {
  const socket = useSocket();
  const { point } = useGeolocation();
  const activeJourney = useJourneyStore((state) => state.activeJourney);
  const journeyIdRef = useRef<string | null>(null);

  useEffect(() => {
    journeyIdRef.current = enabled ? activeJourney?.id ?? null : null;
  }, [activeJourney?.id, enabled]);

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

