import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma/client";
import { invalidateRiskZoneCache } from "../services/riskEngine";

const IncidentTypeSchema = z.enum([
  "HARASSMENT",
  "STALKING",
  "ASSAULT",
  "THEFT",
  "POOR_LIGHTING",
  "ISOLATED_AREA",
  "SUSPICIOUS_ACTIVITY",
  "OTHER",
]);

const CreateIncidentSchema = z.object({
  latitude: z.number().finite().min(-90).max(90),
  longitude: z.number().finite().min(-180).max(180),
  type: IncidentTypeSchema,
  description: z.string().max(1000).optional(),
  mediaUrls: z.array(z.string().url()).default([]),
  severity: z.number().int().min(1).max(5).default(1),
  isAnonymous: z.boolean().default(false),
  userId: z.string().uuid().optional(),
});

/** Incident CRUD routes. */
export function incidentsRouter(): Router {
  const r = Router();

  r.get("/", async (_req, res, next) => {
    try {
      const incidents = await prisma.incident.findMany({
        orderBy: { createdAt: "desc" },
        take: 200,
      });
      res.json(incidents);
    } catch (e) {
      next(e);
    }
  });

  r.post("/", async (req, res, next) => {
    try {
      const input = CreateIncidentSchema.parse(req.body);
      const created = await prisma.incident.create({
        data: {
          userId: input.userId,
          latitude: input.latitude,
          longitude: input.longitude,
          type: input.type,
          description: input.description,
          mediaUrls: null,
          severity: input.severity,
          isAnonymous: input.isAnonymous,
        },
      });
      invalidateRiskZoneCache();
      res.status(201).json(created);
    } catch (e) {
      if (e instanceof z.ZodError) {
        res.status(400).json({ error: { code: "BAD_REQUEST", message: e.message } });
        return;
      }
      next(e);
    }
  });

  return r;
}

