import React from "react";
import { useSOS } from "../../hooks/useSOS";
import { useToast } from "../../hooks/useToast";

export function SOSCountdown(): React.ReactElement {
  const { countdownSeconds, cancel } = useSOS();
  const { toast } = useToast();

  const handleCancel = () => {
    cancel();
    toast({
      title: "SOS Cancelled — You are safe",
      description: "Emergency activation cancelled",
      variant: "success",
    });
    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      // Toast will auto-dismiss via its own logic
    }, 3000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.85)" }}
      role="dialog"
      aria-label="SOS countdown"
    >
      <div className="mx-auto w-full max-w-sm px-6 text-center">
        <div className="text-[96px] font-bold tabular-nums" style={{ color: "#FF3B5C" }}>
          {countdownSeconds}
        </div>
        <div className="mt-4 text-lg text-gray-300">SOS activating... tap cancel to stop</div>
        <button
          type="button"
          className="mt-8 w-full rounded-md border-2 border-white bg-transparent px-6 py-4 text-lg font-mono text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50"
          onClick={handleCancel}
        >
          CANCEL
        </button>
      </div>
    </div>
  );
}

