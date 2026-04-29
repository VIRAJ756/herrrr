import React, { useState, useEffect, useCallback } from "react";
import { useGeolocation } from "../hooks/useGeolocation";
import { useLang } from "../context/LanguageContext";

type TabType = "medical" | "restrooms" | "gov" | "police";

interface Place {
  id: string;
  name: string;
  lat: number;
  lng: number;
  distance: number;
  address?: string;
  phone?: string;
}

const TABS: { id: TabType; label: string; icon: string }[] = [
  { id: "medical", label: "Medical", icon: "🏥" },
  { id: "restrooms", label: "Restrooms", icon: "💧" },
  { id: "gov", label: "Gov. Centers", icon: "🏛" },
  { id: "police", label: "Police", icon: "🚔" },
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
  const { t } = useLang();
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
    } else if (activeTab === "police") {
      query = `[out:json];node["amenity"="police"](around:5000,${lat},${lng});out 15;`;
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
        phone: el.tags?.phone || el.tags?.["contact:phone"] || undefined,
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
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 40,
      background: "#0a0f1a",
      fontFamily: "Inter, -apple-system, sans-serif"
    }}>
      <div style={{
        height: "100%",
        overflowY: "auto",
        padding: "24px"
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
        <h1 style={{
          fontSize: "24px",
          fontWeight: 800,
          color: "#ffffff",
          marginBottom: "20px"
        }}>{t("nearby.title")}</h1>

        {/* Tabs */}
        <div style={{
          display: "flex",
          gap: "8px",
          marginBottom: "20px"
        }}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                borderRadius: "20px",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 150ms ease",
                background: activeTab === tab.id ? "#22c55e" : "#111827",
                color: activeTab === tab.id ? "#0a0f1a" : "#6b7280",
                border: activeTab === tab.id ? "none" : "1px solid #1e2d3d"
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Notes */}
        {activeTab === "medical" && (
          <div style={{
            marginBottom: "16px",
            padding: "14px 16px",
            borderRadius: "10px",
            background: "#111827",
            border: "1px solid #1e2d3d",
            borderLeft: "3px solid #22c55e",
            fontSize: "13px",
            color: "#94a3b8"
          }}>
            💊 Many government hospitals provide free sanitary products. Ask at the reception.
          </div>
        )}
        {activeTab === "gov" && (
          <div style={{
            marginBottom: "16px",
            padding: "14px 16px",
            borderRadius: "10px",
            background: "#111827",
            border: "1px solid #1e2d3d",
            borderLeft: "3px solid #22c55e",
            fontSize: "13px",
            color: "#94a3b8"
          }}>
            🏛 Government centers may offer free sanitary pad schemes under national health programs.
          </div>
        )}
        {activeTab === "police" && (
          <div style={{ marginBottom: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{
              padding: "14px 16px",
              borderRadius: "10px",
              background: "#111827",
              border: "1px solid #1e2d3d",
              borderLeft: "3px solid #ef4444",
              fontSize: "13px",
              color: "#94a3b8",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}>
              <span>🚔 {t("emergency.police")}: 100</span>
              <a href="tel:100" style={{
                padding: "6px 12px",
                borderRadius: "8px",
                background: "#22c55e",
                color: "#0a0f1a",
                fontSize: "12px",
                fontWeight: 500,
                cursor: "pointer",
                textDecoration: "none",
                transition: "background-color 150ms"
              }}
              onMouseOver={(e) => e.currentTarget.style.background = "#16a34a"}
              onMouseOut={(e) => e.currentTarget.style.background = "#22c55e"}
              >{t("nearby.call")}</a>
            </div>
            <div style={{
              padding: "14px 16px",
              borderRadius: "10px",
              background: "#111827",
              border: "1px solid #1e2d3d",
              borderLeft: "3px solid #ef4444",
              fontSize: "13px",
              color: "#94a3b8",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}>
              <span>🚑 {t("emergency.ambulance")}: 108</span>
              <a href="tel:108" style={{
                padding: "6px 12px",
                borderRadius: "8px",
                background: "#22c55e",
                color: "#0a0f1a",
                fontSize: "12px",
                fontWeight: 500,
                cursor: "pointer",
                textDecoration: "none",
                transition: "background-color 150ms"
              }}
              onMouseOver={(e) => e.currentTarget.style.background = "#16a34a"}
              onMouseOut={(e) => e.currentTarget.style.background = "#22c55e"}
              >{t("nearby.call")}</a>
            </div>
            <div style={{
              padding: "14px 16px",
              borderRadius: "10px",
              background: "#111827",
              border: "1px solid #1e2d3d",
              borderLeft: "3px solid #ef4444",
              fontSize: "13px",
              color: "#94a3b8",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}>
              <span>🔥 {t("emergency.fire")}: 101</span>
              <a href="tel:101" style={{
                padding: "6px 12px",
                borderRadius: "8px",
                background: "#22c55e",
                color: "#0a0f1a",
                fontSize: "12px",
                fontWeight: 500,
                cursor: "pointer",
                textDecoration: "none",
                transition: "background-color 150ms"
              }}
              onMouseOver={(e) => e.currentTarget.style.background = "#16a34a"}
              onMouseOut={(e) => e.currentTarget.style.background = "#22c55e"}
              >{t("nearby.call")}</a>
            </div>
            <div style={{
              padding: "14px 16px",
              borderRadius: "10px",
              background: "#111827",
              border: "1px solid #1e2d3d",
              borderLeft: "3px solid #ef4444",
              fontSize: "13px",
              color: "#94a3b8",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}>
              <span>🆘 {t("emergency.women")}: 1091</span>
              <a href="tel:1091" style={{
                padding: "6px 12px",
                borderRadius: "8px",
                background: "#22c55e",
                color: "#0a0f1a",
                fontSize: "12px",
                fontWeight: 500,
                cursor: "pointer",
                textDecoration: "none",
                transition: "background-color 150ms"
              }}
              onMouseOver={(e) => e.currentTarget.style.background = "#16a34a"}
              onMouseOut={(e) => e.currentTarget.style.background = "#22c55e"}
              >{t("nearby.call")}</a>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{
                height: "80px",
                borderRadius: "12px",
                background: "#0d1520",
                animation: "pulse 2s infinite"
              }} />
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            padding: "14px 16px",
            borderRadius: "10px",
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            color: "#fca5a5",
            fontSize: "13px"
          }}>
            {error}
          </div>
        )}

        {/* Results */}
        {!loading && !error && places.length === 0 && (
          <div style={{
            padding: "16px 20px",
            borderRadius: "12px",
            background: "#111827",
            border: "1px solid #1e2d3d",
            fontSize: "14px",
            color: "#cbd5e1"
          }}>
            No results found nearby. Try expanding your search area.
          </div>
        )}

        {!loading && !error && places.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {places.map((place) => (
              <div
                key={place.id}
                style={{
                  padding: "16px 20px",
                  borderRadius: "12px",
                  background: "#111827",
                  border: "1px solid #1e2d3d"
                }}
              >
                <div style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: "12px"
                }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      color: "#ffffff",
                      fontWeight: 600,
                      fontSize: "16px",
                      marginBottom: "4px"
                    }}>{place.name}</h3>
                    <p style={{
                      color: "#94a3b8",
                      fontSize: "13px",
                      marginBottom: "4px"
                    }}>
                      {place.distance < 1000
                        ? `${Math.round(place.distance)}m away`
                        : `${(place.distance / 1000).toFixed(1)}km away`}
                    </p>
                    {place.address && (
                      <p style={{ color: "#6b7280", fontSize: "12px" }}>{place.address}</p>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {place.phone && (
                      <a
                        href={`tel:${place.phone}`}
                        style={{
                          padding: "6px 14px",
                          borderRadius: "8px",
                          background: "#22c55e",
                          color: "#0a0f1a",
                          fontSize: "12px",
                          fontWeight: 500,
                          cursor: "pointer",
                          textDecoration: "none",
                          transition: "background-color 150ms"
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = "#16a34a"}
                        onMouseOut={(e) => e.currentTarget.style.background = "#22c55e"}
                      >
                        {t("nearby.call")}
                      </a>
                    )}
                    <button
                      onClick={() => handleGetDirections(place.lat, place.lng)}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "8px",
                        background: "transparent",
                        border: "1px solid #1e2d3d",
                        color: "#cbd5e1",
                        fontSize: "12px",
                        fontWeight: 500,
                        cursor: "pointer",
                        transition: "all 150ms"
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.borderColor = "#22c55e";
                        e.currentTarget.style.color = "#22c55e";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.borderColor = "#1e2d3d";
                        e.currentTarget.style.color = "#cbd5e1";
                      }}
                    >
                      {t("nearby.directions")}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
