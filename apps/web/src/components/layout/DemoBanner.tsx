import React from "react";
import { getDemoMode } from "../../services/auth";

export function DemoBanner(): React.ReactElement | null {
  if (!getDemoMode()) return null;
  return (
    <div className="sticky top-0 z-50 bg-amber-500 px-3 py-2 text-center text-sm font-semibold text-[#1f2937] shadow-md">
      🎭 Demo Mode — Simulated incidents and journey data loaded
    </div>
  );
}

