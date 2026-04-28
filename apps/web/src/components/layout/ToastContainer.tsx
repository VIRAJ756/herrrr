import React, { useEffect, useState } from "react";
import type { Toast } from "../../hooks/useToast";

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps): React.ReactElement | null {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 z-[100] -translate-x-1/2 flex flex-col gap-2 w-full max-w-[320px]">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const duration = toast.variant === "success" ? 4000 : 3000;
    const interval = 50;
    const step = 100 / (duration / interval);
    
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= step) {
          clearInterval(timer);
          onDismiss(toast.id);
          return 0;
        }
        return prev - step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [toast.id, toast.variant, onDismiss]);

  const borderColor = toast.variant === "success" ? "#22C55E" : "#FF3B5C";
  const icon = toast.variant === "success" ? "✓" : "🚨";

  return (
    <div
      className="rounded-lg p-4 animate-[slide-in_300ms_ease-out]"
      style={{ 
        backgroundColor: "#0F1520",
        border: `1px solid ${borderColor}`,
        boxShadow: "none"
      }}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <span className="text-lg">{icon}</span>
        <div className="flex-1">
          <div className="font-semibold text-sm" style={{ color: "#E2E8F0" }}>{toast.title}</div>
          {toast.description && (
            <div className="mt-1 text-xs" style={{ color: "#94A3B8" }}>{toast.description}</div>
          )}
        </div>
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className="rounded p-1 opacity-70 hover:opacity-100 focus:outline-none"
          style={{ color: "#94A3B8" }}
          aria-label="Dismiss"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <div 
        className="mt-3 h-1 rounded-full overflow-hidden"
        style={{ backgroundColor: "rgba(148,163,184,0.2)" }}
      >
        <div 
          className="h-full transition-all duration-50 ease-linear"
          style={{ 
            width: `${progress}%`,
            backgroundColor: borderColor
          }}
        />
      </div>
    </div>
  );
}
