import React from "react";
import { Link, useLocation } from "react-router-dom";

type NavItem = { to: string; label: string; short: string };

const NAV: NavItem[] = [
  { to: "/dashboard", label: "Map", short: "MAP" },
  { to: "/report", label: "Report", short: "RPT" },
  { to: "/journey", label: "Journey", short: "JNY" },
  { to: "/contacts", label: "Contacts", short: "CNT" },
  { to: "/feed", label: "Feed", short: "FED" },
  { to: "/settings", label: "Settings", short: "SET" },
];

export function Sidebar(): React.ReactElement {
  const location = useLocation();
  return (
    <aside className="flex h-full w-16 flex-col items-center justify-between border-r border-guardian-border-subtle bg-guardian-bg-void py-4">
      <div className="flex flex-col items-center gap-3">
        <div className="h-9 w-9 rounded-full border border-guardian-border-default bg-guardian-bg-surface" />
        <nav className="mt-3 flex flex-col gap-2">
          {NAV.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-label={item.label}
                className={[
                  "flex h-11 w-11 items-center justify-center rounded-md border text-xs font-mono",
                  active
                    ? "border-guardian-border-accent bg-guardian-bg-elevated text-guardian-text-primary shadow-[var(--g-glow-safe)]"
                    : "border-guardian-border-subtle bg-guardian-bg-surface text-guardian-text-secondary hover:bg-guardian-bg-elevated",
                  "focus:outline-none focus:ring-2 focus:ring-guardian-border-accent",
                ].join(" ")}
              >
                {item.short}
              </Link>
            );
          })}
        </nav>
      </div>
      <button
        type="button"
        className="relative mb-1 flex h-11 w-11 items-center justify-center rounded-md border border-guardian-border-accent bg-guardian-bg-surface text-xs font-mono text-guardian-signal-safe focus:outline-none focus:ring-2 focus:ring-guardian-border-accent"
        aria-label="I'm Safe"
      >
        SAFE
      </button>
    </aside>
  );
}

