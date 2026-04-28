import React from "react";

export function TopBar(props: {
  areaLabel: string;
  live: boolean;
  rightSlot?: React.ReactNode;
}): React.ReactElement {
  return (
    <header className="flex h-12 items-center justify-between border-b border-guardian-border-subtle bg-guardian-bg-void px-4">
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
        {props.rightSlot}
      </div>
    </header>
  );
}

