import { Router } from "express";
import { getRiskZones } from "../services/riskEngine";
import type * as GeoJSON from "geojson";

type HeatmapFeatureCollection = GeoJSON.FeatureCollection<
  GeoJSON.Point,
  { zoneId: string; riskScore: number; incidentCount: number; radius: number }
>;

function toHeatmap(
  zones: { id: string; latitude: number; longitude: number; riskScore: number; incidentCount: number; radius: number }[],
): HeatmapFeatureCollection {
  return {
    type: "FeatureCollection",
    features: zones.map((z) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [z.longitude, z.latitude] },
      properties: {
        zoneId: z.id,
        riskScore: z.riskScore,
        incidentCount: z.incidentCount,
        radius: z.radius,
      },
    })),
  };
}

const FALLBACK_DEMO_ZONES = [
  { id: "demo-koramangala", latitude: 12.9352, longitude: 77.6245, riskScore: 0.78, incidentCount: 7, radius: 220 },
  { id: "demo-mg-road", latitude: 12.9753, longitude: 77.605, riskScore: 0.66, incidentCount: 5, radius: 210 },
  { id: "demo-indiranagar", latitude: 12.9789, longitude: 77.637, riskScore: 0.52, incidentCount: 4, radius: 200 },
  { id: "demo-whitefield", latitude: 12.9698, longitude: 77.7499, riskScore: 0.33, incidentCount: 3, radius: 190 },
  { id: "demo-yeshwanthpur", latitude: 13.028, longitude: 77.554, riskScore: 0.24, incidentCount: 2, radius: 180 },
];

/** Risk zones + aggregation routes. */
export function zonesRouter(): Router {
  const r = Router();

  r.get("/heatmap", async (_req, res, next) => {
    try {
      const zones = await getRiskZones();
      const zonesOrFallback = zones.length > 0 ? zones : FALLBACK_DEMO_ZONES;
      res.json(toHeatmap(zonesOrFallback));
    } catch (e) {
      next(e);
    }
  });

  return r;
}

