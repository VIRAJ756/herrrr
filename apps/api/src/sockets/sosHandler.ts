import type { Server as SocketIOServer, Socket } from "socket.io";
import { z } from "zod";
import type { Env } from "../config/env";
import { prisma } from "../prisma/client";

const TriggerSchema = z.object({
  userId: z.string().min(1),
  lat: z.number().finite().min(-90).max(90),
  lng: z.number().finite().min(-180).max(180),
});

const AlertIdSchema = z.object({ alertId: z.string().min(1) });

/** SOS socket events. */
export function sosHandler(io: SocketIOServer, socket: Socket, _env: Env): void {
  socket.on("sos:trigger", async (payload) => {
    const parsed = TriggerSchema.safeParse(payload);
    if (!parsed.success) return;

    const alert = await prisma.sOSAlert.create({
      data: {
        userId: parsed.data.userId,
        latitude: parsed.data.lat,
        longitude: parsed.data.lng,
      },
      include: { user: true },
    });

    socket.emit("sos:active", { alertId: alert.id });
    io.emit("sos:broadcast", alert);
  });

  socket.on("sos:cancel", async (payload) => {
    const parsed = AlertIdSchema.safeParse(payload);
    if (!parsed.success) return;
    await prisma.sOSAlert.update({
      where: { id: parsed.data.alertId },
      data: { status: "FALSE_ALARM", resolvedAt: new Date() },
    });
  });

  socket.on("sos:resolve", async (payload) => {
    const parsed = AlertIdSchema.safeParse(payload);
    if (!parsed.success) return;
    await prisma.sOSAlert.update({
      where: { id: parsed.data.alertId },
      data: { status: "RESOLVED", resolvedAt: new Date() },
    });
  });
}

