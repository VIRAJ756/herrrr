import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import { useLang } from "../context/LanguageContext";
import type { Contact, ContactRelation } from "../types/contact";
import { MobileNav } from "../components/layout/MobileNav";
import { DemoBanner } from "../components/layout/DemoBanner";

async function fetchContacts(): Promise<Contact[]> {
  const response = await api.get<Contact[]>("/contacts");
  return response.data;
}

export default function Contacts(): React.ReactElement {
  const { t } = useLang();
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
    <main style={{
      background: "#0a0f1a",
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
      <div className="mx-auto max-w-4xl">
        <div style={{
          fontSize: "13px",
          fontWeight: 600,
          letterSpacing: "0.1em",
          color: "#4a5568",
          marginBottom: "20px"
        }}>
          GUARDIAN TRACKING
        </div>

        <section style={{
          borderRadius: "16px",
          border: "1px solid #1e2d3d",
          background: "#111827",
          padding: "24px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.4)"
        }}>
          <div style={{ fontSize: "18px", fontWeight: 600, color: "#ffffff" }}>Add Trusted Contact</div>
          <div style={{
            marginTop: "16px",
            display: "grid",
            gap: "12px",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))"
          }}>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Name"
              style={{
                borderRadius: "10px",
                border: "1px solid #1e2d3d",
                background: "#0d1520",
                padding: "14px 16px",
                fontSize: "15px",
                color: "#ffffff",
                outline: "none"
              }}
            />
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="Phone"
              style={{
                borderRadius: "10px",
                border: "1px solid #1e2d3d",
                background: "#0d1520",
                padding: "14px 16px",
                fontSize: "15px",
                color: "#ffffff",
                outline: "none"
              }}
            />
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email (optional)"
              style={{
                borderRadius: "10px",
                border: "1px solid #1e2d3d",
                background: "#0d1520",
                padding: "14px 16px",
                fontSize: "15px",
                color: "#ffffff",
                outline: "none"
              }}
            />
            <select
              value={relation}
              onChange={(event) => setRelation(event.target.value as ContactRelation)}
              style={{
                borderRadius: "10px",
                border: "1px solid #1e2d3d",
                background: "#0d1520",
                padding: "14px 16px",
                fontSize: "15px",
                color: "#ffffff",
                outline: "none"
              }}
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
            style={{
              width: "100%",
              height: "52px",
              background: "#22c55e",
              color: "#0a0f1a",
              fontSize: "15px",
              fontWeight: 700,
              letterSpacing: "0.06em",
              borderRadius: "12px",
              border: "none",
              marginTop: "16px",
              cursor: "pointer",
              transition: "background-color 150ms",
              opacity: (createMutation.isPending || !name.trim() || !phone.trim()) ? 0.6 : 1
            }}
            onMouseOver={(e) => {
              if (!createMutation.isPending && name.trim() && phone.trim()) {
                e.currentTarget.style.background = "#16a34a";
              }
            }}
            onMouseOut={(e) => {
              if (!createMutation.isPending && name.trim() && phone.trim()) {
                e.currentTarget.style.background = "#22c55e";
              }
            }}
          >
            {createMutation.isPending ? "ADDING…" : "ADD CONTACT"}
          </button>
          {feedback ? <div style={{ marginTop: "12px", fontSize: "13px", color: "#22c55e" }}>{feedback}</div> : null}
          {createMutation.isError ? (
            <div style={{ marginTop: "12px", fontSize: "13px", color: "#ef4444" }}>
              {createMutation.error instanceof Error
                ? createMutation.error.message
                : "Failed to add contact."}
            </div>
          ) : null}
        </section>

        <div style={{
          marginTop: "16px",
          display: "grid",
          gap: "12px",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))"
        }}>
          {(contactsQuery.data ?? []).map((contact, index) => (
            <div
              key={contact.id}
              style={{
                borderRadius: "16px",
                border: "1px solid #1e2d3d",
                background: "#111827",
                padding: "16px 20px"
              }}
            >
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px"
              }}>
                <div>
                  <div style={{ fontSize: "16px", fontWeight: 600, color: "#ffffff" }}>{contact.name}</div>
                  <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "2px" }}>
                    Priority {index + 1} · {contact.relation}
                  </div>
                  <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px" }}>{contact.phone}</div>
                  {contact.email ? (
                    <div style={{ fontSize: "13px", color: "#6b7280" }}>{contact.email}</div>
                  ) : null}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <button
                    type="button"
                    style={{
                      borderRadius: "8px",
                      border: "1px solid #1e2d3d",
                      background: "#111827",
                      padding: "6px 12px",
                      fontSize: "12px",
                      fontWeight: 500,
                      color: "#cbd5e1",
                      cursor: "pointer",
                      transition: "all 150ms"
                    }}
                    onClick={() => testAlertMutation.mutate(contact.id)}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = "#22c55e";
                      e.currentTarget.style.color = "#22c55e";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = "#1e2d3d";
                      e.currentTarget.style.color = "#cbd5e1";
                    }}
                  >
                    TEST ALERT
                  </button>
                  <button
                    type="button"
                    style={{
                      borderRadius: "8px",
                      border: "1px solid #1e2d3d",
                      background: "#111827",
                      padding: "6px 12px",
                      fontSize: "12px",
                      fontWeight: 500,
                      color: "#cbd5e1",
                      cursor: "pointer",
                      transition: "all 150ms"
                    }}
                    onClick={() => deleteMutation.mutate(contact.id)}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = "#ef4444";
                      e.currentTarget.style.color = "#ef4444";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = "#1e2d3d";
                      e.currentTarget.style.color = "#cbd5e1";
                    }}
                  >
                    REMOVE
                  </button>
                </div>
              </div>
            </div>
          ))}
          {contactsQuery.isLoading ? (
            <div style={{
              borderRadius: "16px",
              border: "1px solid #1e2d3d",
              background: "#111827",
              padding: "16px 20px",
              fontSize: "14px",
              color: "#cbd5e1"
            }}>
              Loading contacts…
            </div>
          ) : null}
        </div>
      </div>
      <MobileNav />
    </main>
  );
}

