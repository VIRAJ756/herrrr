import React, { Suspense, lazy } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

const Landing = lazy(() => import("./pages/Landing"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ReportIncident = lazy(() => import("./pages/ReportIncident"));
const JourneyShare = lazy(() => import("./pages/JourneyShare"));
const Contacts = lazy(() => import("./pages/Contacts"));
const CommunityFeed = lazy(() => import("./pages/CommunityFeed"));
const Settings = lazy(() => import("./pages/Settings"));

function LoadingShell(): React.ReactElement {
  return (
    <div className="min-h-screen bg-guardian-bg-base text-guardian-text-primary">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="text-sm font-mono text-guardian-text-secondary">
          GUARDIAN / Loading…
        </div>
      </div>
    </div>
  );
}

export default function App(): React.ReactElement {
  const location = useLocation();
  const isDemo = new URLSearchParams(location.search).get("demo") === "true";

  return (
    <Suspense fallback={<LoadingShell />}>
      <Routes>
        <Route path="/" element={<Landing demo={isDemo} />} />
        <Route path="/dashboard" element={<Dashboard demo={isDemo} />} />
        <Route path="/report" element={<ReportIncident />} />
        <Route path="/journey" element={<JourneyShare demo={isDemo} />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/feed" element={<CommunityFeed />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
