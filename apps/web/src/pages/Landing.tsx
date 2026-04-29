import React from "react";
import { Link } from "react-router-dom";

export default function Landing(props: { demo: boolean }): React.ReactElement {
  return (
    <main style={{
      background: "#0a0f1a",
      color: "#f8fafc",
      fontFamily: "Inter, -apple-system, sans-serif"
    }}>
      <div style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        width: "100%",
        maxWidth: "1280px",
        margin: "0 auto",
        minHeight: "100vh",
        padding: "64px 24px"
      }}>
        <div style={{
          fontSize: "13px",
          fontWeight: 600,
          letterSpacing: "0.1em",
          color: "#4a5568"
        }}>
          GUARDIAN // Every location. Every moment. Protected.
        </div>
        <h1 style={{
          fontSize: "48px",
          fontWeight: 600,
          lineHeight: "1.2",
          marginTop: "12px",
          color: "#ffffff"
        }}>
          Intelligence-grade safety.
          <span style={{
            display: "block",
            color: "#cbd5e1",
            fontWeight: 400
          }}>
            Risk zones, realtime SOS, journey tracking.
          </span>
        </h1>

        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          marginTop: "32px"
        }}>
          <Link
            to={props.demo ? "/dashboard?demo=true" : "/dashboard"}
            style={{
              borderRadius: "12px",
              background: "#22c55e",
              color: "#0a0f1a",
              padding: "12px 20px",
              fontSize: "16px",
              fontWeight: 600,
              cursor: "pointer",
              textDecoration: "none",
              transition: "background-color 150ms"
            }}
            onMouseOver={(e) => e.currentTarget.style.background = "#16a34a"}
            onMouseOut={(e) => e.currentTarget.style.background = "#22c55e"}
          >
            Enter Dashboard
          </Link>
          <Link
            to="/report"
            style={{
              borderRadius: "12px",
              border: "1px solid #1e2d3d",
              background: "#111827",
              color: "#cbd5e1",
              padding: "12px 20px",
              fontSize: "16px",
              fontWeight: 500,
              cursor: "pointer",
              textDecoration: "none",
              transition: "all 150ms"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "#161f2e";
              e.currentTarget.style.color = "#ffffff";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "#111827";
              e.currentTarget.style.color = "#cbd5e1";
            }}
          >
            File a Field Report
          </Link>
        </div>

        <div style={{
          display: "grid",
          gap: "16px",
          marginTop: "40px",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))"
        }}>
          <div style={{
            borderRadius: "12px",
            border: "1px solid #1e2d3d",
            background: "#111827",
            padding: "16px 20px"
          }}>
            <div style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "#4a5568",
              letterSpacing: "0.1em"
            }}>
              LIVE SIGNALS
            </div>
            <div style={{
              fontSize: "14px",
              color: "#cbd5e1",
              marginTop: "8px"
            }}>
              Realtime SOS + journey pings via Socket.io.
            </div>
          </div>
          <div style={{
            borderRadius: "12px",
            border: "1px solid #1e2d3d",
            background: "#111827",
            padding: "16px 20px"
          }}>
            <div style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "#4a5568",
              letterSpacing: "0.1em"
            }}>
              RISK INTEL
            </div>
            <div style={{
              fontSize: "14px",
              color: "#cbd5e1",
              marginTop: "8px"
            }}>
              Heatmap from incident clusters + time decay.
            </div>
          </div>
          <div style={{
            borderRadius: "12px",
            border: "1px solid #1e2d3d",
            background: "#111827",
            padding: "16px 20px"
          }}>
            <div style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "#4a5568",
              letterSpacing: "0.1em"
            }}>
              DEMO MODE
            </div>
            <div style={{
              fontSize: "14px",
              color: "#cbd5e1",
              marginTop: "8px"
            }}>
              Append <span style={{ fontFamily: "monospace", color: "#38bdf8" }}>?demo=true</span> to see seeded
              Bengaluru activity.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

