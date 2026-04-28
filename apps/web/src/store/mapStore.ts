import { create } from "zustand";

export type MapLayerToggles = {
  heatmap: boolean;
  incidents: boolean;
  safeRoute: boolean;
  liveTracking: boolean;
};

type MapState = {
  toggles: MapLayerToggles;
  setToggle: (key: keyof MapLayerToggles, value: boolean) => void;
};

export const useMapStore = create<MapState>((set) => ({
  toggles: {
    heatmap: true,
    incidents: true,
    safeRoute: false,
    liveTracking: true,
  },
  setToggle: (key, value) =>
    set((s) => ({
      toggles: { ...s.toggles, [key]: value },
    })),
}));

