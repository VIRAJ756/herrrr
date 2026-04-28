import React from "react";
import { useNavigate } from "react-router-dom";
import { clearDemoUser, getDemoUser } from "../../services/auth";

export function TopBar(props: {
  areaLabel: string;
  live: boolean;
  rightSlot?: React.ReactNode;
}): React.ReactElement {
  const navigate = useNavigate();
  const user = getDemoUser();
  return (
    <header 
      className="relative z-30 flex items-center justify-between px-4"
      style={{ 
        height: "52px",
        backgroundColor: "#0A0E17",
        borderBottom: "1px solid rgba(148,163,184,0.08)"
      }}
    >
      <div className="flex items-center gap-3">
        <div 
          className="font-mono text-sm tracking-widest"
          style={{ color: "#00E5A0" }}
        >
          GUARDIAN
        </div>
        <div className="hidden text-xs md:block" style={{ color: "#94A3B8" }}>
          {props.areaLabel}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${
              props.live ? "bg-[#00E5A0]" : "bg-[#4B5563]"
            }`}
            aria-hidden="true"
            style={props.live ? { animation: "signal-blink 1.5s infinite" } : {}}
          />
          <span className="text-xs font-mono" style={{ color: "#94A3B8" }}>
            <span className={props.live ? "animate-signal-blink" : ""}>LIVE</span>
          </span>
        </div>
        <button
          type="button"
          className="h-8 min-w-8 rounded-full border px-2 text-[11px] font-mono"
          style={{ 
            borderColor: "rgba(148,163,184,0.15)",
            backgroundColor: "#0F1520",
            color: "#94A3B8"
          }}
          onClick={() => {
            clearDemoUser();
            navigate("/login");
          }}
          title={`Logout ${user?.name ?? ""}`}
        >
          {user?.name?.[0]?.toUpperCase?.() ?? "U"}
        </button>
        {props.rightSlot}
      </div>
    </header>
  );
}

