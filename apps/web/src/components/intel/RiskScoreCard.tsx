import React, { useMemo } from "react";

function riskLabel(score: number): { label: string; color: string } {
  if (score >= 0.85) return { label: "CRITICAL", color: "bg-guardian-risk-critical" };
  if (score >= 0.7) return { label: "HIGH", color: "bg-guardian-risk-high" };
  if (score >= 0.5) return { label: "ELEVATED", color: "bg-guardian-risk-medium" };
  if (score >= 0.3) return { label: "LOW", color: "bg-guardian-risk-low" };
  return { label: "SAFE", color: "bg-guardian-risk-safe" };
}

export function RiskScoreCard(props: { demo: boolean }): React.ReactElement {
  const score = useMemo(() => (props.demo ? 0.73 : 0.42), [props.demo]);
  const intel = useMemo(() => {
    return props.demo
      ? [
          { label: "↑ 3 incidents (2h)", tone: "text-guardian-text-secondary" },
          { label: "⚡ Harassment × 2", tone: "text-guardian-text-secondary" },
          { label: "⚡ Poor Lighting × 1", tone: "text-guardian-text-secondary" },
        ]
      : [
          { label: "No recent spikes detected", tone: "text-guardian-text-secondary" },
          { label: "Enable demo for Bengaluru seed", tone: "text-guardian-text-secondary" },
        ];
  }, [props.demo]);

  const meta = riskLabel(score);
  const pct = Math.round(score * 100);

  return (
    <section className="rounded-xl border border-guardian-border-subtle bg-guardian-bg-surface/95 p-4 backdrop-blur">
      <div className="text-[11px] font-mono tracking-widest text-guardian-text-secondary">
        AREA RISK LEVEL
      </div>

      <div className="mt-2 flex items-baseline justify-between">
        <div className="text-lg font-semibold">{meta.label} RISK</div>
        <div className="text-sm font-mono text-guardian-text-secondary">{pct}%</div>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-guardian-bg-elevated">
        <div className={`h-full ${meta.color}`} style={{ width: `${pct}%` }} />
      </div>

      <div className="mt-4 space-y-1 border-t border-guardian-border-subtle pt-3">
        {intel.map((i) => (
          <div key={i.label} className={`text-sm ${i.tone}`}>
            {i.label}
          </div>
        ))}
      </div>

      <button
        type="button"
        className="mt-4 w-full rounded-md border border-guardian-border-default bg-guardian-bg-elevated px-3 py-2 text-xs font-mono text-guardian-text-primary hover:bg-guardian-bg-overlay focus:outline-none focus:ring-2 focus:ring-guardian-border-accent"
      >
        AI ANALYSIS ↗
      </button>
    </section>
  );
}

