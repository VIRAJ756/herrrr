import React, { useMemo } from "react";
import { Sidebar } from "../components/layout/Sidebar";
import { TopBar } from "../components/layout/TopBar";
import { GuardianMap } from "../components/map/GuardianMap";
import { RiskScoreCard } from "../components/intel/RiskScoreCard";
import { AlertBanner } from "../components/intel/AlertBanner";
import { LayerControls } from "../components/map/LayerControls";
import { SOSButton } from "../components/sos/SOSButton";
import { useJourneyPing } from "../hooks/useJourneyPing";
import { useZoneAlerts } from "../hooks/useZoneAlerts";

export default function Dashboard(props: { demo: boolean }): React.ReactElement {
  const areaLabel = useMemo(() => "Bengaluru, KA", []);
  useJourneyPing(true);
  const { alert, dismiss } = useZoneAlerts();

  return (
    <div className="h-screen w-screen overflow-hidden bg-guardian-bg-base text-guardian-text-primary">
      <TopBar areaLabel={areaLabel} live={true} />
      <div className="flex h-[calc(100vh-48px)]">
        <Sidebar />
        <main className="relative flex-1">
          <GuardianMap demo={props.demo} />

          <div className="pointer-events-none absolute left-4 top-4 z-20">
            <div className="pointer-events-auto">
              <LayerControls />
            </div>
          </div>

          <div className="pointer-events-none absolute right-4 top-4 z-20 w-[280px]">
            <div className="pointer-events-auto space-y-3">
              <AlertBanner alert={alert} onDismiss={dismiss} />
              <RiskScoreCard demo={props.demo} />
            </div>
          </div>

          <div className="pointer-events-none absolute bottom-7 left-1/2 z-20 -translate-x-1/2">
            <div className="pointer-events-auto">
              <SOSButton />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

