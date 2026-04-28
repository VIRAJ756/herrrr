import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)"],
        mono: ["var(--font-mono)"],
      },
      colors: {
        guardian: {
          bg: {
            void: "var(--g-bg-void)",
            base: "var(--g-bg-base)",
            surface: "var(--g-bg-surface)",
            elevated: "var(--g-bg-elevated)",
            overlay: "var(--g-bg-overlay)",
          },
          signal: {
            safe: "var(--g-signal-safe)",
            danger: "var(--g-signal-danger)",
            warn: "var(--g-signal-warn)",
            info: "var(--g-signal-info)",
          },
          text: {
            primary: "var(--g-text-primary)",
            secondary: "var(--g-text-secondary)",
            muted: "var(--g-text-muted)",
            inverse: "var(--g-text-inverse)",
          },
          risk: {
            critical: "var(--risk-critical)",
            high: "var(--risk-high)",
            medium: "var(--risk-medium)",
            low: "var(--risk-low)",
            safe: "var(--risk-safe)",
          },
          border: {
            subtle: "var(--g-border-subtle)",
            default: "var(--g-border-default)",
            accent: "var(--g-border-accent)",
          },
        },
      },
      keyframes: {
        "pulse-sos": {
          "0%": { boxShadow: "0 0 0 0 rgba(255, 59, 92, 0.7)" },
          "70%": { boxShadow: "0 0 0 20px rgba(255, 59, 92, 0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(255, 59, 92, 0)" },
        },
        "radar-sweep": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "signal-blink": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.3" },
        },
        "ping-ring": {
          "0%": { transform: "scale(1)", opacity: "0.8" },
          "100%": { transform: "scale(2.5)", opacity: "0" },
        },
      },
      animation: {
        "pulse-sos": "pulse-sos 1.4s ease-out infinite",
        "radar-sweep": "radar-sweep 2.4s linear infinite",
        "signal-blink": "signal-blink 1.2s ease-in-out infinite",
        "ping-ring": "ping-ring 1.2s ease-out infinite",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        full: "var(--radius-full)",
      },
    },
  },
  plugins: [],
} satisfies Config;

