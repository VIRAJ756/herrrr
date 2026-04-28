import React from "react";
import { getDemoMode } from "../../services/auth";

export function DemoBanner(): React.ReactElement | null {
  if (!getDemoMode()) return null;
  return (
    <div className="sticky top-0 z-50 bg-amber-500 px-3 py-1 text-center text-xs font-semibold text-[#1f2937]">
      DEMO MODE
    </div>
  );
}

