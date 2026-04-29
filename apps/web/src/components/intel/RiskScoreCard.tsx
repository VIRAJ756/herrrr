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
      style={{ 
        background: "#0d1520",
        borderRadius: "20px",
        padding: "28px 28px 20px 28px",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
        width: "100%"
      }}
    >
      <div 
        style={{
          fontFamily: "'Courier New', monospace",
          fontSize: "11px",
          letterSpacing: "0.18em",
          color: "#6b7a8d",
          textTransform: "uppercase",
          marginBottom: "16px"
        }}
      >
        AREA RISK
      </div>

      <div style={{ 
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        marginBottom: "16px"
      }}>
        <div 
          style={{ 
            fontFamily: "'Courier New', monospace",
            fontSize: "52px",
            fontWeight: "800",
            color: score >= 0.7 ? "#FF3B5C" : score >= 0.5 ? "#F59E0B" : "#22c55e",
            textShadow: score >= 0.7 ? "0 0 30px rgba(255,59,92,0.5), 0 0 60px rgba(255,59,92,0.25)" : score >= 0.5 ? "0 0 30px rgba(245,158,11,0.5), 0 0 60px rgba(245,158,11,0.25)" : "0 0 30px rgba(34,197,94,0.5), 0 0 60px rgba(34,197,94,0.25)",
            lineHeight: "1"
          }}
        >
          {meta.label}
        </div>
        <div style={{ 
          fontFamily: "'Courier New', monospace",
          fontSize: "26px", 
          fontWeight: "500", 
          color: "#6b7a8d"
        }}>
          {pct}%
        </div>
      </div>

      <div 
        style={{ 
          height: "8px",
          background: "#1a2535",
          borderRadius: "999px",
          margin: "20px 0 20px 0",
          width: "100%"
        }}
      >
        <div 
          style={{ 
            height: "8px",
            width: `${pct}%`,
            background: score >= 0.7 ? "linear-gradient(90deg, #dc2626 0%, #FF3B5C 60%, #f87171 100%)" : score >= 0.5 ? "linear-gradient(90deg, #d97706 0%, #F59E0B 60%, #fbbf24 100%)" : "linear-gradient(90deg, #16a34a 0%, #22c55e 60%, #4ade80 100%)",
            borderRadius: "999px",
            boxShadow: score >= 0.7 ? "0 0 16px rgba(255,59,92,0.7), 0 0 32px rgba(255,59,92,0.4)" : score >= 0.5 ? "0 0 16px rgba(245,158,11,0.7), 0 0 32px rgba(245,158,11,0.4)" : "0 0 16px rgba(34,197,94,0.7), 0 0 32px rgba(34,197,94,0.4)"
          }}
        />
      </div>

      {intel.length > 0 && (
        <div style={{ 
          marginTop: "16px", 
          paddingTop: "12px",
          borderTop: "1px solid rgba(148,163,184,0.08)",
          fontFamily: "'Courier New', monospace"
        }}>
          {intel.map((i) => (
            <div key={i.label} style={{ 
              fontSize: "14px",
              marginBottom: "4px",
              color: "#94a3b8",
              fontFamily: "'Courier New', monospace"
            }}>
              {i.label}
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowAnalysis((value) => !value)}
        style={{
          width: "100%",
          height: "54px",
          background: "linear-gradient(135deg, #0f2744 0%, #1a3a5c 100%)",
          border: "1px solid rgba(59,130,246,0.25)",
          borderRadius: "14px",
          color: "#60a5fa",
          fontFamily: "'Courier New', monospace",
          fontSize: "13px",
          fontWeight: "700",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          cursor: "pointer",
          transition: "all 200ms ease"
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = "linear-gradient(135deg, #1a3a5c, #1e4976)";
          e.currentTarget.style.borderColor = "rgba(59,130,246,0.5)";
          e.currentTarget.style.boxShadow = "0 0 24px rgba(59,130,246,0.2)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = "linear-gradient(135deg, #0f2744 0%, #1a3a5c 100%)";
          e.currentTarget.style.borderColor = "rgba(59,130,246,0.25)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        RUN AI ANALYSIS
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

