import React, { Suspense, lazy } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { isLoggedIn, setDemoMode } from "./services/auth";

const Landing = lazy(() => import("./pages/Landing"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ReportIncident = lazy(() => import("./pages/ReportIncident"));
const JourneyShare = lazy(() => import("./pages/JourneyShare"));
const Contacts = lazy(() => import("./pages/Contacts"));
const CommunityFeed = lazy(() => import("./pages/CommunityFeed"));
const NearbyHelp = lazy(() => import("./pages/NearbyHelp"));
const Settings = lazy(() => import("./pages/Settings"));
const TrackView = lazy(() => import("./pages/TrackView"));
const Login = lazy(() => import("./pages/Login"));

function LoadingShell(): React.ReactElement {
  return (
    <div className="min-h-screen bg-guardian-bg-base text-guardian-text-primary">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="text-sm font-mono text-guardian-text-secondary">
          STREE ASTRA / Loading…
        </div>
      </div>
    </div>
  );
}

export default function App(): React.ReactElement {
  const location = useLocation();
  const isDemo = new URLSearchParams(location.search).get("demo") === "true";
  if (isDemo) setDemoMode(true);
  const loggedIn = isLoggedIn();
  const protect = (node: React.ReactElement): React.ReactElement =>
    loggedIn ? node : <Navigate to="/login" replace />;

  return (
    <Suspense fallback={<LoadingShell />}>
      <Routes>
        <Route path="/" element={<Navigate to={loggedIn ? "/dashboard" : "/login"} replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/landing" element={<Landing demo={isDemo} />} />
        <Route path="/dashboard" element={protect(<Dashboard demo={isDemo} />)} />
        <Route path="/report" element={protect(<ReportIncident />)} />
        <Route path="/incidents" element={protect(<ReportIncident />)} />
        <Route path="/journey" element={protect(<JourneyShare />)} />
        <Route path="/contacts" element={protect(<Contacts />)} />
        <Route path="/feed" element={protect(<CommunityFeed />)} />
        <Route path="/nearby-help" element={protect(<NearbyHelp />)} />
        <Route path="/settings" element={protect(<Settings />)} />
        <Route path="/track/:token" element={<TrackView />} />
        <Route path="*" element={<Navigate to={loggedIn ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </Suspense>
  );
}
