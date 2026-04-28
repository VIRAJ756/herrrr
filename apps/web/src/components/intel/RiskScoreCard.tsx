import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchRiskAnalysis } from "../../services/ai";
import { useGeolocation } from "../../hooks/useGeolocation";

function riskLabel(score: number): { label: string; color: string } {
  if (score >= 0.85) return { label: "CRITICAL", color: "bg-guardian-risk-critical" };
  if (score >= 0.7) return { label: "HIGH", color: "bg-guardian-risk-high" };
  if (score >= 0.5) return { label: "ELEVATED", color: "bg-guardian-risk-medium" };
  if (score >= 0.3) return { label: "LOW", color: "bg-guardian-risk-low" };
  return { label: "SAFE", color: "bg-guardian-risk-safe" };
}

export function RiskScoreCard(props: { demo: boolean }): React.ReactElement {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const { point } = useGeolocation();
  const score = useMemo(() => (props.demo ? 0.73 : 0.42), [props.demo]);
  const intel = useMemo(() => {
    return props.demo
      ? [
          { label: "↑ 3 incidents (2h)", tone: "text-guardian-text-secondary" },
          { label: "⚡ Harassment × 2", tone: "text-guardian-text-secondary" },
          { label: "⚡ Poor Lighting × 1", tone: "text-guardian-text-secondary" },
        ]
      : [];
  }, [props.demo]);

  const meta = riskLabel(score);
  const pct = Math.round(score * 100);
  
  // Get current hour for timeOfDay
  const timeOfDay = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return "morning";
    if (hour >= 12 && hour < 17) return "afternoon";
    if (hour >= 17 && hour < 20) return "evening";
    return "night";
  }, []);

  const aiQuery = useQuery({
    queryKey: ["ai", "risk-analysis", props.demo, point?.lat, point?.lng],
    queryFn: () =>
      fetchRiskAnalysis({
        lat: point?.lat ?? 12.9716,
        lng: point?.lng ?? 77.5946,
        radius: 1000,
        timeOfDay,
      }),
    enabled: showAnalysis,
    staleTime: 5 * 60_000, // 5 minutes auto-refresh
    refetchInterval: 5 * 60_000,
    retry: 1,
  });

  return (
    <section 
      className="rounded-lg p-4"
      style={{ 
        backgroundColor: "#0F1520",
        border: "1px solid rgba(148,163,184,0.12)"
      }}
    >
      <div 
        className="text-[10px] font-mono tracking-widest uppercase"
        style={{ color: "#4B5563" }}
      >
        Area Risk
      </div>

      <div className="mt-2 flex items-baseline justify-between">
        <div 
          className="text-lg font-semibold"
          style={{ 
            color: score >= 0.7 ? "#FF3B5C" : score >= 0.5 ? "#F59E0B" : "#22C55E"
          }}
        >
          {meta.label}
        </div>
        <div className="text-sm font-mono" style={{ color: "#94A3B8" }}>{pct}%</div>
      </div>

      <div 
        className="mt-3 h-[6px] w-full overflow-hidden rounded-full"
        style={{ backgroundColor: "#1A2235" }}
      >
        <div 
          className="h-full"
          style={{ 
            width: `${pct}%`,
            backgroundColor: score >= 0.7 ? "#FF3B5C" : score >= 0.5 ? "#F59E0B" : "#22C55E"
          }}
        />
      </div>

      {intel.length > 0 && (
        <div className="mt-4 space-y-1 border-t pt-3" style={{ borderColor: "rgba(148,163,184,0.08)" }}>
          {intel.map((i) => (
            <div key={i.label} className={`text-sm ${i.tone}`}>
              {i.label}
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowAnalysis((value) => !value)}
        className="mt-4 w-full rounded-md px-3 py-2 text-xs font-mono transition-colors focus:outline-none"
        style={{ 
          backgroundColor: "#1A2235",
          color: "#94A3B8",
          border: "1px solid rgba(148,163,184,0.12)"
        }}
      >
        {showAnalysis ? "▼" : "▶ AI Analysis"}
      </button>
      {showAnalysis ? (
        <div 
          className="mt-4 rounded-md p-3"
          style={{ 
            backgroundColor: "#0A0E17",
            border: "1px solid rgba(148,163,184,0.12)"
          }}
        >
          {aiQuery.isLoading ? (
            <div className="flex items-center gap-2 text-sm" style={{ color: "#94A3B8" }}>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#00E5A0] border-t-transparent" />
              Analyzing area patterns…
            </div>
          ) : aiQuery.data ? (
            <div className="space-y-3">
              <div className="text-sm font-semibold" style={{ color: "#E2E8F0" }}>{aiQuery.data.riskLevel} SIGNAL</div>
              <div className="text-sm" style={{ color: "#94A3B8" }}>{aiQuery.data.summary}</div>
              <div className="space-y-1">
                {aiQuery.data.safetyTips.map((tip) => (
                  <div key={tip} className="text-xs" style={{ color: "#94A3B8" }}>
                    • {tip}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-sm" style={{ color: "#94A3B8" }}>
              AI analysis temporarily unavailable. Stay alert in this area.
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}

