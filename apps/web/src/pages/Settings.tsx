import React from "react";

export default function Settings(): React.ReactElement {
  return (
    <main className="min-h-screen bg-guardian-bg-base text-guardian-text-primary">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="text-xs font-mono tracking-widest text-guardian-text-secondary">
          SETTINGS
        </div>
        <div className="mt-4 rounded-xl border border-guardian-border-subtle bg-guardian-bg-surface p-5">
          <div className="text-sm text-guardian-text-secondary">
            Profile + fake-call customization + notification permissions will live here.
          </div>
        </div>
      </div>
    </main>
  );
}

