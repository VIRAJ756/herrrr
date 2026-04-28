import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSOSStore } from "../store/sosStore";
import { clearDemoUser, getDemoMode, getDemoUser, setDemoMode } from "../services/auth";
import { MobileNav } from "../components/layout/MobileNav";
import { DemoBanner } from "../components/layout/DemoBanner";

export default function Settings(): React.ReactElement {
  const navigate = useNavigate();
  const { fakeCallerName, setFakeCallerName } = useSOSStore();
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("guardian-voice-activation") === "true";
  });
  const [demoModeEnabled, setDemoModeEnabled] = useState<boolean>(() => getDemoMode());
  const user = getDemoUser();

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("guardian-voice-activation", String(voiceEnabled));
  }, [voiceEnabled]);
  useEffect(() => {
    setDemoMode(demoModeEnabled);
  }, [demoModeEnabled]);

  return (
    <main className="min-h-screen bg-guardian-bg-base pb-16 text-guardian-text-primary">
      <DemoBanner />
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="text-xs font-mono tracking-widest text-guardian-text-secondary">
          SETTINGS
        </div>
        <div className="mt-4 rounded-xl border border-guardian-border-subtle bg-guardian-bg-surface p-5">
          <div className="text-sm text-guardian-text-secondary">
            Profile + fake-call customization + notification permissions.
          </div>
          <div className="mt-4 grid gap-4">
            <label className="block">
              <div className="mb-2 text-xs font-mono tracking-widest text-guardian-text-secondary">
                FAKE CALLER NAME
              </div>
              <input
                value={fakeCallerName}
                onChange={(event) => setFakeCallerName(event.target.value)}
                className="w-full rounded-md border border-guardian-border-subtle bg-guardian-bg-base p-3 text-sm outline-none focus:ring-2 focus:ring-guardian-border-accent"
              />
            </label>
            <button
              type="button"
              role="switch"
              aria-checked={voiceEnabled}
              onClick={() => setVoiceEnabled((value) => !value)}
              className="flex items-center justify-between rounded-md border border-guardian-border-subtle bg-guardian-bg-base px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-guardian-border-accent"
            >
              <span>Voice activation: “Hey Guardian, SOS”</span>
              <span className="font-mono text-guardian-text-secondary">
                {voiceEnabled ? "ON" : "OFF"}
              </span>
            </button>
            <button
              type="button"
              role="switch"
              aria-checked={demoModeEnabled}
              onClick={() => setDemoModeEnabled((value) => !value)}
              className="flex items-center justify-between rounded-md border border-guardian-border-subtle bg-guardian-bg-base px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-guardian-border-accent"
            >
              <span>Demo mode</span>
              <span className="font-mono text-guardian-text-secondary">
                {demoModeEnabled ? "ON" : "OFF"}
              </span>
            </button>
            <div className="rounded-md border border-guardian-border-subtle bg-guardian-bg-base p-4">
              <div className="text-xs font-mono tracking-widest text-guardian-text-secondary">
                ACCOUNT
              </div>
              <div className="mt-2 text-sm">{user?.name ?? "Demo User"}</div>
              <div className="text-sm text-guardian-text-secondary">
                {user?.email ?? "demo@guardian.app"}
              </div>
              <button
                type="button"
                onClick={() => {
                  clearDemoUser();
                  navigate("/login");
                }}
                className="mt-3 w-full rounded-md border border-red-500/60 px-4 py-3 text-sm font-semibold text-red-300"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
      <MobileNav />
    </main>
  );
}

