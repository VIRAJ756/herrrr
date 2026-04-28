import { useEffect, useState } from "react";

export interface ReverseGeocodeResult {
  city: string;
  state: string;
  fullAddress: string;
}

export function useReverseGeocoding(lat: number | null, lng: number | null): {
  location: string;
  loading: boolean;
  error: string | null;
} {
  const [location, setLocation] = useState("Location unavailable");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (lat === null || lng === null) return;

    setLoading(true);
    setError(null);

    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
      .then((res) => res.json())
      .then((data) => {
        const city = data.address?.city || data.address?.town || data.address?.village || "";
        const state = data.address?.state || data.address?.state_district || "";
        
        if (city && state) {
          setLocation(`${city}, ${state}`);
        } else if (city) {
          setLocation(city);
        } else {
          setLocation("Location unavailable");
        }
      })
      .catch((err) => {
        console.error("Reverse geocoding error:", err);
        setError(err.message);
        setLocation("Location unavailable");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [lat, lng]);

  return { location, loading, error };
}
