import React, { useEffect, useState } from "react";
import { useToast } from "../../hooks/useToast";

export function StatusBar(): React.ReactElement {
  const [battery, setBattery] = useState<number | null>(null);
  const [network, setNetwork] = useState<{ type: string; rtt: number; signal: number } | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [batteryWarningShown, setBatteryWarningShown] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Battery API
    const getBattery = async () => {
      if ('getBattery' in navigator) {
        try {
          const battery = await (navigator as any).getBattery();
          const level = Math.round(battery.level * 100);
          setBattery(level);
          
          // Show warning if battery < 30% and not shown yet
          if (level < 30 && !batteryWarningShown) {
            const shown = sessionStorage.getItem('battery-warning-shown');
            if (!shown) {
              toast({
                title: "⚡ Battery at " + level + "% — Charge soon for uninterrupted safety tracking",
                description: "",
                variant: "destructive",
              });
              sessionStorage.setItem('battery-warning-shown', 'true');
              setBatteryWarningShown(true);
            }
          }
        } catch (e) {
          console.error("Battery API error:", e);
        }
      }
    };

    // Network API
    const getNetworkInfo = () => {
      const conn = (navigator as any).connection;
      if (conn) {
        setNetwork({ 
          type: conn.effectiveType || 'Unknown', 
          rtt: conn.rtt || 0,
          signal: conn.downlink || 0
        });
      }
    };

    getBattery();
    getNetworkInfo();

    // Listen for online/offline
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [batteryWarningShown, toast]);

  const getBatteryColor = () => {
    if (battery === null) return "var(--c-text-muted)";
    if (battery < 20) return "var(--c-accent-danger)";
    if (battery < 50) return "var(--c-accent-warn)";
    return "var(--c-accent-safe)";
  };

  const getBatteryBars = () => {
    if (battery === null) return '';
    const bars = Math.ceil(battery / 25);
    return '█'.repeat(bars) + '░'.repeat(4 - bars);
  };

  const getSignalBars = () => {
    if (!network) return '░░░░';
    const signal = network.signal || 0;
    if (signal > 5) return '▇▅▃▁';
    if (signal > 2) return '▅▃▁░';
    if (signal > 1) return '▃▁░░';
    return '▁░░░';
  };

  const getNetworkType = () => {
    if (!network) return '';
    if (network.type === '4g') return '4G';
    if (network.type === 'wifi') return 'WiFi';
    if (network.type === '3g') return '3G';
    if (network.type === '2g') return '2G';
    return network.type.toUpperCase();
  };

  return (
    <div
      className="fixed left-0 right-0 z-50 flex items-center"
      style={{
        bottom: 0,
        height: "36px",
        backgroundColor: "var(--c-bg-deep)",
        borderTop: "1px solid var(--c-border)",
        fontSize: "13px",
        fontFamily: "monospace",
        color: "var(--c-text-muted)",
        justifyContent: "flex-start",
        alignItems: "center",
        gap: "24px",
        padding: "0 20px"
      }}
    >
      {/* Battery */}
      {battery !== null && (
        <div className="flex items-center gap-2" style={{ color: getBatteryColor() }}>
          <span style={{ fontFamily: "monospace", fontWeight: "bold" }}>{battery}%</span>
          <span style={{ fontFamily: "monospace", color: getBatteryColor() }}>{getBatteryBars()}</span>
        </div>
      )}

      {/* Network */}
      {network && (
        <div className="flex items-center gap-2">
          <span style={{ fontFamily: "monospace" }}>{getSignalBars()}</span>
          <span style={{ fontFamily: "monospace" }}>{getNetworkType()}</span>
          <span style={{ fontFamily: "monospace" }}>{network.rtt}ms</span>
        </div>
      )}

      {/* Online/Offline */}
      <div className="flex items-center gap-2">
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: isOnline ? "var(--c-accent-safe)" : "var(--c-accent-danger)" }}
        />
        <span style={{ fontFamily: "monospace" }}>{isOnline ? "Online" : "Offline"}</span>
      </div>
    </div>
  );
}
