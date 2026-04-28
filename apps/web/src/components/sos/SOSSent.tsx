import React, { useEffect } from "react";
import { useSOSStore } from "../../store/sosStore";
import { useToast } from "../../hooks/useToast";

export function SOSSent(): React.ReactElement {
  const { setStage } = useSOSStore();
  const { toast } = useToast();

  useEffect(() => {
    // Show toast on mount
    toast({
      title: "SOS Sent — Help is on the way",
      description: "Emergency alert sent to your contacts",
      variant: "success",
    });

    // Auto-dismiss toast after 4 seconds
    const timer = setTimeout(() => {
      // Toast will auto-dismiss via its own logic
    }, 4000);

    return () => clearTimeout(timer);
  }, [toast]);

  const handleCancel = () => {
    setStage("IDLE");
    toast({
      title: "Alert cancelled — Stay safe",
      description: "You have cancelled the emergency alert",
      variant: "success",
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(20, 0, 0, 0.92)" }}
      role="alert"
      aria-live="assertive"
    >
      <div className="mx-auto max-w-md px-6 text-center">
        <div className="text-6xl mb-6">🚨</div>
        <h1 className="text-3xl font-bold text-[#FF3B5C] mb-4">EMERGENCY ALERT SENT</h1>
        <p className="text-lg text-gray-300 mb-2">Your location has been shared with your emergency contacts</p>
        <p className="text-lg text-gray-300 mb-8">SMS notifications sent to your trusted contacts</p>
        
        <button
          type="button"
          onClick={handleCancel}
          className="w-full rounded-md border-2 border-green-500 bg-green-900/30 px-6 py-4 text-lg font-mono text-green-100 hover:bg-green-900/50 focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          I'M SAFE — Cancel Alert
        </button>
      </div>
    </div>
  );
}
