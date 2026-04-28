import { create } from "zustand";
import type { Journey } from "../types/journey";

type JourneyState = {
  activeJourney: Journey | null;
  setActiveJourney: (journey: Journey | null) => void;
};

export const useJourneyStore = create<JourneyState>((set) => ({
  activeJourney: null,
  setActiveJourney: (activeJourney) => set({ activeJourney }),
}));

