import { useEffect, useMemo, useRef, useState } from "react";

export type GeoPoint = { lat: number; lng: number; accuracy?: number; timestamp: number };

export function useGeolocation(options?: PositionOptions): {
  point: GeoPoint | null;
  error: string | null;
  isSupported: boolean;
  requestOnce: () => Promise<GeoPoint>;
} {
  const isSupported = typeof navigator !== "undefined" && "geolocation" in navigator;
  const [point, setPoint] = useState<GeoPoint | null>(null);
  const [error, setError] = useState<string | null>(null);
  const lastUpdateAt = useRef<number>(0);

  const positionOptions = useMemo<PositionOptions>(
    () => ({
      enableHighAccuracy: true,
      timeout: 10_000,
      maximumAge: 5_000,
      ...options,
    }),
    [options],
  );

  useEffect(() => {
    if (!isSupported) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const now = Date.now();
        // Basic anti-jitter: ignore updates that come too frequently.
        if (now - lastUpdateAt.current < 500) return;
        lastUpdateAt.current = now;
        setError(null);
        setPoint({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp,
        });
      },
      (e) => setError(e.message),
      positionOptions,
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [isSupported, positionOptions]);

  const requestOnce = (): Promise<GeoPoint> => {
    return new Promise((resolve, reject) => {
      if (!isSupported) {
        reject(new Error("Geolocation not supported"));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const gp: GeoPoint = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            timestamp: pos.timestamp,
          };
          setPoint(gp);
          resolve(gp);
        },
        (e) => {
          setError(e.message);
          reject(e);
        },
        positionOptions
      );
    });
  };

  return { point, error, isSupported, requestOnce };
}

