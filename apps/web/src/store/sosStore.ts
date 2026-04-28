import { create } from "zustand";

export type SOSStage = "IDLE" | "COUNTDOWN" | "SENT" | "ACTIVE" | "FAKE_CALL";

type SOSState = {
  stage: SOSStage;
  countdownSeconds: number;
  activeAlertId?: string;
  fakeCallerName: string;
  sosCoordinates?: { lat: number; lng: number };
  setStage: (s: SOSStage) => void;
  setCountdown: (n: number) => void;
  setActiveAlertId: (id?: string) => void;
  setFakeCallerName: (name: string) => void;
  setSosCoordinates: (coords: { lat: number; lng: number }) => void;
};

export const useSOSStore = create<SOSState>((set) => ({
  stage: "IDLE",
  countdownSeconds: 5,
  activeAlertId: undefined,
  fakeCallerName: "Priya",
  sosCoordinates: undefined,
  setStage: (stage) => set({ stage }),
  setCountdown: (countdownSeconds) => set({ countdownSeconds }),
  setActiveAlertId: (activeAlertId) => set({ activeAlertId }),
  setFakeCallerName: (fakeCallerName) => set({ fakeCallerName }),
  setSosCoordinates: (sosCoordinates) => set({ sosCoordinates }),
}));

