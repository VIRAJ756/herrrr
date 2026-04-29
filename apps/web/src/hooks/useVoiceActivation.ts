import { useEffect } from "react";

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  }
}

export function useVoiceActivation(enabled: boolean, onTrigger: () => void): void {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    try {
      const SpeechRecognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
      if (!SpeechRecognition) return;

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = "en-US";
      recognition.onresult = (event) => {
        const lastResult = event.results[event.results.length - 1];
        const transcript = lastResult?.[0]?.transcript?.toLowerCase?.() ?? "";
        if (transcript.includes("hey stree astra") && transcript.includes("sos")) {
          onTrigger();
        }
      };
      recognition.onerror = () => {
        recognition.stop();
      };
      recognition.start();

      return () => {
        recognition.stop();
      };
    } catch {
      // Browser does not support voice recognition runtime.
      return;
    }
  }, [enabled, onTrigger]);
}

