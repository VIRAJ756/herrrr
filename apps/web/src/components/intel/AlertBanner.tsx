import React from "react";
import type { ZoneAlertViewModel } from "../../hooks/useZoneAlerts";

export function AlertBanner(props: {
  alert: ZoneAlertViewModel | null;
  onDismiss: () => void;
}): React.ReactElement | null {
  if (!props.alert) return null;

  return (
    <div
      className="animate-[alert-slide_240ms_ease-out] rounded-xl border border-guardian-signal-danger/40 bg-guardian-bg-surface/95 p-4 shadow-[var(--g-glow-danger)] backdrop-blur"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-guardian-text-primary">
            ⚠️ High-risk area nearby
          </div>
          <div className="mt-1 text-sm text-guardian-text-secondary">
            Risk score: {(props.alert.riskScore * 100).toFixed(0)}%
            {props.alert.distanceMeters !== null ? ` · ${props.alert.distanceMeters}m away` : ""}
          </div>
          <div className="mt-1 text-xs font-mono text-guardian-text-secondary">
            {props.alert.zoneData.incidentCount} incidents in this cluster
          </div>
        </div>
        <button
          type="button"
          onClick={props.onDismiss}
          className="rounded-md border border-guardian-border-default bg-guardian-bg-elevated px-2 py-1 text-xs font-mono text-guardian-text-primary focus:outline-none focus:ring-2 focus:ring-guardian-border-accent"
        >
          CLOSE
        </button>
      </div>
    </div>
  );
}

