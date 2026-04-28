import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma/client";

const StartJourneySchema = z.object({
  userId: z.string().optional(),
  startLat: z.number().finite().min(-90).max(90),
  startLng: z.number().finite().min(-180).max(180),
  destLat: z.number().finite().min(-90).max(90).optional(),
  destLng: z.number().finite().min(-180).max(180).optional(),
  destination: z.string().max(255).optional(),
  expectedETA: z.string().datetime().optional(),
});

const CompleteJourneySchema = z.object({
  journeyId: z.string().min(1),
});

/** Journey lifecycle endpoints. */
export function journeyRouter(): Router {
  const r = Router();

  r.post("/start", async (req, res, next) => {
    try {
      const input = StartJourneySchema.parse(req.body);
      const userId = input.userId ?? "demo-user";
      if (!input.userId) {
        await prisma.user.upsert({
          where: { id: userId },
          update: {},
          create: {
            id: userId,
            name: "Guardian Demo User",
          },
        });
      }
      const journey = await prisma.journey.create({
        data: {
          userId,
          startLat: input.startLat,
          startLng: input.startLng,
          destLat: input.destLat,
          destLng: input.destLng,
          destination: input.destination,
          expectedETA: input.expectedETA ? new Date(input.expectedETA) : undefined,
        },
      });
      res.status(201).json(journey);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: { code: "BAD_REQUEST", message: error.message } });
        return;
      }
      next(error);
    }
  });

  r.post("/complete", async (req, res, next) => {
    try {
      const input = CompleteJourneySchema.parse(req.body);
      const journey = await prisma.journey.update({
        where: { id: input.journeyId },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
        },
      });
      res.json(journey);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: { code: "BAD_REQUEST", message: error.message } });
        return;
      }
      next(error);
    }
  });

  r.get("/active", async (_req, res, next) => {
    try {
      const journey = await prisma.journey.findFirst({
        where: { status: "ACTIVE" },
        orderBy: { startedAt: "desc" },
        include: {
          waypoints: {
            orderBy: { timestamp: "desc" },
            take: 1,
          },
        },
      });
      res.json(journey);
    } catch (error) {
      next(error);
    }
  });

  r.get("/track/:token", async (req, res, next) => {
    try {
      const token = req.params.token;
      const journey = await prisma.journey.findUnique({
        where: { shareToken: token },
        include: {
          waypoints: {
            orderBy: { timestamp: "desc" },
            take: 1,
          },
        },
      });
      if (!journey) {
        res.status(404).json({ error: { code: "NOT_FOUND", message: "Journey not found." } });
        return;
      }
      res.json(journey);
    } catch (error) {
      next(error);
    }
  });

  return r;
}

