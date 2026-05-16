import React, { useEffect, useState } from "react";

export function NetworkBanner(): React.ReactElement | null {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [justReturnedOnline, setJustReturnedOnline] = useState(false);

  useEffect(() => {
    const handleOffline = () => {
      setIsOffline(true);
      setJustReturnedOnline(false);
    };

    const handleOnline = () => {
      setIsOffline(false);
      setJustReturnedOnline(true);
      setTimeout(() => {
        setJustReturnedOnline(false);
      }, 3000);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (isOffline) {
    return (
      <div className="sticky top-0 z-[100] bg-red-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-md">
        ⚡ Offline Mode — SOS & location active. Alerts will send when reconnected.
      </div>
    );
  }

  if (justReturnedOnline) {
    return (
      <div className="sticky top-0 z-[100] bg-green-500 px-3 py-2 text-center text-sm font-semibold text-white shadow-md transition-opacity duration-500">
        ✓ Back online — queued alerts sent.
      </div>
    );
  }

  return null;
}
