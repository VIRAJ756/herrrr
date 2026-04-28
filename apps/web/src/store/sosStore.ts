import { create } from "zustand";

export type SOSStage = "IDLE" | "COUNTDOWN" | "SENT" | "ACTIVE" | "FAKE_CALL";

type SOSState = {
  stage: SOSStage;
  countdownSeconds: number;
  activeAlertId?: string;
  fakeCallerName: string;
  setStage: (s: SOSStage) => void;
  setCountdown: (n: number) => void;
  setActiveAlertId: (id?: string) => void;
  setFakeCallerName: (name: string) => void;
};

export const useSOSStore = create<SOSState>((set) => ({
  stage: "IDLE",
  countdownSeconds: 5,
  activeAlertId: undefined,
  fakeCallerName: "Priya",
  setStage: (stage) => set({ stage }),
  setCountdown: (countdownSeconds) => set({ countdownSeconds }),
  setActiveAlertId: (activeAlertId) => set({ activeAlertId }),
  setFakeCallerName: (fakeCallerName) => set({ fakeCallerName }),
}));

