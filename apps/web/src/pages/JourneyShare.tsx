import React from "react";

export default function JourneyShare(props: { demo: boolean }): React.ReactElement {
  return (
    <main className="min-h-screen bg-guardian-bg-base text-guardian-text-primary">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="text-xs font-mono tracking-widest text-guardian-text-secondary">
          JOURNEY / TRACKING
        </div>
        <div className="mt-4 rounded-xl border border-guardian-border-subtle bg-guardian-bg-surface p-5">
          <div className="text-sm text-guardian-text-secondary">
            Mission-style journey setup + share link will be wired in Phase 4 (realtime) +
            Phase 5 UI.
          </div>
          <div className="mt-4 text-xs font-mono text-guardian-text-secondary">
            Demo mode: <span className="text-guardian-text-primary">{String(props.demo)}</span>
          </div>
        </div>
      </div>
    </main>
  );
}

