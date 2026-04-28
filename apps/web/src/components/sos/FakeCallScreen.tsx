import React from "react";
import { useSOSStore } from "../../store/sosStore";

export function FakeCallScreen(): React.ReactElement {
  const { fakeCallerName, setStage } = useSOSStore();

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-guardian-bg-void text-guardian-text-primary">
      <div className="w-full max-w-sm rounded-3xl border border-guardian-border-subtle bg-guardian-bg-surface p-6 text-center shadow-2xl">
        <div className="text-xs font-mono tracking-widest text-guardian-text-secondary">
          INCOMING CALL
        </div>
        <div className="mt-6 text-3xl font-semibold">{fakeCallerName}</div>
        <div className="mt-2 text-sm text-guardian-text-secondary">Mobile</div>
        <div className="mt-8 grid grid-cols-2 gap-3">
          <button
            type="button"
            className="rounded-full bg-guardian-signal-danger px-4 py-4 text-sm font-semibold text-white"
            onClick={() => setStage("IDLE")}
          >
            Decline
          </button>
          <button
            type="button"
            className="rounded-full bg-guardian-signal-safe px-4 py-4 text-sm font-semibold text-guardian-text-inverse"
            onClick={() => setStage("IDLE")}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}

