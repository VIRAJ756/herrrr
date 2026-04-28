import { Router } from "express";
import { getRiskZones } from "../services/riskEngine";

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

/** Risk zones + aggregation routes. */
export function zonesRouter(): Router {
  const r = Router();

  r.get("/heatmap", async (_req, res, next) => {
    try {
      const zones = await getRiskZones();
      res.json(toHeatmap(zones));
    } catch (e) {
      next(e);
    }
  });

  return r;
}

