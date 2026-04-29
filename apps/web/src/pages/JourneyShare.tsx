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
  const [userName, setUserName] = useState<string>("Guaadisner");

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
      `📍 *STREE ASTRA Live Journey Alert*\n\n` +
      `*${userName}* has started a journey and is sharing live location with you.\n\n` +
      `🗺 *Destination:* ${destination}\n` +
      `🕐 *Expected arrival:* ${eta}\n\n` +
      `🔴 *Track live location here:*\n${trackingUrl}\n\n` +
      `Open the link above to see their real-time position on a map.\n` +
      `If they don't arrive by ${eta}, please check on them immediately.\n\n` +
      `— STREE ASTRA Safety App`
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
    <main style={{
      background: "#0d1117",
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
      <div className="mx-auto max-w-3xl">
        <div style={{
          fontSize: "13px",
          fontWeight: 500,
          letterSpacing: "0.1em",
          marginBottom: "20px"
        }}>
          <span style={{ color: "#4a5568" }}>JOURNEY</span>
          <span style={{ color: "#4a5568", margin: "0 8px" }}>/</span>
          <span style={{ color: "#ffffff", fontWeight: 800 }}>TRACKING</span>
        </div>

        {!activeJourney ? (
          <section style={{
            background: "#161f2e",
            border: "1px solid #1e2d3d",
            borderRadius: "16px",
            padding: "24px",
            width: "100%"
          }}>
            <div style={{ fontSize: "24px", fontWeight: 800, color: "#ffffff", marginBottom: "4px" }}>Start Journey</div>
            <input
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
              placeholder="Destination (optional)"
              className="mt-4 w-full p-3 text-sm outline-none"
              style={{
                borderRadius: "8px",
                border: "1px solid #1e2d3d",
                background: "#0d1520",
                color: "#cbd5e1"
              }}
            />
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <input
                value={destinationLat}
                onChange={(event) => setDestinationLat(event.target.value)}
                placeholder="Destination lat"
                className="p-3 text-sm outline-none"
                style={{
                  borderRadius: "8px",
                  border: "1px solid #1e2d3d",
                  background: "#0d1520",
                  color: "#cbd5e1"
                }}
              />
              <input
                value={destinationLng}
                onChange={(event) => setDestinationLng(event.target.value)}
                placeholder="Destination lng"
                className="p-3 text-sm outline-none"
                style={{
                  borderRadius: "8px",
                  border: "1px solid #1e2d3d",
                  background: "#0d1520",
                  color: "#cbd5e1"
                }}
              />
            </div>
            {safeRouteQuery.data ? (
              <div className="mt-4 p-3" style={{
                borderRadius: "12px",
                border: "1px solid #1e2d3d",
                background: "#0d1520"
              }}>
                <div style={{ fontSize: "11px", color: "#4a5568", letterSpacing: "0.1em", fontWeight: 600 }}>
                  SAFE ROUTE ESTIMATE
                </div>
                <div className="mt-2" style={{ fontSize: "13px", color: "#cbd5e1" }}>
                  ETA: {safeRouteQuery.data.estimatedTime} min · Risk segments: {" "}
                  {safeRouteQuery.data.riskSegments.length}
                </div>
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => startJourneyMutation.mutate()}
              disabled={startJourneyMutation.isPending}
              className="mt-4 px-4 py-3 text-sm font-semibold disabled:opacity-60"
              style={{
                borderRadius: "12px",
                background: "linear-gradient(135deg, #1a9e8f 0%, #22c55e 100%)",
                color: "#ffffff",
                border: "none",
                height: "54px",
                fontSize: "15px",
                fontWeight: 600
              }}
            >
              {startJourneyMutation.isPending ? "STARTING…" : "START JOURNEY"}
            </button>
            {startJourneyMutation.isError ? (
              <div className="mt-3 text-sm" style={{ color: "#ef4444" }}>
                {startJourneyMutation.error instanceof Error
                  ? startJourneyMutation.error.message
                  : "Failed to start journey."}
              </div>
            ) : null}
          </section>
        ) : (
          <section style={{
            background: "#161f2e",
            border: "1px solid #1e2d3d",
            borderRadius: "16px",
            padding: "24px 24px 28px",
            width: "100%",
            boxShadow: "0 4px 24px rgba(0,0,0,0.4)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
              <div>
                <div style={{ fontSize: "22px", fontWeight: 800, color: "#ffffff", marginBottom: "6px" }}>Journey Active</div>
                <div style={{ fontSize: "14px", color: "#6b7280", fontWeight: 400 }}>
                  Started: 29/04/2026, 02:40:35
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{
                  width: "9px",
                  height: "9px",
                  borderRadius: "50%",
                  background: "#22c55e",
                  animation: "sosPulse 2s infinite"
                }}></span>
                <span style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#22c55e",
                  letterSpacing: "0.08em"
                }}>
                  TRACKING LIVE
                </span>
              </div>
            </div>

            <style>{`
              @keyframes sosPulse {
                0%   { box-shadow: 0 0 0 0 rgba(34,197,94,0.6); }
                70%  { box-shadow: 0 0 0 6px rgba(34,197,94,0); }
                100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
              }
            `}</style>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px" }}>
              <div style={{
                borderRadius: "12px",
                border: "1px solid #1a2a3a",
                background: "#0d1520",
                padding: "16px 18px"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 600, color: "#4a5568", letterSpacing: "0.1em" }}>
                    CURRENT RISK
                  </div>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" style={{ color: "#2d3748" }}>
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
                <div style={{ fontSize: "15px", color: "#cbd5e1", fontWeight: 400, lineHeight: "1.5" }}>
                  {nearbyRiskLabel}
                </div>
              </div>
              <div style={{
                borderRadius: "12px",
                border: "1px solid #1a2a3a",
                background: "#0d1520",
                padding: "16px 18px"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 600, color: "#4a5568", letterSpacing: "0.1em" }}>
                    TRACKING LINK
                  </div>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" style={{ color: "#2d3748" }}>
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <div className="break-all" style={{
                  fontSize: "12px",
                  color: "#38bdf8",
                  fontWeight: 400,
                  lineHeight: "1.6",
                  cursor: "pointer"
                }}>
                  {window.location.origin}/track/{activeJourney.shareToken}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <div style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "#4a5568",
                letterSpacing: "0.1em",
                marginBottom: "12px"
              }}>
                SHARE LIVE LOCATION
              </div>

              {contacts.map((contact) => (
                <div key={contact.id} style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "#161f2e",
                  border: "1px solid #1e2d3d",
                  borderRadius: "12px",
                  padding: "16px 20px",
                  marginBottom: "12px"
                }}>
                  <div>
                    <div style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff" }}>
                      {contact.name}
                    </div>
                    <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "3px" }}>family 🖤</div>
                  </div>
                  <button
                    onClick={() => shareJourneyOnWhatsApp(contact)}
                    style={{
                      background: "#1a9e8f",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "10px",
                      padding: "10px 20px",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "150ms ease"
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = "#158a7c"}
                    onMouseOut={(e) => e.currentTarget.style.background = "#1a9e8f"}
                  >
                    WhatsApp 📍
                  </button>
                </div>
              ))}

              <button
                onClick={shareJourneyWithAllContacts}
                style={{
                  width: "100%",
                  height: "54px",
                  background: "linear-gradient(135deg, #1a9e8f, #22c55e)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "14px",
                  fontSize: "15px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  marginBottom: "16px",
                  transition: "150ms"
                }}
                onMouseOver={(e) => e.currentTarget.style.opacity = "0.9"}
                onMouseOut={(e) => e.currentTarget.style.opacity = "1"}
              >
                📱 Share Location with All Contacts
              </button>
            </div>

            <button
              type="button"
              onClick={() => completeJourneyMutation.mutate()}
              disabled={completeJourneyMutation.isPending}
              className="text-sm font-semibold disabled:opacity-60"
              style={{
                width: "fit-content",
                height: "50px",
                padding: "0 36px",
                background: "#1e3a5f",
                color: "#ffffff",
                fontSize: "14px",
                fontWeight: 800,
                letterSpacing: "0.08em",
                borderRadius: "12px",
                border: "1px solid #2d5282",
                marginTop: "4px",
                transition: "150ms"
              }}
              onMouseOver={(e) => e.currentTarget.style.background = "#1a3354"}
              onMouseOut={(e) => e.currentTarget.style.background = "#1e3a5f"}
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

