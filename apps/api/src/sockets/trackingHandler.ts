import type { Server as SocketIOServer, Socket } from "socket.io";
import { z } from "zod";
import type { Env } from "../config/env";
import { getNearbyRiskZones } from "../services/riskEngine";

const JourneyStartSchema = z.object({
  userId: z.string().min(1),
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
  socket.on("journey:start", (payload) => {
    const parsed = JourneyStartSchema.safeParse(payload);
    if (!parsed.success) return;
    socket.emit("journey:started", { ok: true });
  });

  socket.on("journey:ping", async (payload) => {
    const parsed = JourneyPingSchema.safeParse(payload);
    if (!parsed.success) return;

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

  socket.on("journey:complete", (payload) => {
    const parsed = JourneyIdSchema.safeParse(payload);
    if (!parsed.success) return;
    socket.emit("journey:completed", { journeyId: parsed.data.journeyId });
  });
}

