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
        "font-medium transition-colors focus:outline-none",
      ].join(" ")}
      style={{ 
        color: "#94A3B8",
      }}
      role="switch"
      aria-checked={props.value}
      onClick={() => props.onChange(!props.value)}
    >
      <span>{props.label}</span>
      <span
        className={[
          "h-4 w-7 rounded-full border p-[2px] transition-colors",
        ].join(" ")}
        style={{ 
          borderColor: props.value ? "#00E5A0" : "rgba(148,163,184,0.15)",
          backgroundColor: props.value ? "rgba(0, 229, 160, 0.2)" : "#0A0E17",
        }}
        aria-hidden="true"
      >
        <span
          className={[
            "block h-3 w-3 rounded-full transition-transform",
          ].join(" ")}
          style={{
            transform: props.value ? "translateX(12px)" : "translateX(0)",
            backgroundColor: props.value ? "#00E5A0" : "#4B5563",
          }}
        />
      </span>
    </button>
  );
}

export function LayerControls(): React.ReactElement {
  const { toggles, setToggle } = useMapStore();
  return (
    <div
      className="overflow-hidden rounded-lg"
      style={{
        position: "fixed",
        left: "208px",
        top: "72px",
        backgroundColor: "#0F1520",
        border: "1px solid rgba(148,163,184,0.1)",
        borderRadius: "10px",
        padding: "12px",
        width: "180px"
      }}
    >
      <div
        className="px-3 py-2 text-[10px] font-mono tracking-widest uppercase"
        style={{ color: "#4B5563" }}
      >
        Layers
      </div>
      <ToggleRow
        label="Heatmap"
        value={toggles.heatmap}
        onChange={(v) => setToggle("heatmap", v)}
      />
      <ToggleRow
        label="Incidents"
        value={toggles.incidents}
        onChange={(v) => setToggle("incidents", v)}
      />
      <ToggleRow
        label="Safe Route"
        value={toggles.safeRoute}
        onChange={(v) => setToggle("safeRoute", v)}
      />
      <ToggleRow
        label="Live Track"
        value={toggles.liveTracking}
        onChange={(v) => setToggle("liveTracking", v)}
      />
    </div>
  );
}

