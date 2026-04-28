import React, { useMemo, useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import { fetchSafeRoute } from "../services/ai";
import { useGeolocation } from "../hooks/useGeolocation";
import { useJourneyStore } from "../store/journeyStore";
import { useJourneyPing } from "../hooks/useJourneyPing";
import { getDemoUser } from "../services/auth";
import type { Journey } from "../types/journey";
import type { Contact } from "../types/contact";
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
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [userName, setUserName] = useState<string>("Guardian User");

  useEffect(() => {
    api.get<Contact[]>("/contacts")
      .then((res) => {
        const data = res.data as any;
        const list = Array.isArray(data) ? data : data.contacts ?? data.data ?? [];
        setContacts(list);
      })
      .catch(() => {});

    const user = getDemoUser();
    if (user?.name) {
      setUserName(user.name);
    }
  }, []);

  const journeyQuery = useQuery({
    queryKey: ["journey", "active"],
    queryFn: fetchActiveJourney,
  });

  useEffect(() => {
    if (journeyQuery.data) {
      setActiveJourney(journeyQuery.data);
    }
  }, [journeyQuery.data, setActiveJourney]);

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
  });

  useEffect(() => {
    if (completeJourneyMutation.isSuccess) {
      setActiveJourney(null);
      queryClient.invalidateQueries({ queryKey: ["journey", "active"] });
    }
  }, [completeJourneyMutation.isSuccess, queryClient, setActiveJourney]);

  const generateJourneyShareMessage = (
    journeyId: string,
    userName: string,
    destination: string,
    eta: string
  ) => {
    const trackingUrl = `${window.location.origin}/track/${journeyId}`;
    return encodeURIComponent(
      `📍 *GUARDIAN Live Journey Alert*\n\n` +
      `*${userName}* has started a journey and is sharing live location with you.\n\n` +
      `🗺 *Destination:* ${destination}\n` +
      `🕐 *Expected arrival:* ${eta}\n\n` +
      `🔴 *Track live location here:*\n${trackingUrl}\n\n` +
      `Open the link above to see their real-time position on a map.\n` +
      `If they don't arrive by ${eta}, please check on them immediately.\n\n` +
      `— GUARDIAN Safety App`
    );
  };

  const shareJourneyOnWhatsApp = (contact: Contact) => {
    if (!activeJourney) return;
    const eta = new Date(Date.now() + 30 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const message = generateJourneyShareMessage(
      activeJourney.id,
      userName,
      destination || "Unknown",
      eta
    );
    const phone = contact.phone.replace(/[^0-9+]/g, "");
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  const shareJourneyWithAllContacts = () => {
    if (contacts.length === 0) {
      alert("No contacts to share with. Add contacts first.");
      return;
    }
    contacts.forEach((contact, index) => {
      setTimeout(() => shareJourneyOnWhatsApp(contact), index * 1200);
    });
    alert(`📲 Sharing journey with ${contacts.length} contact(s) on WhatsApp`);
  };

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

            <div style={{ marginTop: "12px" }}>
              <div style={{
                fontSize: "10px", color: "#4B5563", letterSpacing: "1.5px",
                marginBottom: "8px", fontWeight: 600,
              }}>
                SHARE LIVE LOCATION
              </div>

              {contacts.map((contact) => (
                <div key={contact.id} style={{
                  display: "flex", alignItems: "center",
                  justifyContent: "space-between",
                  background: "#1A2235",
                  border: "1px solid rgba(148,163,184,0.08)",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  marginBottom: "6px",
                }}>
                  <div>
                    <div style={{ fontSize: "13px", color: "#E2E8F0", fontWeight: 500 }}>
                      {contact.name}
                    </div>
                    <div style={{ fontSize: "11px", color: "#4B5563" }}>{contact.relation}</div>
                  </div>
                  <button
                    onClick={() => shareJourneyOnWhatsApp(contact)}
                    style={{
                      background: "#25D366", color: "white",
                      border: "none", borderRadius: "6px",
                      padding: "6px 12px", fontSize: "12px",
                      fontWeight: 600, cursor: "pointer",
                    }}
                  >
                    WhatsApp 📍
                  </button>
                </div>
              ))}

              <button
                onClick={shareJourneyWithAllContacts}
                style={{
                  width: "100%", padding: "11px",
                  background: "#25D366", color: "white",
                  border: "none", borderRadius: "8px",
                  fontSize: "13px", fontWeight: 700,
                  cursor: "pointer", marginTop: "4px",
                }}
              >
                📲 Share Location with All Contacts
              </button>
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

