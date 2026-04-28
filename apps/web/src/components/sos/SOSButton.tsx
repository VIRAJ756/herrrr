import React, { useCallback } from "react";
import { useSOS } from "../../hooks/useSOS";
import { SOSCountdown } from "./SOSCountdown";
import { SOSSent } from "./SOSSent";
import { SOSActivePanel } from "./SOSActivePanel";
import { FakeCallScreen } from "./FakeCallScreen";

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
  if (stage === "SENT") return <SOSSent />;
  if (stage === "ACTIVE") return <SOSActivePanel />;
  if (stage === "FAKE_CALL") return <FakeCallScreen />;

  return (
    <button
      type="button"
      className="fixed bottom-7 left-7 z-50 h-20 w-20 rounded-full bg-[#FF3B5C] text-white font-mono font-bold text-[18px] focus:outline-none focus:ring-2 focus:ring-[#FF3B5C]/60"
      aria-label="Emergency SOS — tap to activate"
      role="button"
      onClick={beginHold}
      onKeyDown={onKeyDown}
      style={{
        animation: "sos-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      }}
    >
      SOS
    </button>
  );
}

