import React, { useMemo, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../services/api";
import { useSOSStore } from "../../store/sosStore";
import { useSOS } from "../../hooks/useSOS";
import type { Contact } from "../../types/contact";

type ContactNotifyState = { 
  name: string; 
  phone: string;
  status: "SENDING" | "NOTIFIED";
  mode?: "simulated" | "gateway";
};

async function fetchContacts(): Promise<Contact[]> {
  const response = await api.get<Contact[]>("/contacts");
  return response.data;
}

/** Send WhatsApp message to a phone number */
const sendWhatsApp = (phone: string) => {
  const cleanPhone = phone.replace(/\D/g, "");
  const message = encodeURIComponent("🚨 SOS Alert! I need help immediately. Location shared on GUARDIAN app.");
  window.open(`https://wa.me/${cleanPhone}?text=${message}`, "_blank");
};

export function SOSActivePanel(): React.ReactElement {
  const { setStage } = useSOSStore();
  const { cancelActive, openFakeCall } = useSOS();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [smsMode, setSmsMode] = useState<"simulated" | "gateway" | null>(null);
  
  const contactsQuery = useQuery({
    queryKey: ["contacts"],
    queryFn: fetchContacts,
  });

  const handleSmsResult = useCallback((data: { mode?: "simulated" | "gateway" }) => {
    setSmsMode(data.mode || "simulated");
  }, []);

  const contacts = useMemo<ContactNotifyState[]>(
    () =>
      (contactsQuery.data ?? []).map((contact) => ({
        name: `${contact.name} (${contact.relation})`,
        phone: contact.phone,
        status: "NOTIFIED",
        mode: smsMode || "simulated",
      })),
    [contactsQuery.data, smsMode],
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-guardian-signal-danger/20 text-guardian-text-primary"
      role="alert"
      aria-live="assertive"
    >
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-10">
        <div className="text-center">
          <div className="text-xs font-mono tracking-widest text-guardian-text-secondary">
            <span className="animate-signal-blink">EMERGENCY ACTIVE</span>
          </div>
          <div className="mt-3 text-2xl font-semibold">Notifying trusted contacts…</div>
          <div className="mt-2 text-sm text-guardian-text-secondary font-mono">
            Location sharing enabled
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-guardian-border-subtle bg-guardian-bg-surface/90 p-4 backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-mono tracking-widest text-guardian-text-secondary">
              DISPATCH STATUS
            </div>
            {smsMode && (
              <div className="text-[10px] font-mono px-2 py-1 rounded bg-guardian-bg-elevated text-guardian-text-secondary">
                {smsMode === "simulated" ? "✓ SIMULATED" : "✓ LIVE SMS"}
              </div>
            )}
          </div>
          <div className="mt-3 space-y-2">
            {contacts.map((c) => (
              <div
                key={c.name}
                className="flex items-center justify-between rounded-md border border-guardian-border-subtle bg-guardian-bg-elevated/40 px-3 py-2"
              >
                <div className="flex-1">
                  <div className="text-sm">{c.name}</div>
                  <div className="text-[10px] font-mono text-guardian-text-secondary">
                    {c.status === "NOTIFIED" ? "✓ Sent (Simulated)" : "⏳ Sending..."}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => sendWhatsApp(c.phone)}
                  className="ml-2 rounded-md bg-green-600/80 px-2 py-1 text-[10px] font-mono text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                  WhatsApp
                </button>
              </div>
            ))}
          </div>
          {contacts.length > 0 && (
            <button
              type="button"
              onClick={() => {
                // Send WhatsApp to all contacts
                contacts.forEach((c) => sendWhatsApp(c.phone));
              }}
              className="mt-3 w-full rounded-md border border-green-500/50 bg-green-900/30 px-3 py-2 text-xs font-mono text-green-100 hover:bg-green-900/50 focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              📱 Send WhatsApp to All Contacts
            </button>
          )}
        </div>

        <div className="mt-6 grid gap-3">
          <button
            type="button"
            className="w-full rounded-md bg-guardian-bg-surface px-4 py-3 text-sm font-mono text-guardian-text-primary border border-guardian-border-default focus:outline-none focus:ring-2 focus:ring-guardian-border-accent"
          >
            RECORD AUDIO
          </button>
          <button
            type="button"
            className="w-full rounded-md bg-guardian-bg-surface px-4 py-3 text-sm font-mono text-guardian-text-primary border border-guardian-border-default focus:outline-none focus:ring-2 focus:ring-guardian-border-accent"
            onClick={openFakeCall}
          >
            FAKE CALL ESCAPE
          </button>

          <button
            type="button"
            className="w-full rounded-md border border-guardian-border-accent bg-guardian-bg-surface px-4 py-3 text-sm font-mono text-guardian-text-primary focus:outline-none focus:ring-2 focus:ring-guardian-border-accent"
            onClick={() => {
              if (!confirmCancel) {
                setConfirmCancel(true);
                return;
              }
              cancelActive();
            }}
          >
            {confirmCancel ? "TAP AGAIN TO CONFIRM I'M SAFE" : "I'M SAFE — CANCEL"}
          </button>
        </div>
      </div>
    </div>
  );
}

