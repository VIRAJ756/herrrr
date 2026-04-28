import React from "react";
import type { ZoneAlertViewModel } from "../../hooks/useZoneAlerts";

export function AlertBanner(props: {
  alert: ZoneAlertViewModel | null;
  onDismiss: () => void;
}): React.ReactElement | null {
  if (!props.alert) return null;

  return (
    <div
      className="animate-[alert-slide_240ms_ease-out] w-full rounded-xl border border-red-400/50 bg-red-900/90 p-4 shadow-[var(--g-glow-danger)] backdrop-blur"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-white">
            WARNING: You are entering a high-risk area
          </div>
          <div className="mt-1 text-sm text-red-100">
            Risk score: {(props.alert.riskScore * 100).toFixed(0)}%
            {props.alert.distanceMeters !== null ? ` · ${props.alert.distanceMeters}m away` : ""}
          </div>
          <div className="mt-1 text-xs font-mono text-red-200">
            {props.alert.zoneData.incidentCount} incidents in this cluster
          </div>
        </div>
        <button
          type="button"
          onClick={props.onDismiss}
          className="rounded-md border border-red-200/50 bg-red-950/60 px-2 py-1 text-xs font-mono text-red-50 focus:outline-none focus:ring-2 focus:ring-red-300/60"
        >
          CLOSE
        </button>
      </div>
    </div>
  );
}

