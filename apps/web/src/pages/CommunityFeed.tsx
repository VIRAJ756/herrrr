import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import type { Incident, IncidentType } from "../types/incident";
import { MobileNav } from "../components/layout/MobileNav";
import { DemoBanner } from "../components/layout/DemoBanner";

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
    <main className="min-h-screen bg-guardian-bg-base pb-16 text-guardian-text-primary">
      <DemoBanner />
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="text-xs font-mono tracking-widest text-guardian-text-secondary">
          COMMUNITY / INTEL FEED
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={[
                "rounded-full border px-3 py-2 text-xs font-mono",
                filter === item.id
                  ? "border-guardian-border-accent bg-guardian-bg-elevated text-guardian-text-primary"
                  : "border-guardian-border-subtle bg-guardian-bg-surface text-guardian-text-secondary",
              ].join(" ")}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-3">
          {incidentsQuery.isLoading ? (
            <div className="rounded-xl border border-guardian-border-subtle bg-guardian-bg-surface p-4 text-sm text-guardian-text-secondary">
              Loading incidents…
            </div>
          ) : null}

          {incidentsQuery.isError ? (
            <div className="rounded-xl border border-guardian-border-subtle bg-guardian-bg-surface p-4 text-sm text-guardian-signal-danger">
              {incidentsQuery.error instanceof Error
                ? incidentsQuery.error.message
                : "Failed to load incidents."}
            </div>
          ) : null}

          {filteredIncidents.map((incident) => (
            <article
              key={incident.id}
              className="rounded-xl border border-guardian-border-subtle bg-guardian-bg-surface p-4"
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">⚡ {incident.type}</div>
                <span className="rounded-full border border-guardian-border-default bg-guardian-bg-elevated px-2 py-1 text-[11px] font-mono text-guardian-text-secondary">
                  {severityTone(incident.severity)}
                </span>
              </div>
              <div className="mt-1 text-xs text-guardian-text-secondary">
                {incident.latitude.toFixed(3)}, {incident.longitude.toFixed(3)} ·{" "}
                {relativeTime(incident.createdAt)}
              </div>
              <div className="mt-2 text-sm text-guardian-text-secondary">
                {incident.description?.trim() || "No additional description provided."}
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  className="rounded-md border border-guardian-border-default bg-guardian-bg-elevated px-3 py-2 text-xs font-mono text-guardian-text-primary focus:outline-none focus:ring-2 focus:ring-guardian-border-accent"
                >
                  ▲ VERIFY
                </button>
                <button
                  type="button"
                  className="rounded-md border border-guardian-border-default bg-guardian-bg-elevated px-3 py-2 text-xs font-mono text-guardian-text-primary focus:outline-none focus:ring-2 focus:ring-guardian-border-accent"
                >
                  ▼ FLAG
                </button>
                <button
                  type="button"
                  className="rounded-md border border-guardian-border-default bg-guardian-bg-elevated px-3 py-2 text-xs font-mono text-guardian-text-primary focus:outline-none focus:ring-2 focus:ring-guardian-border-accent"
                >
                  SEVERITY {incident.severity}/5
                </button>
              </div>
            </article>
          ))}
          {!incidentsQuery.isLoading && filteredIncidents.length === 0 ? (
            <div className="rounded-xl border border-guardian-border-subtle bg-guardian-bg-surface p-4 text-sm text-guardian-text-secondary">
              No incidents match this filter yet.
            </div>
          ) : null}
        </div>
      </div>
      <MobileNav />
    </main>
  );
}

