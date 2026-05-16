import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma/client";
import { sendSosSmsNotifications } from "../services/notifier";
import type { Env } from "../config/env";


/** SOS REST endpoints (socket events are primary). */
export function sosRouter(env: Env): Router {
  const r = Router();
  const TriggerSchema = z.object({
    userId: z.string().min(1),
    lat: z.number().finite().min(-90).max(90),
    lng: z.number().finite().min(-180).max(180),
  });

  r.post("/trigger", async (req, res, next) => {
    try {
      const input = TriggerSchema.parse(req.body);
      const alert = await prisma.sOSAlert.create({
        data: {
          userId: input.userId,
          latitude: input.lat,
          longitude: input.lng,
        },
      });

      // Send SMS notifications
      const smsResult = await sendSosSmsNotifications({
        env,
        userId: input.userId,
        lat: input.lat,
        lng: input.lng,
      });

      res.status(201).json({
        alert,
        sms: {
          success: smsResult.success,
          sent: smsResult.sent,
          failed: smsResult.failed,
          mode: smsResult.mode,
          message: smsResult.message,
        },
      });
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

