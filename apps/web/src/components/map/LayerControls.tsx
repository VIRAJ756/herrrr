import React from "react";
import { useMapStore } from "../../store/mapStore";

function ToggleRow(props: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}): React.ReactElement {
  return (
    <button
      type="button"
      className={[
        "flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-xs",
        "font-mono text-guardian-text-secondary hover:bg-guardian-bg-elevated",
        "focus:outline-none focus:ring-2 focus:ring-guardian-border-accent",
      ].join(" ")}
      role="switch"
      aria-checked={props.value}
      onClick={() => props.onChange(!props.value)}
    >
      <span>{props.label}</span>
      <span
        className={[
          "h-4 w-7 rounded-full border border-guardian-border-default p-[2px]",
          props.value ? "bg-guardian-signal-safe/20" : "bg-guardian-bg-surface",
        ].join(" ")}
        aria-hidden="true"
      >
        <span
          className={[
            "block h-3 w-3 rounded-full transition-transform",
            props.value ? "translate-x-3 bg-guardian-signal-safe" : "translate-x-0 bg-guardian-text-muted",
          ].join(" ")}
        />
      </span>
    </button>
  );
}

export function LayerControls(): React.ReactElement {
  const { toggles, setToggle } = useMapStore();
  return (
    <div className="w-44 overflow-hidden rounded-xl border border-guardian-border-subtle bg-guardian-bg-surface/95 backdrop-blur">
      <div className="border-b border-guardian-border-subtle px-3 py-2 text-[11px] font-mono tracking-widest text-guardian-text-secondary">
        LAYERS
      </div>
      <ToggleRow
        label="HEATMAP"
        value={toggles.heatmap}
        onChange={(v) => setToggle("heatmap", v)}
      />
      <ToggleRow
        label="INCIDENTS"
        value={toggles.incidents}
        onChange={(v) => setToggle("incidents", v)}
      />
      <ToggleRow
        label="SAFE ROUTE"
        value={toggles.safeRoute}
        onChange={(v) => setToggle("safeRoute", v)}
      />
      <ToggleRow
        label="TRACKING"
        value={toggles.liveTracking}
        onChange={(v) => setToggle("liveTracking", v)}
      />
    </div>
  );
}

