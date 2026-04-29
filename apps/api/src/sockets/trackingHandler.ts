import type { Server as SocketIOServer, Socket } from "socket.io";
import { z } from "zod";
import type { Env } from "../config/env";
import { getNearbyRiskZones } from "../services/riskEngine";
import { prisma } from "../prisma/client";

const JourneyStartSchema = z.object({
  userId: z.string().optional(),
  startLat: z.number().finite().min(-90).max(90),
  startLng: z.number().finite().min(-180).max(180),
  destLat: z.number().finite().min(-90).max(90).optional(),
  destLng: z.number().finite().min(-180).max(180).optional(),
  destination: z.string().optional(),
  eta: z.string().optional(),
});

const JourneyPingSchema = z.object({
  journeyId: z.string().min(1),
  lat: z.number().finite().min(-90).max(90),
  lng: z.number().finite().min(-180).max(180),
});

const JourneyIdSchema = z.object({ journeyId: z.string().min(1) });
const recentZoneAlerts = new Map<string, number>();
const ZONE_ALERT_THRESHOLD = 0.65;
const ZONE_ALERT_COOLDOWN_MS = 30 * 60_000;

/** Journey tracking socket events (Phase 4 completion). */
export function trackingHandler(io: SocketIOServer, socket: Socket, _env: Env): void {
  socket.on("journey:start", async (payload) => {
    const parsed = JourneyStartSchema.safeParse(payload);
    if (!parsed.success) return;
    const userId = parsed.data.userId ?? "demo-user";
    if (!parsed.data.userId) {
      await prisma.user.upsert({
        where: { id: userId },
        update: {},
        create: {
          id: userId,
          name: "Stree Astra Demo User",
        },
      });
    }

    const journey = await prisma.journey.create({
      data: {
        userId,
        startLat: parsed.data.startLat,
        startLng: parsed.data.startLng,
        destLat: parsed.data.destLat,
        destLng: parsed.data.destLng,
        destination: parsed.data.destination,
        expectedETA: parsed.data.eta ? new Date(parsed.data.eta) : undefined,
      },
    });

    socket.emit("journey:started", {
      journeyId: journey.id,
      shareToken: journey.shareToken,
      startedAt: journey.startedAt,
      status: journey.status,
    });
  });

  socket.on("journey:ping", async (payload) => {
    const parsed = JourneyPingSchema.safeParse(payload);
    if (!parsed.success) return;

    await prisma.waypoint.create({
      data: {
        journeyId: parsed.data.journeyId,
        latitude: parsed.data.lat,
        longitude: parsed.data.lng,
      },
    });

    const nearbyZones = await getNearbyRiskZones(parsed.data.lat, parsed.data.lng, 500);
    const highRiskZone = nearbyZones.find((zone) => zone.riskScore > ZONE_ALERT_THRESHOLD);

    if (highRiskZone) {
      const dedupeKey = `${parsed.data.journeyId}:${highRiskZone.id}`;
      const lastAlertedAt = recentZoneAlerts.get(dedupeKey) ?? 0;
      const now = Date.now();

      if (now - lastAlertedAt > ZONE_ALERT_COOLDOWN_MS) {
        recentZoneAlerts.set(dedupeKey, now);
        socket.emit("zone:alert", {
          zoneData: {
            id: highRiskZone.id,
            latitude: highRiskZone.latitude,
            longitude: highRiskZone.longitude,
            radius: highRiskZone.radius,
            incidentCount: highRiskZone.incidentCount,
          },
          riskScore: highRiskZone.riskScore,
        });
      }
    }

    socket.emit("tracking:update", {
      journeyId: parsed.data.journeyId,
      lat: parsed.data.lat,
      lng: parsed.data.lng,
      timestamp: new Date().toISOString(),
    });

    io.emit("tracking:update", {
      journeyId: parsed.data.journeyId,
      lat: parsed.data.lat,
      lng: parsed.data.lng,
      timestamp: new Date().toISOString(),
    });
  });

  socket.on("journey:complete", async (payload) => {
    const parsed = JourneyIdSchema.safeParse(payload);
    if (!parsed.success) return;
    await prisma.journey.update({
      where: { id: parsed.data.journeyId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });
    recentZoneAlerts.delete(parsed.data.journeyId);
    socket.emit("journey:completed", { journeyId: parsed.data.journeyId });
  });
}

