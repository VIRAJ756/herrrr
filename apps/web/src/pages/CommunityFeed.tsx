import React from "react";

export default function CommunityFeed(): React.ReactElement {
  return (
    <main className="min-h-screen bg-guardian-bg-base text-guardian-text-primary">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="text-xs font-mono tracking-widest text-guardian-text-secondary">
          COMMUNITY / INTEL FEED
        </div>

        <div className="mt-4 space-y-3">
          {[
            { type: "HARASSMENT", tone: "HIGH", when: "45 min ago", where: "MG Road Metro Station" },
            { type: "POOR_LIGHTING", tone: "MEDIUM", when: "2 h ago", where: "Koramangala 5th Block" },
            { type: "SUSPICIOUS_ACTIVITY", tone: "MEDIUM", when: "3 h ago", where: "Indiranagar 100ft Road" }
          ].map((r) => (
            <article
              key={`${r.type}-${r.when}`}
              className="rounded-xl border border-guardian-border-subtle bg-guardian-bg-surface p-4"
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">⚡ {r.type}</div>
                <span className="rounded-full border border-guardian-border-default bg-guardian-bg-elevated px-2 py-1 text-[11px] font-mono text-guardian-text-secondary">
                  {r.tone}
                </span>
              </div>
              <div className="mt-1 text-xs text-guardian-text-secondary">
                2.3km away · {r.when}
              </div>
              <div className="mt-2 text-sm text-guardian-text-secondary">{r.where}</div>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  className="rounded-md border border-guardian-border-default bg-guardian-bg-elevated px-3 py-2 text-xs font-mono text-guardian-text-primary focus:outline-none focus:ring-2 focus:ring-guardian-border-accent"
                >
                  ▲ VERIFY
                </button>
                <button
                  type="button"
                  className="rounded-md border border-guardian-border-default bg-guardian-bg-elevated px-3 py-2 text-xs font-mono text-guardian-text-primary focus:outline-none focus:ring-2 focus:ring-guardian-border-accent"
                >
                  ▼ FLAG
                </button>
                <button
                  type="button"
                  className="rounded-md border border-guardian-border-default bg-guardian-bg-elevated px-3 py-2 text-xs font-mono text-guardian-text-primary focus:outline-none focus:ring-2 focus:ring-guardian-border-accent"
                >
                  📍 VIEW MAP
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}

