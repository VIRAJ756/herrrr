import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../services/api";
import { useSOSStore } from "../../store/sosStore";
import { useSOS } from "../../hooks/useSOS";
import type { Contact } from "../../types/contact";

type ContactNotifyState = { name: string; status: "SENDING" | "NOTIFIED" };

async function fetchContacts(): Promise<Contact[]> {
  const response = await api.get<Contact[]>("/contacts");
  return response.data;
}

export function SOSActivePanel(): React.ReactElement {
  const { setStage } = useSOSStore();
  const { cancelActive, openFakeCall } = useSOS();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const contactsQuery = useQuery({
    queryKey: ["contacts"],
    queryFn: fetchContacts,
  });

  const contacts = useMemo<ContactNotifyState[]>(
    () =>
      (contactsQuery.data ?? []).map((contact, index) => ({
        name: `${contact.name} (${contact.relation})`,
        status: index === 0 ? "NOTIFIED" : "SENDING",
      })),
    [contactsQuery.data],
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
          <div className="text-[11px] font-mono tracking-widest text-guardian-text-secondary">
            DISPATCH STATUS
          </div>
          <div className="mt-3 space-y-2">
            {contacts.map((c) => (
              <div
                key={c.name}
                className="flex items-center justify-between rounded-md border border-guardian-border-subtle bg-guardian-bg-elevated/40 px-3 py-2"
              >
                <div className="text-sm">{c.name}</div>
                <div className="text-xs font-mono text-guardian-text-secondary">
                  {c.status === "NOTIFIED" ? "✓ NOTIFIED" : "⏳ SENDING"}
                </div>
              </div>
            ))}
          </div>
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

