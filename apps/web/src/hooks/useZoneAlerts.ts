import { useEffect, useRef, useState } from "react";
import { useSocket } from "./useSocket";
import { useGeolocation } from "./useGeolocation";
import type { ZoneAlertPayload } from "../types/zone";

export type ZoneAlertViewModel = ZoneAlertPayload & {
  id: string;
  distanceMeters: number | null;
};

export function useZoneAlerts(): {
  alert: ZoneAlertViewModel | null;
  dismiss: () => void;
} {
  const socket = useSocket();
  const { point } = useGeolocation();
  const [alert, setAlert] = useState<ZoneAlertViewModel | null>(null);
  const seen = useRef<Set<string>>(new Set());

  useEffect(() => {
    const handleZoneAlert = (payload: ZoneAlertPayload): void => {
      const distanceMeters = point
        ? Math.round(
            haversineMeters(
              point.lat,
              point.lng,
              payload.zoneData.latitude,
              payload.zoneData.longitude,
            ),
          )
        : null;

      const id = `${payload.zoneData.id}:${payload.riskScore.toFixed(2)}:${distanceMeters ?? "na"}`;
      if (seen.current.has(id)) return;
      seen.current.add(id);

      setAlert({
        ...payload,
        id,
        distanceMeters,
      });
    };

    socket.on("zone:alert", handleZoneAlert);
    return () => {
      socket.off("zone:alert", handleZoneAlert);
    };
  }, [point, socket]);

  return {
    alert,
    dismiss: () => setAlert(null),
  };
}

function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (degrees: number): number => (degrees * Math.PI) / 180;
  const earthRadius = 6_371_000;
  const deltaLat = toRad(lat2 - lat1);
  const deltaLng = toRad(lng2 - lng1);
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(deltaLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadius * c;
}

