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
      className={[
        "rounded-full border px-3 py-2 text-xs font-mono",
        props.active
          ? "border-guardian-border-accent bg-guardian-bg-elevated text-guardian-text-primary shadow-[var(--g-glow-safe)]"
          : "border-guardian-border-subtle bg-guardian-bg-surface text-guardian-text-secondary hover:bg-guardian-bg-elevated"
      ].join(" ")}
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
    <main className="min-h-screen bg-guardian-bg-base pb-16 text-guardian-text-primary">
      <DemoBanner />
      <div className="mx-auto max-w-xl px-6 py-10">
        <div className="text-xs font-mono tracking-widest text-guardian-text-secondary">
          NEW FIELD REPORT
        </div>

        <section className="mt-4 rounded-xl border border-guardian-border-subtle bg-guardian-bg-surface p-5">
          <div className="text-[11px] font-mono tracking-widest text-guardian-text-secondary">
            INCIDENT TYPE
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {TYPES.map((t) => (
              <Pill key={t.type} active={t.type === type} onClick={() => setType(t.type)}>
                {t.label}
              </Pill>
            ))}
          </div>

          <div className="mt-6 text-[11px] font-mono tracking-widest text-guardian-text-secondary">
            SEVERITY <span className="ml-2 text-guardian-text-primary">{severityLabel}</span>
          </div>
          <input
            className="mt-3 w-full accent-[var(--g-signal-safe)]"
            type="range"
            min={1}
            max={5}
            value={severity}
            onChange={(e) => setSeverity(Number(e.target.value))}
            aria-label="Severity"
          />

          <div className="mt-6 text-[11px] font-mono tracking-widest text-guardian-text-secondary">
            LOCATION
          </div>
          <div className="mt-3 rounded-md border border-guardian-border-subtle bg-guardian-bg-elevated/30 p-3">
            <button
              type="button"
              className="rounded-md border border-guardian-border-default bg-guardian-bg-surface px-3 py-2 text-xs font-mono text-guardian-signal-safe focus:outline-none focus:ring-2 focus:ring-guardian-border-accent disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => void handleUseCurrentLocation()}
              disabled={!isSupported}
            >
              📍 USE CURRENT LOCATION
            </button>
            <div className="mt-2 text-sm text-guardian-text-secondary">
              {locationLabel}
            </div>
            {geoError ? (
              <div className="mt-1 text-xs text-guardian-signal-danger">{geoError}</div>
            ) : null}
          </div>

          <div className="mt-6 text-[11px] font-mono tracking-widest text-guardian-text-secondary">
            DESCRIPTION (OPTIONAL)
          </div>
          <textarea
            className="mt-3 w-full resize-none rounded-md border border-guardian-border-subtle bg-guardian-bg-base p-3 text-sm text-guardian-text-primary outline-none focus:ring-2 focus:ring-guardian-border-accent"
            rows={4}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Add context that helps others avoid danger…"
          />

          <div className="mt-6 flex items-center justify-between rounded-md border border-guardian-border-subtle bg-guardian-bg-elevated/30 px-3 py-3">
            <div className="text-sm">Anonymous Report</div>
            <button
              type="button"
              role="switch"
              aria-checked={anon}
              onClick={() => setAnon(!anon)}
              className="h-5 w-10 rounded-full border border-guardian-border-default bg-guardian-bg-surface p-[2px] focus:outline-none focus:ring-2 focus:ring-guardian-border-accent"
            >
              <span
                className={[
                  "block h-4 w-4 rounded-full transition-transform",
                  anon ? "translate-x-5 bg-guardian-signal-safe" : "translate-x-0 bg-guardian-text-muted"
                ].join(" ")}
              />
            </button>
          </div>

          <button
            type="button"
            className="mt-6 w-full rounded-md bg-guardian-signal-safe px-4 py-3 text-sm font-semibold text-guardian-text-inverse shadow-[var(--g-glow-safe)] focus:outline-none focus:ring-2 focus:ring-guardian-signal-safe/60 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => submitMutation.mutate()}
            disabled={submitMutation.isPending}
          >
            {submitMutation.isPending ? "SUBMITTING…" : "SUBMIT REPORT →"}
          </button>
          {submitMutation.isError ? (
            <div className="mt-3 text-sm text-guardian-signal-danger">
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

