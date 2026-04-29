import React, { useEffect } from "react";
import { useSOSStore } from "../../store/sosStore";
import { useToast } from "../../hooks/useToast";

export function SOSSent(): React.ReactElement {
  const { setStage } = useSOSStore();
  const { toast } = useToast();

  useEffect(() => {
    // Show toast on mount
    toast({
      title: "SOS Sent — Help is on the way",
      description: "Emergency alert sent to your contacts",
      variant: "success",
    });

    // Auto-dismiss toast after 4 seconds
    const timer = setTimeout(() => {
      // Toast will auto-dismiss via its own logic
    }, 4000);

    return () => clearTimeout(timer);
  }, [toast]);

  const handleCancel = () => {
    setStage("IDLE");
    toast({
      title: "Alert cancelled — Stay safe",
      description: "You have cancelled the emergency alert",
      variant: "success",
    });
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.75)"
      }}
      role="alert"
      aria-live="assertive"
    >
      <div style={{
        background: "#161f2e",
        border: "1px solid #1e2d3d",
        borderRadius: "20px",
        padding: "28px 24px",
        width: "460px",
        maxWidth: "92vw",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        fontFamily: "Inter, -apple-system, sans-serif"
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          marginBottom: "10px"
        }}>
          <span style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: "#ef4444"
          }}></span>
          <span style={{
            fontSize: "11px",
            fontWeight: 700,
            color: "#ef4444",
            letterSpacing: "0.15em"
          }}>
            EMERGENCY ACTIVE
          </span>
        </div>
        
        <h1 style={{
          fontSize: "26px",
          fontWeight: 800,
          color: "#ffffff",
          textAlign: "center",
          letterSpacing: "-0.02em",
          marginBottom: "20px"
        }}>
          🚨 SOS Alert Sent
        </h1>
        
        <div style={{
          background: "#0d1520",
          border: "1px solid #1e2d3d",
          borderRadius: "14px",
          padding: "16px 20px",
          marginBottom: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div>
            <div style={{
              fontSize: "10px",
              fontWeight: 700,
              color: "#4a5568",
              letterSpacing: "0.12em",
              marginBottom: "6px"
            }}>
              LIVE LOCATION
            </div>
            <div style={{
              fontSize: "16px",
              fontWeight: 700,
              color: "#22c55e",
              fontFamily: "'SF Mono', monospace"
            }}>
              12.9352°N, 77.6245°E
            </div>
          </div>
          <button
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "#6b7280",
              letterSpacing: "0.08em",
              background: "transparent",
              border: "none",
              cursor: "pointer"
            }}
            onMouseOver={(e) => e.currentTarget.style.color = "#ffffff"}
            onMouseOut={(e) => e.currentTarget.style.color = "#6b7280"}
          >
            COPY
          </button>
        </div>
        
        <div style={{
          fontSize: "10px",
          fontWeight: 700,
          color: "#4a5568",
          letterSpacing: "0.12em",
          marginBottom: "10px"
        }}>
          NOTIFYING CONTACTS
        </div>

        <div style={{
          background: "#0d1520",
          border: "1px solid #1e2d3d",
          borderRadius: "14px",
          padding: "14px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "12px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #1a9e8f, #22c55e)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
              fontWeight: 700,
              color: "#ffffff"
            }}>
              J
            </div>
            <div>
              <div style={{ 
                fontSize: "15px", 
                fontWeight: 700, 
                color: "#ffffff",
                letterSpacing: "-0.01em"
              }}>
                Jane Doe
              </div>
              <div style={{ 
                display: "inline-flex",
                alignItems: "center",
                background: "#0a0f1a",
                border: "1px solid #1e2d3d",
                borderRadius: "20px",
                padding: "3px 10px",
                fontSize: "11px",
                color: "#6b7280",
                marginTop: "6px"
              }}>
                family • ✓ Sent
              </div>
            </div>
          </div>
          <button
            style={{
              background: "#22c55e",
              color: "#0a0f1a",
              border: "none",
              borderRadius: "10px",
              padding: "10px 20px",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: "0.02em",
              transition: "150ms"
            }}
            onMouseOver={(e) => e.currentTarget.style.background = "#16a34a"}
            onMouseOut={(e) => e.currentTarget.style.background = "#22c55e"}
          >
            WhatsApp
          </button>
        </div>

        <div style={{
          background: "#0d1520",
          border: "1px solid #1e2d3d",
          borderRadius: "14px",
          padding: "14px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "12px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #1a9e8f, #22c55e)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
              fontWeight: 700,
              color: "#ffffff"
            }}>
              J
            </div>
            <div>
              <div style={{ 
                fontSize: "15px", 
                fontWeight: 700, 
                color: "#ffffff",
                letterSpacing: "-0.01em"
              }}>
                John Smith
              </div>
              <div style={{ 
                display: "inline-flex",
                alignItems: "center",
                background: "#0a0f1a",
                border: "1px solid #1e2d3d",
                borderRadius: "20px",
                padding: "3px 10px",
                fontSize: "11px",
                color: "#6b7280",
                marginTop: "6px"
              }}>
                family • Pending
              </div>
            </div>
          </div>
          <button
            style={{
              background: "#22c55e",
              color: "#0a0f1a",
              border: "none",
              borderRadius: "10px",
              padding: "10px 20px",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: "0.02em",
              transition: "150ms"
            }}
            onMouseOver={(e) => e.currentTarget.style.background = "#16a34a"}
            onMouseOut={(e) => e.currentTarget.style.background = "#22c55e"}
          >
            WhatsApp
          </button>
        </div>

        <button
          style={{
            width: "100%",
            height: "52px",
            background: "#22c55e",
            color: "#0a0f1a",
            border: "none",
            borderRadius: "14px",
            fontSize: "15px",
            fontWeight: 800,
            cursor: "pointer",
            letterSpacing: "0.02em",
            marginBottom: "10px",
            transition: "150ms"
          }}
          onMouseOver={(e) => e.currentTarget.style.background = "#16a34a"}
          onMouseOut={(e) => e.currentTarget.style.background = "#22c55e"}
        >
          📱 Send WhatsApp to All Contacts
        </button>

        <button
          style={{
            width: "100%",
            height: "50px",
            background: "transparent",
            border: "1.5px solid #ef4444",
            color: "#ef4444",
            fontSize: "13px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            borderRadius: "14px",
            cursor: "pointer",
            marginBottom: "10px",
            transition: "150ms"
          }}
          onMouseOver={(e) => e.currentTarget.style.background = "rgba(239,68,68,0.06)"}
          onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
        >
          🎙️ RECORD AUDIO EVIDENCE
        </button>

        <button
          type="button"
          onClick={handleCancel}
          style={{
            width: "100%",
            height: "50px",
            background: "transparent",
            border: "1.5px solid #22c55e",
            color: "#22c55e",
            fontSize: "14px",
            fontWeight: 700,
            borderRadius: "14px",
            cursor: "pointer",
            transition: "150ms"
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "rgba(34,197,94,0.06)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          ✓ I'M SAFE — Cancel Emergency
        </button>
      </div>
    </div>
  );
}
