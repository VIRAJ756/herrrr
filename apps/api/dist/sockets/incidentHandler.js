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
const IncidentNewSchema = z.object({
    userId: z.string().optional(),
    latitude: z.number().finite().min(-90).max(90),
    longitude: z.number().finite().min(-180).max(180),
    type: IncidentTypeSchema,
    description: z.string().max(1000).optional(),
    mediaUrls: z.array(z.string().url()).default([]),
    severity: z.number().int().min(1).max(5).default(1),
    isAnonymous: z.boolean().default(false),
});
/** Incident realtime creation broadcast. */
export function incidentHandler(io, socket, _env) {
    socket.on("incident:new", async (payload) => {
        const parsed = IncidentNewSchema.safeParse(payload);
        if (!parsed.success)
            return;
        const incident = await prisma.incident.create({
            data: {
                userId: parsed.data.userId,
                latitude: parsed.data.latitude,
                longitude: parsed.data.longitude,
                type: parsed.data.type,
                description: parsed.data.description,
                mediaUrls: parsed.data.mediaUrls.length ? parsed.data.mediaUrls.join(',') : null,
                severity: parsed.data.severity,
                isAnonymous: parsed.data.isAnonymous,
            },
        });
        invalidateRiskZoneCache();
        io.emit("incident:created", { incident });
    });
}
