import React from "react";
import { useSOS } from "../../hooks/useSOS";

export function SOSCountdown(): React.ReactElement {
  const { countdownSeconds, cancel } = useSOS();
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-guardian-bg-void/90 text-guardian-text-primary"
      role="dialog"
      aria-label="SOS countdown"
    >
      <div className="mx-auto w-full max-w-sm px-6 text-center">
        <div className="text-xs font-mono tracking-widest text-guardian-text-secondary">
          EMERGENCY ARMING
        </div>
        <div className="mt-4 text-6xl font-semibold tabular-nums">
          {countdownSeconds}
        </div>
        <button
          type="button"
          className="mt-8 w-full rounded-md border border-guardian-border-accent bg-guardian-bg-surface px-4 py-3 text-sm font-mono text-guardian-text-primary focus:outline-none focus:ring-2 focus:ring-guardian-border-accent"
          onClick={cancel}
        >
          TAP TO CANCEL
        </button>
      </div>
    </div>
  );
}

