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
    <header className="relative z-30 flex h-12 items-center justify-between border-b border-guardian-border-subtle bg-guardian-bg-void px-4">
      <div className="flex items-center gap-3">
        <div className="font-mono text-sm tracking-widest text-guardian-text-primary">
          GUARDIAN
        </div>
        <div className="hidden text-xs text-guardian-text-secondary md:block">
          Area: {props.areaLabel}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${
              props.live ? "bg-guardian-signal-safe" : "bg-guardian-text-muted"
            }`}
            aria-hidden="true"
          />
          <span className="text-xs font-mono text-guardian-text-secondary">
            <span className={props.live ? "animate-signal-blink" : ""}>LIVE</span>
          </span>
        </div>
        <button
          type="button"
          className="h-8 min-w-8 rounded-full border border-guardian-border-default bg-guardian-bg-surface px-2 text-[11px] font-mono text-guardian-text-secondary"
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

