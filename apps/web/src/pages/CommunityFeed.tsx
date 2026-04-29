import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import type { Incident, IncidentType } from "../types/incident";
import { MobileNav } from "../components/layout/MobileNav";
import { DemoBanner } from "../components/layout/DemoBanner";

const ReactionBar = ({ incidentId, initialUpvotes = 0, initialDownvotes = 0 }: {
  incidentId: string;
  initialUpvotes: number;
  initialDownvotes: number;
}) => {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null);
  const [isVerified, setIsVerified] = useState(initialUpvotes >= 3);
  const [animating, setAnimating] = useState<"up" | "down" | null>(null);

  const vote = async (type: "up" | "down") => {
    if (userVote === type) return;

    if (type === "up") {
      setUpvotes(prev => prev + 1);
      if (userVote === "down") setDownvotes(prev => prev - 1);
    } else {
      setDownvotes(prev => prev + 1);
      if (userVote === "up") setUpvotes(prev => prev - 1);
    }
    setUserVote(type);
    setAnimating(type);
    setTimeout(() => setAnimating(null), 400);

    const newUpvotes = type === "up" ? upvotes + 1 : upvotes - (userVote === "up" ? 1 : 0);
    setIsVerified(newUpvotes >= 3);

    try {
      await fetch(`/api/incidents/${incidentId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ vote: type }),
      });
    } catch {
    }
  };

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "8px",
      marginTop: "10px",
      paddingTop: "10px",
      borderTop: "1px solid rgba(148,163,184,0.08)",
    }}>
      {isVerified && (
        <div style={{
          fontSize: "10px",
          fontWeight: 600,
          color: "#00E5A0",
          background: "rgba(0,229,160,0.08)",
          border: "1px solid rgba(0,229,160,0.2)",
          borderRadius: "4px",
          padding: "2px 7px",
          letterSpacing: "0.5px",
          marginRight: "4px",
        }}>
          ✓ VERIFIED
        </div>
      )}
      {!isVerified && (
        <div style={{
          fontSize: "10px",
          color: "#4B5563",
          background: "rgba(75,85,99,0.1)",
          border: "1px solid rgba(75,85,99,0.2)",
          borderRadius: "4px",
          padding: "2px 7px",
          letterSpacing: "0.5px",
          marginRight: "4px",
        }}>
          UNVERIFIED
        </div>
      )}

      <button
        onClick={() => vote("up")}
        style={{
          display: "flex", alignItems: "center", gap: "5px",
          background: userVote === "up" ? "rgba(0,229,160,0.1)" : "rgba(148,163,184,0.05)",
          border: `1px solid ${userVote === "up" ? "rgba(0,229,160,0.3)" : "rgba(148,163,184,0.1)"}`,
          borderRadius: "6px",
          padding: "4px 10px",
          cursor: "pointer",
          color: userVote === "up" ? "#00E5A0" : "#94A3B8",
          fontSize: "12px",
          fontWeight: 500,
          transform: animating === "up" ? "scale(1.15)" : "scale(1)",
          transition: "all 0.2s ease",
        }}
      >
        <span>▲</span>
        <span>{upvotes}</span>
      </button>

      <button
        onClick={() => vote("down")}
        style={{
          display: "flex", alignItems: "center", gap: "5px",
          background: userVote === "down" ? "rgba(255,59,92,0.1)" : "rgba(148,163,184,0.05)",
          border: `1px solid ${userVote === "down" ? "rgba(255,59,92,0.3)" : "rgba(148,163,184,0.1)"}`,
          borderRadius: "6px",
          padding: "4px 10px",
          cursor: "pointer",
          color: userVote === "down" ? "#FF3B5C" : "#94A3B8",
          fontSize: "12px",
          fontWeight: 500,
          transform: animating === "down" ? "scale(1.15)" : "scale(1)",
          transition: "all 0.2s ease",
        }}
      >
        <span>▼</span>
        <span>{downvotes}</span>
      </button>

      <div style={{ marginLeft: "auto", fontSize: "11px", color: "#4B5563" }}>
        {upvotes + downvotes} responses
      </div>
    </div>
  );
};

type FilterKey = "ALL" | "HIGH_SEVERITY" | "LAST_24H" | IncidentType;

const FILTERS: { id: FilterKey; label: string }[] = [
  { id: "ALL", label: "All" },
  { id: "HIGH_SEVERITY", label: "High Severity" },
  { id: "LAST_24H", label: "Last 24h" },
  { id: "HARASSMENT", label: "Harassment" },
  { id: "POOR_LIGHTING", label: "Poor Lighting" },
  { id: "SUSPICIOUS_ACTIVITY", label: "Suspicious" },
];

async function fetchIncidents(): Promise<Incident[]> {
  const response = await api.get<Incident[]>("/incidents");
  return response.data;
}

function relativeTime(dateString: string): string {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60_000));
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} h ago`;
  return `${Math.floor(diffHours / 24)} d ago`;
}

function severityTone(severity: number): string {
  if (severity >= 5) return "CRITICAL";
  if (severity >= 4) return "HIGH";
  if (severity >= 3) return "MEDIUM";
  return "LOW";
}

export default function CommunityFeed(): React.ReactElement {
  const [filter, setFilter] = useState<FilterKey>("ALL");
  const incidentsQuery = useQuery({
    queryKey: ["incidents"],
    queryFn: fetchIncidents,
    refetchInterval: 15_000,
  });

  const filteredIncidents = useMemo(() => {
    const incidents = incidentsQuery.data ?? [];
    if (filter === "ALL") return incidents;
    if (filter === "HIGH_SEVERITY") return incidents.filter((incident) => incident.severity >= 4);
    if (filter === "LAST_24H") {
      const cutoff = Date.now() - 24 * 60 * 60 * 1000;
      return incidents.filter((incident) => new Date(incident.createdAt).getTime() >= cutoff);
    }
    return incidents.filter((incident) => incident.type === filter);
  }, [filter, incidentsQuery.data]);

  return (
    <main style={{
      background: "#0a0f1a",
      padding: "24px",
      minHeight: "100vh",
      fontFamily: "Inter, -apple-system, sans-serif"
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
      <DemoBanner />
      <div className="mx-auto max-w-4xl">
        <div style={{
          fontSize: "13px",
          fontWeight: 600,
          letterSpacing: "0.1em",
          color: "#4a5568",
          marginBottom: "20px"
        }}>
          COMMUNITY / INTEL FEED
        </div>

        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          marginBottom: "16px"
        }}>
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              style={{
                borderRadius: "20px",
                padding: "8px 16px",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 150ms ease",
                background: filter === item.id ? "#22c55e" : "#111827",
                color: filter === item.id ? "#0a0f1a" : "#6b7280",
                border: filter === item.id ? "none" : "1px solid #1e2d3d"
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {incidentsQuery.isLoading ? (
            <div style={{
              borderRadius: "16px",
              border: "1px solid #1e2d3d",
              background: "#111827",
              padding: "16px 20px",
              fontSize: "14px",
              color: "#cbd5e1"
            }}>
              Loading incidents…
            </div>
          ) : null}

          {incidentsQuery.isError ? (
            <div style={{
              borderRadius: "16px",
              border: "1px solid #1e2d3d",
              background: "#111827",
              padding: "16px 20px",
              fontSize: "14px",
              color: "#ef4444"
            }}>
              {incidentsQuery.error instanceof Error
                ? incidentsQuery.error.message
                : "Failed to load incidents."}
            </div>
          ) : null}

          {filteredIncidents.map((incident) => {
            const upvotes = (incident as any).upvotes || 0;
            const downvotes = (incident as any).downvotes || 0;
            const isVerified = upvotes >= 3;
            const isHighSeverity = incident.severity >= 4;

            let borderStyle = {};
            let bgStyle = {};

            if (isVerified) {
              borderStyle = { borderLeft: "2px solid rgba(34,197,94,0.4)" };
              bgStyle = { background: "rgba(34,197,94,0.02)" };
            } else if (isHighSeverity) {
              borderStyle = { borderLeft: "2px solid rgba(255,59,92,0.3)" };
              bgStyle = { background: "#0d1520" };
            } else {
              borderStyle = { borderLeft: "2px solid rgba(148,163,184,0.1)" };
              bgStyle = { background: "#0d1520" };
            }

            return (
              <article
                key={incident.id}
                style={{
                  borderRadius: "16px",
                  border: "1px solid #1e2d3d",
                  padding: "16px 20px",
                  ...borderStyle,
                  ...bgStyle
                }}
              >
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#ffffff" }}>⚡ {incident.type}</div>
                  <span style={{
                    borderRadius: "20px",
                    border: "1px solid #1e2d3d",
                    background: "#111827",
                    padding: "4px 8px",
                    fontSize: "11px",
                    fontWeight: 500,
                    color: "#cbd5e1"
                  }}>
                    {severityTone(incident.severity)}
                  </span>
                </div>
                <div style={{
                  fontSize: "12px",
                  color: "#6b7280",
                  marginTop: "4px"
                }}>
                  {incident.latitude.toFixed(3)}, {incident.longitude.toFixed(3)} ·{" "}
                  {relativeTime(incident.createdAt)}
                </div>
                <div style={{
                  fontSize: "14px",
                  color: "#cbd5e1",
                  marginTop: "8px"
                }}>
                  {incident.description?.trim() || "No additional description provided."}
                </div>
                <ReactionBar
                  incidentId={incident.id}
                  initialUpvotes={upvotes}
                  initialDownvotes={downvotes}
                />
              </article>
            );
          })}
          {!incidentsQuery.isLoading && filteredIncidents.length === 0 ? (
            <div style={{
              borderRadius: "16px",
              border: "1px solid #1e2d3d",
              background: "#111827",
              padding: "16px 20px",
              fontSize: "14px",
              color: "#cbd5e1"
            }}>
              No incidents match this filter yet.
            </div>
          ) : null}
        </div>
      </div>
      <MobileNav />
    </main>
  );
}

