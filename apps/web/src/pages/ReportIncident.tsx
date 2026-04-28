import React, { useMemo, useState } from "react";
import type { IncidentType } from "../types/incident";

const TYPES: { type: IncidentType; label: string }[] = [
  { type: "HARASSMENT", label: "Harassment" },
  { type: "STALKING", label: "Stalking" },
  { type: "POOR_LIGHTING", label: "Poor Lighting" },
  { type: "ASSAULT", label: "Assault" },
  { type: "SUSPICIOUS_ACTIVITY", label: "Suspicious Activity" },
  { type: "OTHER", label: "Other" }
];

function Pill(props: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <button
      type="button"
      className={[
        "rounded-full border px-3 py-2 text-xs font-mono",
        props.active
          ? "border-guardian-border-accent bg-guardian-bg-elevated text-guardian-text-primary shadow-[var(--g-glow-safe)]"
          : "border-guardian-border-subtle bg-guardian-bg-surface text-guardian-text-secondary hover:bg-guardian-bg-elevated"
      ].join(" ")}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
}

export default function ReportIncident(): React.ReactElement {
  const [type, setType] = useState<IncidentType>("HARASSMENT");
  const [severity, setSeverity] = useState(3);
  const [anon, setAnon] = useState(true);
  const [desc, setDesc] = useState("");

  const severityLabel = useMemo(() => {
    if (severity >= 5) return "CRITICAL";
    if (severity >= 4) return "HIGH";
    if (severity >= 3) return "MEDIUM";
    if (severity >= 2) return "LOW";
    return "MINOR";
  }, [severity]);

  return (
    <main className="min-h-screen bg-guardian-bg-base text-guardian-text-primary">
      <div className="mx-auto max-w-xl px-6 py-10">
        <div className="text-xs font-mono tracking-widest text-guardian-text-secondary">
          NEW FIELD REPORT
        </div>

        <section className="mt-4 rounded-xl border border-guardian-border-subtle bg-guardian-bg-surface p-5">
          <div className="text-[11px] font-mono tracking-widest text-guardian-text-secondary">
            INCIDENT TYPE
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {TYPES.map((t) => (
              <Pill key={t.type} active={t.type === type} onClick={() => setType(t.type)}>
                {t.label}
              </Pill>
            ))}
          </div>

          <div className="mt-6 text-[11px] font-mono tracking-widest text-guardian-text-secondary">
            SEVERITY <span className="ml-2 text-guardian-text-primary">{severityLabel}</span>
          </div>
          <input
            className="mt-3 w-full accent-[var(--g-signal-safe)]"
            type="range"
            min={1}
            max={5}
            value={severity}
            onChange={(e) => setSeverity(Number(e.target.value))}
            aria-label="Severity"
          />

          <div className="mt-6 text-[11px] font-mono tracking-widest text-guardian-text-secondary">
            DESCRIPTION (OPTIONAL)
          </div>
          <textarea
            className="mt-3 w-full resize-none rounded-md border border-guardian-border-subtle bg-guardian-bg-base p-3 text-sm text-guardian-text-primary outline-none focus:ring-2 focus:ring-guardian-border-accent"
            rows={4}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Add context that helps others avoid danger…"
          />

          <div className="mt-6 flex items-center justify-between rounded-md border border-guardian-border-subtle bg-guardian-bg-elevated/30 px-3 py-3">
            <div className="text-sm">Anonymous Report</div>
            <button
              type="button"
              role="switch"
              aria-checked={anon}
              onClick={() => setAnon(!anon)}
              className="h-5 w-10 rounded-full border border-guardian-border-default bg-guardian-bg-surface p-[2px] focus:outline-none focus:ring-2 focus:ring-guardian-border-accent"
            >
              <span
                className={[
                  "block h-4 w-4 rounded-full transition-transform",
                  anon ? "translate-x-5 bg-guardian-signal-safe" : "translate-x-0 bg-guardian-text-muted"
                ].join(" ")}
              />
            </button>
          </div>

          <button
            type="button"
            className="mt-6 w-full rounded-md bg-guardian-signal-safe px-4 py-3 text-sm font-semibold text-guardian-text-inverse shadow-[var(--g-glow-safe)] focus:outline-none focus:ring-2 focus:ring-guardian-signal-safe/60"
            onClick={() => {
              void desc;
              void anon;
              alert("Report submission will be wired to /api/incidents next (Phase 3).");
            }}
          >
            SUBMIT REPORT →
          </button>
        </section>
      </div>
    </main>
  );
}

