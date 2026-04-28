import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useLang } from "../../context/LanguageContext";

const LiveMapIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
    <circle cx="12" cy="12" r="9" strokeDasharray="3 2"/>
  </svg>
);

const ReportIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="12" y1="18" x2="12" y2="12"/>
    <line x1="9" y1="15" x2="15" y2="15"/>
  </svg>
);

const JourneyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="2"/>
    <path d="M12 7v10"/>
    <path d="M8 21h8"/>
    <path d="M9 14l3 3 3-3"/>
  </svg>
);

const ContactsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const FeedIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16z"/>
  </svg>
);

const NearbyHelpIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
  </svg>
);

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);

type NavItem = { to: string; label: string; icon: React.ReactNode };

const NAV: NavItem[] = [
  { to: "/dashboard", label: "nav.map", icon: <LiveMapIcon /> },
  { to: "/report", label: "nav.report", icon: <ReportIcon /> },
  { to: "/journey", label: "nav.journey", icon: <JourneyIcon /> },
  { to: "/contacts", label: "nav.contacts", icon: <ContactsIcon /> },
  { to: "/feed", label: "nav.feed", icon: <FeedIcon /> },
  { to: "/nearby-help", label: "nav.nearby", icon: <NearbyHelpIcon /> },
  { to: "/settings", label: "nav.settings", icon: <SettingsIcon /> },
];

export function Sidebar(): React.ReactElement {
  const location = useLocation();
  const { t } = useLang();
  return (
    <aside 
      className="relative z-30 hidden md:flex h-full w-[200px] flex-col border-r py-4"
      style={{ 
        backgroundColor: "var(--c-bg-deep)",
        borderColor: "var(--c-border)"
      }}
    >
      <div className="flex flex-col gap-1 px-3">
        <div className="mb-4 flex items-center gap-2 px-2">
          <div className="h-8 w-8 rounded-full border border-gray-600 bg-gray-800" />
        </div>
        <nav className="flex flex-col gap-1">
          {NAV.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-label={item.label}
                className={[
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-[13px] font-medium transition-colors",
                  active
                    ? "bg-[var(--c-bg-item)] text-[var(--c-text-primary)] border-l-2 border-[var(--c-accent-safe)]"
                    : "text-[var(--c-text-secondary)] hover:text-[var(--c-text-primary)] hover:bg-[var(--c-bg-hover)]",
                  "focus:outline-none",
                ].join(" ")}
              >
                <span style={{ color: "currentColor" }}>{item.icon}</span>
                <span>{t(item.label)}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="mt-auto px-3">
        <button
          type="button"
          className="fixed rounded-md border border-[var(--c-accent-safe)] bg-[rgba(45,212,160,0.08)] px-3 py-2.5 text-[13px] font-mono text-[var(--c-accent-safe)] hover:bg-[rgba(45,212,160,0.12)] focus:outline-none focus:ring-2 focus:ring-[var(--c-accent-safe)]"
          style={{
            bottom: "52px",
            left: "16px",
            width: "160px"
          }}
          aria-label="I'm Safe"
        >
          {t("btn.safe")}
        </button>
      </div>
    </aside>
  );
}

