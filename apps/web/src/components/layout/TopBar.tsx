import React from "react";
import { useNavigate } from "react-router-dom";
import { clearDemoUser, getDemoUser } from "../../services/auth";
import { useLang } from "../../context/LanguageContext";

export function TopBar(props: {
  areaLabel: string;
  live: boolean;
  rightSlot?: React.ReactNode;
}): React.ReactElement {
  const navigate = useNavigate();
  const user = getDemoUser();
  const { lang, setLang } = useLang();
  return (
    <header 
      className="relative z-30 flex items-center justify-between px-4"
      style={{ 
        height: "52px",
        backgroundColor: "var(--c-bg-panel)",
        borderBottom: "1px solid var(--c-border)"
      }}
    >
      <div className="flex items-center gap-3">
        <div 
          className="font-mono text-sm tracking-widest"
          style={{ color: "var(--c-text-primary)" }}
        >
          TRINETRA
        </div>
        <div className="hidden text-xs md:block" style={{ color: "var(--c-text-secondary)" }}>
          Your Campus Safety Companion
        </div>
        <div className="hidden text-xs md:block" style={{ color: "var(--c-text-secondary)" }}>
          {props.areaLabel}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setLang(lang === "en" ? "hi" : "en")}
          style={{
            background: "#1A2235",
            border: "1px solid rgba(148,163,184,0.2)",
            borderRadius: "6px",
            color: "#E2E8F0",
            padding: "4px 12px",
            fontSize: "13px",
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: "'Inter', sans-serif",
            letterSpacing: "0.5px",
          }}
        >
          {lang === "en" ? "हि" : "EN"}
        </button>
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${
              props.live ? "bg-[var(--c-accent-safe)]" : "bg-[var(--c-text-muted)]"
            }`}
            aria-hidden="true"
            style={props.live ? { animation: "signal-blink 2s infinite" } : {}}
          />
          <span className="text-xs font-mono" style={{ color: "var(--c-text-secondary)" }}>
            <span className={props.live ? "animate-signal-blink" : ""}>LIVE</span>
          </span>
        </div>
        <button
          type="button"
          className="h-8 min-w-8 rounded-full border px-2 text-[11px] font-mono"
          style={{ 
            borderColor: "var(--c-border)",
            backgroundColor: "var(--c-bg-item)",
            color: "var(--c-text-secondary)"
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

