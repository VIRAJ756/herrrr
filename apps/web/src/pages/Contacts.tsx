import React from "react";

export default function Contacts(): React.ReactElement {
  return (
    <main className="min-h-screen bg-guardian-bg-base text-guardian-text-primary">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="text-xs font-mono tracking-widest text-guardian-text-secondary">
          TRUSTED CONTACTS
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {["Asha", "Riya", "Karthik", "Meera"].map((name) => (
            <div
              key={name}
              className="rounded-xl border border-guardian-border-subtle bg-guardian-bg-surface p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">{name}</div>
                  <div className="text-xs text-guardian-text-secondary">Emergency contact</div>
                </div>
                <button
                  type="button"
                  className="rounded-md border border-guardian-border-default bg-guardian-bg-elevated px-3 py-2 text-xs font-mono text-guardian-text-primary focus:outline-none focus:ring-2 focus:ring-guardian-border-accent"
                >
                  TEST ALERT
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

