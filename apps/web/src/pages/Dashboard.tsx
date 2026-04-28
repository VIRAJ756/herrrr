import React, { useCallback, useMemo } from "react";
import { Sidebar } from "../components/layout/Sidebar";
import { TopBar } from "../components/layout/TopBar";
import { GuardianMap } from "../components/map/GuardianMap";
import { RiskScoreCard } from "../components/intel/RiskScoreCard";
import { AlertBanner } from "../components/intel/AlertBanner";
import { LayerControls } from "../components/map/LayerControls";
import { SOSButton } from "../components/sos/SOSButton";
import { ToastContainer } from "../components/layout/ToastContainer";
import { useJourneyPing } from "../hooks/useJourneyPing";
import { useZoneAlerts } from "../hooks/useZoneAlerts";
import { useSOS } from "../hooks/useSOS";
import { useVoiceActivation } from "../hooks/useVoiceActivation";
import { useToast } from "../hooks/useToast";
import { useGeolocation } from "../hooks/useGeolocation";
import { useReverseGeocoding } from "../hooks/useReverseGeocoding";
import { MobileNav } from "../components/layout/MobileNav";
import { getDemoMode } from "../services/auth";
import { DemoBanner } from "../components/layout/DemoBanner";

export default function Dashboard(props: { demo: boolean }): React.ReactElement {
  const demoMode = props.demo || getDemoMode();
  useJourneyPing(true);
  const { alert, dismiss } = useZoneAlerts();
  const { toast, toasts, dismiss: dismissToast } = useToast();
  
  const { point } = useGeolocation();
  const { location } = useReverseGeocoding(point?.lat ?? null, point?.lng ?? null);
  
  const handleSosToast = useCallback((title: string, description: string, variant: "success" | "destructive", _mode?: "simulated" | "gateway") => {
    toast({ title, description, variant });
  }, [toast]);
  
  const { confirmTrigger } = useSOS(handleSosToast);
  
  const voiceEnabled =
    typeof window !== "undefined" &&
    window.localStorage.getItem("guardian-voice-activation") === "true";
  useVoiceActivation(voiceEnabled, () => {
    void confirmTrigger();
  });

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-guardian-bg-base text-guardian-text-primary">
      {demoMode ? <DemoBanner /> : null}
      <TopBar areaLabel={location} live={true} />
      <div className="relative flex h-[calc(100vh-48px)]">
        <Sidebar />
        <main className="relative flex-1 overflow-hidden">
          <GuardianMap demo={props.demo} userLat={point?.lat} userLng={point?.lng} />

          <div className="pointer-events-none absolute left-4 top-4 z-30">
            <div className="pointer-events-auto">
              <LayerControls />
            </div>
          </div>

          <div className="pointer-events-none absolute right-4 top-4 z-40 w-[280px]">
            <div className="pointer-events-auto space-y-3">
              <AlertBanner alert={alert} onDismiss={dismiss} />
              <RiskScoreCard demo={props.demo} />
            </div>
          </div>

          <SOSButton />
        </main>
      </div>
      <MobileNav />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

