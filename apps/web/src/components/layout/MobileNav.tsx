import React from "react";
import { Link, useLocation } from "react-router-dom";

const NAV = [
  { to: "/feed", label: "Home", icon: "⌂" },
  { to: "/incidents", label: "Alerts", icon: "⚠" },
  { to: "/contacts", label: "Guardians", icon: "👥" },
  { to: "/dashboard", label: "Dashboard", icon: "📊" },
  { to: "/settings", label: "Profile", icon: "⚙" },
];

export function MobileNav(): React.ReactElement {
  const location = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#111827] md:hidden">
      <div className="grid grid-cols-5">
        {NAV.map((item) => {
          const active = location.pathname === item.to || (item.to === "/dashboard" && location.pathname === "/");
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex min-h-12 flex-col items-center justify-center py-2 text-[11px] ${active ? "text-cyan-400" : "text-slate-400"}`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

