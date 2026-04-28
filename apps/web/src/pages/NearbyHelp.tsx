import React, { useState, useEffect, useCallback } from "react";
import { useGeolocation } from "../hooks/useGeolocation";

type TabType = "medical" | "restrooms" | "gov";

interface Place {
  id: string;
  name: string;
  lat: number;
  lng: number;
  distance: number;
  address?: string;
}

const TABS: { id: TabType; label: string; icon: string }[] = [
  { id: "medical", label: "Medical", icon: "🏥" },
  { id: "restrooms", label: "Restrooms", icon: "💧" },
  { id: "gov", label: "Gov. Centers", icon: "🏛" },
];

// Haversine formula for distance calculation
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

async function fetchOverpass(query: string): Promise<any[]> {
  try {
    const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
    const data = await response.json();
    return data.elements || [];
  } catch (error) {
    console.error("Overpass API error:", error);
    return [];
  }
}

export default function NearbyHelp(): React.ReactElement {
  const { point } = useGeolocation();
  const [activeTab, setActiveTab] = useState<TabType>("medical");
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlaces = useCallback(async (lat: number, lng: number) => {
    setLoading(true);
    setError(null);
    setPlaces([]);

    let query = "";

    if (activeTab === "medical") {
      query = `[out:json];node["amenity"="hospital"](around:3000,${lat},${lng});out 10;node["amenity"="clinic"](around:3000,${lat},${lng});out 10;node["amenity"="pharmacy"](around:3000,${lat},${lng});out 10;`;
    } else if (activeTab === "restrooms") {
      query = `[out:json];node["amenity"="toilets"](around:2000,${lat},${lng});out 10;`;
    } else if (activeTab === "gov") {
      query = `[out:json];node["amenity"="social_facility"](around:5000,${lat},${lng});out 10;node["office"="government"](around:5000,${lat},${lng});out 5;`;
    }

    const elements = await fetchOverpass(query);

    const results: Place[] = elements
      .map((el: any) => ({
        id: el.id.toString(),
        name: el.tags?.name || "Unnamed Facility",
        lat: el.lat,
        lng: el.lon,
        distance: calculateDistance(lat, lng, el.lat, el.lon),
        address: el.tags?.["addr:street"] || undefined,
      }))
      .sort((a, b) => a.distance - b.distance);

    setPlaces(results);
    setLoading(false);
  }, [activeTab]);

  useEffect(() => {
    if (point?.lat && point?.lng) {
      fetchPlaces(point.lat, point.lng);
    }
  }, [point, activeTab, fetchPlaces]);

  const handleGetDirections = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-40 bg-[#0A0E17] md:relative md:bg-transparent md:flex-1">
      <div className="h-full overflow-y-auto p-6">
        <h1 className="text-2xl font-bold text-white mb-6">Nearby Help</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-[#00E5A0] text-black"
                  : "bg-[#1A2235] text-[#94A3B8] hover:text-white"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Notes */}
        {activeTab === "medical" && (
          <div className="mb-4 p-3 rounded-md bg-[#1A2235] border border-[#00E5A0]/30 text-[#94A3B8] text-sm">
            💊 Many government hospitals provide free sanitary products. Ask at the reception.
          </div>
        )}
        {activeTab === "gov" && (
          <div className="mb-4 p-3 rounded-md bg-[#1A2235] border border-[#00E5A0]/30 text-[#94A3B8] text-sm">
            🏛 Government centers may offer free sanitary pad schemes under national health programs.
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-md bg-[#1A2235] animate-pulse" />
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-4 rounded-md bg-red-900/30 border border-red-500/50 text-red-200">
            {error}
          </div>
        )}

        {/* Results */}
        {!loading && !error && places.length === 0 && (
          <div className="p-4 rounded-md bg-[#1A2235] text-[#94A3B8]">
            No results found nearby. Try expanding your search area.
          </div>
        )}

        {!loading && !error && places.length > 0 && (
          <div className="space-y-3">
            {places.map((place) => (
              <div
                key={place.id}
                className="p-4 rounded-md bg-[#0F1520] border border-gray-800"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="text-white font-medium mb-1">{place.name}</h3>
                    <p className="text-[#94A3B8] text-sm mb-1">
                      {place.distance < 1000
                        ? `${Math.round(place.distance)}m away`
                        : `${(place.distance / 1000).toFixed(1)}km away`}
                    </p>
                    {place.address && (
                      <p className="text-[#4B5563] text-xs">{place.address}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleGetDirections(place.lat, place.lng)}
                    className="px-3 py-1.5 rounded-md bg-[#00E5A0] text-black text-xs font-medium hover:bg-[#00E5A0]/80 transition-colors"
                  >
                    Get Directions
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
