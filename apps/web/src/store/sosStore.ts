import { create } from "zustand";

export type SOSStage = "IDLE" | "COUNTDOWN" | "ACTIVE" | "FAKE_CALL";

type SOSState = {
  stage: SOSStage;
  countdownSeconds: number;
  activeAlertId?: string;
  setStage: (s: SOSStage) => void;
  setCountdown: (n: number) => void;
  setActiveAlertId: (id?: string) => void;
};

export const useSOSStore = create<SOSState>((set) => ({
  stage: "IDLE",
  countdownSeconds: 3,
  activeAlertId: undefined,
  setStage: (stage) => set({ stage }),
  setCountdown: (countdownSeconds) => set({ countdownSeconds }),
  setActiveAlertId: (activeAlertId) => set({ activeAlertId }),
}));

