import React, { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useGeolocation } from "../hooks/useGeolocation";
import { useLang } from "../context/LanguageContext";
import { MobileNav } from "../components/layout/MobileNav";
import { DemoBanner } from "../components/layout/DemoBanner";
import type { IncidentType } from "../types/incident";

const TYPES: { type: IncidentType; label: string }[] = [
  { type: "HARASSMENT", label: "Harassment" },
  { type: "STALKING", label: "Stalking" },
  { type: "POOR_LIGHTING", label: "Poor Lighting" },
  { type: "ASSAULT", label: "Assault" },
  { type: "SUSPICIOUS_ACTIVITY", label: "Suspicious Activity" },
  { type: "OTHER", label: "Other" }
];

function Pill(props: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <button
      type="button"
      style={{
        borderRadius: "20px",
        padding: "8px 16px",
        fontSize: "13px",
        fontWeight: 500,
        cursor: "pointer",
        transition: "all 150ms ease",
        background: props.active ? "#22c55e" : "#111827",
        color: props.active ? "#0a0f1a" : "#6b7280",
        border: props.active ? "none" : "1px solid #1e2d3d"
      }}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
}

export default function ReportIncident(): React.ReactElement {
  const { t } = useLang();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { point, requestOnce, isSupported, error: geoError } = useGeolocation();
  const [type, setType] = useState<IncidentType>("HARASSMENT");
  const [severity, setSeverity] = useState(3);
  const [anon, setAnon] = useState(true);
  const [desc, setDesc] = useState("");
  const [locationLabel, setLocationLabel] = useState(t("topbar.location_loading"));

  const severityLabel = useMemo(() => {
    if (severity >= 5) return "CRITICAL";
    if (severity >= 4) return "HIGH";
    if (severity >= 3) return "MEDIUM";
    if (severity >= 2) return "LOW";
    return "MINOR";
  }, [severity]);

  const submitMutation = useMutation({
    mutationFn: async () => {
      const currentPoint = point ?? (await requestOnce());
      const response = await api.post("/incidents", {
        latitude: currentPoint.lat,
        longitude: currentPoint.lng,
        type,
        description: desc.trim() || undefined,
        mediaUrls: [],
        severity,
        isAnonymous: anon,
      });
      return response.data;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["incidents"] }),
        queryClient.invalidateQueries({ queryKey: ["zones", "heatmap"] }),
      ]);
      setDesc("");
      setSeverity(3);
      setAnon(true);
      setType("HARASSMENT");
      navigate("/feed");
    },
  });

  async function handleUseCurrentLocation(): Promise<void> {
    try {
      const currentPoint = point ?? (await requestOnce());
      setLocationLabel(
        `Pinned ${currentPoint.lat.toFixed(4)}, ${currentPoint.lng.toFixed(4)}`,
      );
    } catch (error) {
      setLocationLabel(error instanceof Error ? error.message : "Unable to fetch location.");
    }
  }

  return (
    <main style={{
      background: "#0a0f1a",
      padding: "24px",
      minHeight: "100vh",
      fontFamily: "Inter, -apple-system, sans-serif"
    }}>
      <DemoBanner />
      <div className="mx-auto max-w-xl">
        <div style={{
          fontSize: "13px",
          fontWeight: 600,
          letterSpacing: "0.1em",
          color: "#4a5568",
          marginBottom: "20px"
        }}>
          NEW FIELD REPORT
        </div>

        <section style={{
          background: "#111827",
          border: "1px solid #1e2d3d",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.4)"
        }}>
          <div style={{
            fontSize: "11px",
            fontWeight: 600,
            color: "#4a5568",
            letterSpacing: "0.1em"
          }}>
            INCIDENT TYPE
          </div>
          <div style={{
            marginTop: "12px",
            display: "flex",
            flexWrap: "wrap",
            gap: "8px"
          }}>
            {TYPES.map((t) => (
              <Pill key={t.type} active={t.type === type} onClick={() => setType(t.type)}>
                {t.label}
              </Pill>
            ))}
          </div>

          <div style={{
            marginTop: "24px",
            fontSize: "11px",
            fontWeight: 600,
            color: "#4a5568",
            letterSpacing: "0.1em"
          }}>
            SEVERITY <span style={{ marginLeft: "8px", color: "#cbd5e1" }}>{severityLabel}</span>
          </div>
          <input
            style={{
              marginTop: "12px",
              width: "100%",
              accentColor: "#22c55e"
            }}
            type="range"
            min={1}
            max={5}
            value={severity}
            onChange={(e) => setSeverity(Number(e.target.value))}
            aria-label="Severity"
          />

          <div style={{
            marginTop: "24px",
            fontSize: "11px",
            fontWeight: 600,
            color: "#4a5568",
            letterSpacing: "0.1em"
          }}>
            LOCATION
          </div>
          <div style={{
            marginTop: "12px",
            borderRadius: "12px",
            border: "1px solid #1e2d3d",
            background: "#0d1520",
            padding: "16px 18px"
          }}>
            <button
              type="button"
              style={{
                borderRadius: "8px",
                border: "1px solid #1e2d3d",
                background: "#111827",
                padding: "6px 12px",
                fontSize: "12px",
                fontWeight: 500,
                color: "#22c55e",
                cursor: "pointer",
                outline: "none"
              }}
              onClick={() => void handleUseCurrentLocation()}
              disabled={!isSupported}
            >
              📍 USE CURRENT LOCATION
            </button>
            <div style={{
              marginTop: "8px",
              fontSize: "13px",
              color: "#6b7280"
            }}>
              {locationLabel}
            </div>
            {geoError ? (
              <div style={{ marginTop: "4px", fontSize: "11px", color: "#ef4444" }}>{geoError}</div>
            ) : null}
          </div>

          <div style={{
            marginTop: "24px",
            fontSize: "11px",
            fontWeight: 600,
            color: "#4a5568",
            letterSpacing: "0.1em"
          }}>
            DESCRIPTION (OPTIONAL)
          </div>
          <textarea
            style={{
              marginTop: "12px",
              width: "100%",
              resize: "none",
              borderRadius: "10px",
              border: "1px solid #1e2d3d",
              background: "#0d1520",
              padding: "14px 16px",
              fontSize: "15px",
              color: "#ffffff",
              outline: "none"
            }}
            rows={4}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Add context that helps others avoid danger…"
          />

          <div style={{
            marginTop: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderRadius: "12px",
            border: "1px solid #1e2d3d",
            background: "#0d1520",
            padding: "16px 20px"
          }}>
            <div style={{ fontSize: "15px", color: "#ffffff", fontWeight: 400 }}>Anonymous Report</div>
            <button
              type="button"
              role="switch"
              aria-checked={anon}
              onClick={() => setAnon(!anon)}
              style={{
                width: "44px",
                height: "24px",
                borderRadius: "12px",
                background: anon ? "#22c55e" : "#1f2937",
                position: "relative",
                cursor: "pointer",
                outline: "none",
                padding: "2px"
              }}
            >
              <span
                style={{
                  display: "block",
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  background: "#ffffff",
                  transform: anon ? "translateX(20px)" : "translateX(0)",
                  transition: "transform 150ms"
                }}
              />
            </button>
          </div>

          <button
            type="button"
            style={{
              width: "100%",
              height: "52px",
              background: "#22c55e",
              color: "#0a0f1a",
              fontSize: "15px",
              fontWeight: 700,
              letterSpacing: "0.06em",
              borderRadius: "12px",
              border: "none",
              marginTop: "24px",
              cursor: "pointer",
              transition: "background-color 150ms"
            }}
            onClick={() => submitMutation.mutate()}
            disabled={submitMutation.isPending}
            onMouseOver={(e) => e.currentTarget.style.background = "#16a34a"}
            onMouseOut={(e) => e.currentTarget.style.background = "#22c55e"}
          >
            {submitMutation.isPending ? "SUBMITTING…" : "SUBMIT REPORT →"}
          </button>
          {submitMutation.isError ? (
            <div style={{ marginTop: "12px", fontSize: "13px", color: "#ef4444" }}>
              {submitMutation.error instanceof Error
                ? submitMutation.error.message
                : "Failed to submit report."}
            </div>
          ) : null}
        </section>
      </div>
      <MobileNav />
    </main>
  );
}

