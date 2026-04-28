import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import { fetchSafeRoute } from "../services/ai";
import { useGeolocation } from "../hooks/useGeolocation";
import { useJourneyStore } from "../store/journeyStore";
import { useJourneyPing } from "../hooks/useJourneyPing";
import type { Journey } from "../types/journey";
import { MobileNav } from "../components/layout/MobileNav";
import { DemoBanner } from "../components/layout/DemoBanner";

async function fetchActiveJourney(): Promise<Journey | null> {
  const response = await api.get<Journey | null>("/journey/active");
  return response.data;
}

export default function JourneyShare(): React.ReactElement {
  const queryClient = useQueryClient();
  const { point, requestOnce } = useGeolocation();
  const { activeJourney, setActiveJourney } = useJourneyStore();
  const [destination, setDestination] = useState("");
  const [destinationLat, setDestinationLat] = useState("12.9352");
  const [destinationLng, setDestinationLng] = useState("77.6245");

  useQuery({
    queryKey: ["journey", "active"],
    queryFn: fetchActiveJourney,
    onSuccess: (journey) => {
      setActiveJourney(journey);
    },
  });

  useJourneyPing(Boolean(activeJourney));

  const nearbyRiskLabel = useMemo(() => {
    if (!activeJourney) return "No active tracking";
    return "Live zone alerts enabled";
  }, [activeJourney]);

  const startJourneyMutation = useMutation({
    mutationFn: async () => {
      const currentPoint = point ?? (await requestOnce());
      const response = await api.post<Journey>("/journey/start", {
        startLat: currentPoint.lat,
        startLng: currentPoint.lng,
        destination: destination.trim() || undefined,
      });
      return response.data;
    },
    onSuccess: async (journey) => {
      setActiveJourney(journey);
      await queryClient.invalidateQueries({ queryKey: ["journey", "active"] });
    },
  });

  const completeJourneyMutation = useMutation({
    mutationFn: async () => {
      if (!activeJourney) throw new Error("No active journey.");
      const response = await api.post<Journey>("/journey/complete", {
        journeyId: activeJourney.id,
      });
      return response.data;
    },
    onSuccess: async () => {
      setActiveJourney(null);
      await queryClient.invalidateQueries({ queryKey: ["journey", "active"] });
    },
  });

  const safeRouteQuery = useQuery({
    queryKey: ["ai", "safe-route", point?.lat, point?.lng, destinationLat, destinationLng],
    queryFn: async () => {
      const currentPoint = point ?? (await requestOnce());
      return fetchSafeRoute({
        originLat: currentPoint.lat,
        originLng: currentPoint.lng,
        destLat: Number(destinationLat),
        destLng: Number(destinationLng),
      });
    },
    enabled: !activeJourney && destinationLat.length > 0 && destinationLng.length > 0,
  });

  return (
    <main className="min-h-screen bg-guardian-bg-base pb-16 text-guardian-text-primary">
      <DemoBanner />
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="text-xs font-mono tracking-widest text-guardian-text-secondary">
          JOURNEY / TRACKING
        </div>

        {!activeJourney ? (
          <section className="mt-4 rounded-xl border border-guardian-border-subtle bg-guardian-bg-surface p-5">
            <div className="text-sm font-semibold">Start Journey</div>
            <input
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
              placeholder="Destination (optional)"
              className="mt-4 w-full rounded-md border border-guardian-border-subtle bg-guardian-bg-base p-3 text-sm text-guardian-text-primary outline-none focus:ring-2 focus:ring-guardian-border-accent"
            />
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <input
                value={destinationLat}
                onChange={(event) => setDestinationLat(event.target.value)}
                placeholder="Destination lat"
                className="rounded-md border border-guardian-border-subtle bg-guardian-bg-base p-3 text-sm text-guardian-text-primary outline-none focus:ring-2 focus:ring-guardian-border-accent"
              />
              <input
                value={destinationLng}
                onChange={(event) => setDestinationLng(event.target.value)}
                placeholder="Destination lng"
                className="rounded-md border border-guardian-border-subtle bg-guardian-bg-base p-3 text-sm text-guardian-text-primary outline-none focus:ring-2 focus:ring-guardian-border-accent"
              />
            </div>
            {safeRouteQuery.data ? (
              <div className="mt-4 rounded-md border border-guardian-border-subtle bg-guardian-bg-base p-3">
                <div className="text-[11px] font-mono text-guardian-text-secondary">
                  SAFE ROUTE ESTIMATE
                </div>
                <div className="mt-2 text-sm">
                  ETA: {safeRouteQuery.data.estimatedTime} min · Risk segments:{" "}
                  {safeRouteQuery.data.riskSegments.length}
                </div>
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => startJourneyMutation.mutate()}
              disabled={startJourneyMutation.isPending}
              className="mt-4 rounded-md bg-guardian-signal-safe px-4 py-3 text-sm font-semibold text-guardian-text-inverse disabled:opacity-60"
            >
              {startJourneyMutation.isPending ? "STARTING…" : "START JOURNEY"}
            </button>
            {startJourneyMutation.isError ? (
              <div className="mt-3 text-sm text-guardian-signal-danger">
                {startJourneyMutation.error instanceof Error
                  ? startJourneyMutation.error.message
                  : "Failed to start journey."}
              </div>
            ) : null}
          </section>
        ) : (
          <section className="mt-4 rounded-xl border border-guardian-border-subtle bg-guardian-bg-surface p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Journey Active</div>
                <div className="mt-1 text-xs font-mono text-guardian-text-secondary">
                  Started: {new Date(activeJourney.startedAt).toLocaleString()}
                </div>
              </div>
              <div className="text-xs font-mono text-guardian-signal-safe">
                ● TRACKING LIVE
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-md border border-guardian-border-subtle bg-guardian-bg-base p-3">
                <div className="text-[11px] font-mono text-guardian-text-secondary">
                  CURRENT RISK
                </div>
                <div className="mt-2 text-sm">{nearbyRiskLabel}</div>
              </div>
              <div className="rounded-md border border-guardian-border-subtle bg-guardian-bg-base p-3">
                <div className="text-[11px] font-mono text-guardian-text-secondary">
                  TRACKING LINK
                </div>
                <div className="mt-2 break-all text-sm text-guardian-text-primary">
                  {window.location.origin}/track/{activeJourney.shareToken}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => completeJourneyMutation.mutate()}
              disabled={completeJourneyMutation.isPending}
              className="mt-5 rounded-md border border-guardian-border-accent bg-guardian-bg-elevated px-4 py-3 text-sm font-semibold text-guardian-text-primary disabled:opacity-60"
            >
              {completeJourneyMutation.isPending ? "COMPLETING…" : "COMPLETE JOURNEY"}
            </button>
          </section>
        )}
      </div>
      <MobileNav />
    </main>
  );
}

