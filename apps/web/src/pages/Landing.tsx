import React from "react";
import { Link } from "react-router-dom";

export default function Landing(props: { demo: boolean }): React.ReactElement {
  return (
    <main className="min-h-screen bg-guardian-bg-base text-guardian-text-primary">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16">
        <div className="text-xs font-mono tracking-widest text-guardian-text-secondary">
          GUARDIAN // Every location. Every moment. Protected.
        </div>
        <h1 className="mt-3 text-4xl font-semibold leading-tight">
          Intelligence-grade safety.
          <span className="block text-guardian-text-secondary">
            Risk zones, realtime SOS, journey tracking.
          </span>
        </h1>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to={props.demo ? "/dashboard?demo=true" : "/dashboard"}
            className="rounded-md bg-guardian-signal-safe px-5 py-3 font-semibold text-guardian-text-inverse shadow-[var(--g-glow-safe)] focus:outline-none focus:ring-2 focus:ring-guardian-signal-safe/60"
          >
            Enter Dashboard
          </Link>
          <Link
            to="/report"
            className="rounded-md border border-guardian-border-default bg-guardian-bg-surface px-5 py-3 font-medium text-guardian-text-primary hover:bg-guardian-bg-elevated focus:outline-none focus:ring-2 focus:ring-guardian-border-accent"
          >
            File a Field Report
          </Link>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-guardian-border-subtle bg-guardian-bg-surface p-4">
            <div className="text-sm font-mono text-guardian-text-secondary">
              LIVE SIGNALS
            </div>
            <div className="mt-2 text-sm text-guardian-text-secondary">
              Realtime SOS + journey pings via Socket.io.
            </div>
          </div>
          <div className="rounded-lg border border-guardian-border-subtle bg-guardian-bg-surface p-4">
            <div className="text-sm font-mono text-guardian-text-secondary">
              RISK INTEL
            </div>
            <div className="mt-2 text-sm text-guardian-text-secondary">
              Heatmap from incident clusters + time decay.
            </div>
          </div>
          <div className="rounded-lg border border-guardian-border-subtle bg-guardian-bg-surface p-4">
            <div className="text-sm font-mono text-guardian-text-secondary">
              DEMO MODE
            </div>
            <div className="mt-2 text-sm text-guardian-text-secondary">
              Append <span className="font-mono">?demo=true</span> to see seeded
              Bengaluru activity.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

