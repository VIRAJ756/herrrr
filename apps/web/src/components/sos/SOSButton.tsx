import React, { useCallback } from "react";
import { useSOS } from "../../hooks/useSOS";
import { SOSCountdown } from "./SOSCountdown";
import { SOSActivePanel } from "./SOSActivePanel";

export function SOSButton(): React.ReactElement {
  const { stage, beginHold, cancel } = useSOS();

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        beginHold();
      }
      if (e.key === "Escape") cancel();
    },
    [beginHold, cancel],
  );

  if (stage === "COUNTDOWN") return <SOSCountdown />;
  if (stage === "ACTIVE") return <SOSActivePanel />;

  return (
    <button
      type="button"
      className="h-[72px] w-[72px] rounded-full bg-guardian-signal-danger text-guardian-text-primary shadow-[var(--g-glow-danger)] animate-pulse-sos focus:outline-none focus:ring-2 focus:ring-guardian-signal-danger/60"
      aria-label="Emergency SOS — hold for 2 seconds"
      role="button"
      onMouseDown={beginHold}
      onTouchStart={beginHold}
      onKeyDown={onKeyDown}
    >
      <span className="font-mono text-lg font-bold">SOS</span>
    </button>
  );
}

