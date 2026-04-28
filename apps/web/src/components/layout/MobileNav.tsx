import React from "react";
import { Link, useLocation } from "react-router-dom";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: "⌂" },
  { to: "/journey", label: "Journey", icon: "➜" },
  { to: "/incidents", label: "Incidents", icon: "⚠" },
  { to: "/settings", label: "Settings", icon: "⚙" },
];

export function MobileNav(): React.ReactElement {
  const location = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#111827] md:hidden">
      <div className="grid grid-cols-4">
        {NAV.map((item) => {
          const active = location.pathname === item.to;
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

