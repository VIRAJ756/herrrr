import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import type { Contact, ContactRelation } from "../types/contact";
import { MobileNav } from "../components/layout/MobileNav";
import { DemoBanner } from "../components/layout/DemoBanner";

async function fetchContacts(): Promise<Contact[]> {
  const response = await api.get<Contact[]>("/contacts");
  return response.data;
}

export default function Contacts(): React.ReactElement {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [relation, setRelation] = useState<ContactRelation>("family");
  const [feedback, setFeedback] = useState<string | null>(null);

  const contactsQuery = useQuery({
    queryKey: ["contacts"],
    queryFn: fetchContacts,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post<Contact>("/contacts", {
        name,
        phone,
        email: email.trim() || undefined,
        relation,
      });
      return response.data;
    },
    onSuccess: async () => {
      setName("");
      setPhone("");
      setEmail("");
      setRelation("family");
      setFeedback("Trusted contact added.");
      await queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/contacts/${id}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });

  const testAlertMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post<{ message: string }>(`/contacts/${id}/test-alert`);
      return response.data;
    },
    onSuccess: (data) => {
      setFeedback(data.message);
    },
  });

  return (
    <main className="min-h-screen bg-guardian-bg-base pb-16 text-guardian-text-primary">
      <DemoBanner />
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="text-xs font-mono tracking-widest text-guardian-text-secondary">
          TRUSTED CONTACTS
        </div>

        <section className="mt-4 rounded-xl border border-guardian-border-subtle bg-guardian-bg-surface p-4">
          <div className="text-sm font-semibold">Add Trusted Contact</div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Name"
              className="rounded-md border border-guardian-border-subtle bg-guardian-bg-base p-3 text-sm outline-none focus:ring-2 focus:ring-guardian-border-accent"
            />
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="Phone"
              className="rounded-md border border-guardian-border-subtle bg-guardian-bg-base p-3 text-sm outline-none focus:ring-2 focus:ring-guardian-border-accent"
            />
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email (optional)"
              className="rounded-md border border-guardian-border-subtle bg-guardian-bg-base p-3 text-sm outline-none focus:ring-2 focus:ring-guardian-border-accent"
            />
            <select
              value={relation}
              onChange={(event) => setRelation(event.target.value as ContactRelation)}
              className="rounded-md border border-guardian-border-subtle bg-guardian-bg-base p-3 text-sm outline-none focus:ring-2 focus:ring-guardian-border-accent"
            >
              <option value="family">Family</option>
              <option value="friend">Friend</option>
              <option value="colleague">Colleague</option>
            </select>
          </div>
          <button
            type="button"
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending || !name.trim() || !phone.trim()}
            className="mt-4 rounded-md bg-guardian-signal-safe px-4 py-3 text-sm font-semibold text-guardian-text-inverse disabled:opacity-60"
          >
            {createMutation.isPending ? "ADDING…" : "ADD CONTACT"}
          </button>
          {feedback ? <div className="mt-3 text-sm text-guardian-signal-safe">{feedback}</div> : null}
          {createMutation.isError ? (
            <div className="mt-3 text-sm text-guardian-signal-danger">
              {createMutation.error instanceof Error
                ? createMutation.error.message
                : "Failed to add contact."}
            </div>
          ) : null}
        </section>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {(contactsQuery.data ?? []).map((contact, index) => (
            <div
              key={contact.id}
              className="rounded-xl border border-guardian-border-subtle bg-guardian-bg-surface p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">{contact.name}</div>
                  <div className="text-xs text-guardian-text-secondary">
                    Priority {index + 1} · {contact.relation}
                  </div>
                  <div className="mt-1 text-xs text-guardian-text-secondary">{contact.phone}</div>
                  {contact.email ? (
                    <div className="text-xs text-guardian-text-secondary">{contact.email}</div>
                  ) : null}
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    className="rounded-md border border-guardian-border-default bg-guardian-bg-elevated px-3 py-2 text-xs font-mono text-guardian-text-primary focus:outline-none focus:ring-2 focus:ring-guardian-border-accent"
                    onClick={() => testAlertMutation.mutate(contact.id)}
                  >
                    TEST ALERT
                  </button>
                  <button
                    type="button"
                    className="rounded-md border border-guardian-border-default bg-guardian-bg-elevated px-3 py-2 text-xs font-mono text-guardian-text-primary focus:outline-none focus:ring-2 focus:ring-guardian-border-accent"
                    onClick={() => deleteMutation.mutate(contact.id)}
                  >
                    REMOVE
                  </button>
                </div>
              </div>
            </div>
          ))}
          {contactsQuery.isLoading ? (
            <div className="rounded-xl border border-guardian-border-subtle bg-guardian-bg-surface p-4 text-sm text-guardian-text-secondary">
              Loading contacts…
            </div>
          ) : null}
        </div>
      </div>
      <MobileNav />
    </main>
  );
}

