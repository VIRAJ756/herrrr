import React from "react";
import { Link, useLocation } from "react-router-dom";

type NavItem = { to: string; label: string; icon: string };

const NAV: NavItem[] = [
  { to: "/dashboard", label: "Live Map", icon: "🗺" },
  { to: "/report", label: "Report Incident", icon: "📋" },
  { to: "/journey", label: "My Journey", icon: "🧭" },
  { to: "/contacts", label: "Contacts", icon: "👥" },
  { to: "/feed", label: "Community Feed", icon: "📡" },
  { to: "/nearby-help", label: "Nearby Help", icon: "🏥" },
  { to: "/settings", label: "Settings", icon: "⚙" },
];

export function Sidebar(): React.ReactElement {
  const location = useLocation();
  return (
    <aside 
      className="relative z-30 hidden md:flex h-full w-[200px] flex-col border-r py-4"
      style={{ 
        backgroundColor: "#0A0E17",
        borderColor: "rgba(148,163,184,0.1)"
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
                    ? "bg-[#1A2235] text-[#00E5A0] border-l-2 border-[#00E5A0]"
                    : "text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#1A2235]/50",
                  "focus:outline-none",
                ].join(" ")}
              >
                <span className="text-[20px]">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="mt-auto px-3">
        <button
          type="button"
          className="w-full rounded-md border border-[#00E5A0] bg-[#00E5A0]/10 px-3 py-2.5 text-[13px] font-mono text-[#00E5A0] hover:bg-[#00E5A0]/20 focus:outline-none focus:ring-2 focus:ring-[#00E5A0]"
          aria-label="I'm Safe"
        >
          I'M SAFE ✓
        </button>
      </div>
    </aside>
  );
}

