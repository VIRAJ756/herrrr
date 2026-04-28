import { Router } from "express";
import { z } from "zod";
import { getRiskAnalysis, getSafeRoute } from "../services/aiPredictor";

const RiskAnalysisSchema = z.object({
  lat: z.number().finite().min(-90).max(90),
  lng: z.number().finite().min(-180).max(180),
  radius: z.number().positive().max(5000),
  timeOfDay: z.string().optional(),
});

const SafeRouteSchema = z.object({
  originLat: z.number().finite().min(-90).max(90),
  originLng: z.number().finite().min(-180).max(180),
  destLat: z.number().finite().min(-90).max(90),
  destLng: z.number().finite().min(-180).max(180),
});

/** AI-style analysis routes. */
export function aiRouter(): Router {
  const r = Router();

  r.post("/risk-analysis", async (req, res, next) => {
    try {
      const input = RiskAnalysisSchema.parse(req.body);
      res.json(await getRiskAnalysis(input));
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: { code: "BAD_REQUEST", message: error.message } });
        return;
      }
      next(error);
    }
  });

  r.post("/safe-route", async (req, res, next) => {
    try {
      const input = SafeRouteSchema.parse(req.body);
      res.json(await getSafeRoute(input));
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: { code: "BAD_REQUEST", message: error.message } });
        return;
      }
      next(error);
    }
  });

  return r;
}

