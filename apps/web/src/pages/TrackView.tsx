import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import type { Journey } from "../types/journey";

async function fetchTrackedJourney(token: string): Promise<Journey> {
  const response = await api.get<Journey>(`/journey/track/${token}`);
  return response.data;
}

export default function TrackView(): React.ReactElement {
  const params = useParams<{ token: string }>();
  const token = params.token ?? "";

  const journeyQuery = useQuery({
    queryKey: ["journey", "track", token],
    queryFn: () => fetchTrackedJourney(token),
    enabled: token.length > 0,
    refetchInterval: 5_000,
  });

  const lastWaypoint = journeyQuery.data?.waypoints?.[0];

  return (
    <main className="min-h-screen bg-guardian-bg-base text-guardian-text-primary">
      <div className="mx-auto max-w-2xl px-6 py-10">
        <div className="text-xs font-mono tracking-widest text-guardian-text-secondary">
          PUBLIC TRACKING
        </div>

        <section className="mt-4 rounded-xl border border-guardian-border-subtle bg-guardian-bg-surface p-5">
          {journeyQuery.isLoading ? (
            <div className="text-sm text-guardian-text-secondary">Loading live journey…</div>
          ) : null}
          {journeyQuery.isError ? (
            <div className="text-sm text-guardian-signal-danger">
              {journeyQuery.error instanceof Error
                ? journeyQuery.error.message
                : "Unable to load journey."}
            </div>
          ) : null}
          {journeyQuery.data ? (
            <div className="space-y-4">
              <div>
                <div className="text-sm font-semibold">
                  Status: {journeyQuery.data.status}
                </div>
                <div className="mt-1 text-xs font-mono text-guardian-text-secondary">
                  Started: {new Date(journeyQuery.data.startedAt).toLocaleString()}
                </div>
              </div>
              <div className="rounded-md border border-guardian-border-subtle bg-guardian-bg-base p-3">
                <div className="text-[11px] font-mono text-guardian-text-secondary">
                  LAST KNOWN LOCATION
                </div>
                <div className="mt-2 text-sm">
                  {lastWaypoint
                    ? `${lastWaypoint.latitude.toFixed(5)}, ${lastWaypoint.longitude.toFixed(5)}`
                    : `${journeyQuery.data.startLat.toFixed(5)}, ${journeyQuery.data.startLng.toFixed(5)}`}
                </div>
              </div>
              <div className="rounded-md border border-guardian-border-subtle bg-guardian-bg-base p-3">
                <div className="text-[11px] font-mono text-guardian-text-secondary">
                  LAST UPDATED
                </div>
                <div className="mt-2 text-sm">
                  {lastWaypoint
                    ? new Date(lastWaypoint.timestamp).toLocaleString()
                    : new Date(journeyQuery.data.startedAt).toLocaleString()}
                </div>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}

