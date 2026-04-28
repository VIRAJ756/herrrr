import { prisma } from "../prisma/client";
import { getNearbyRiskZones } from "./riskEngine";

type RiskAnalysisInput = {
  lat: number;
  lng: number;
  radius: number;
  timeOfDay?: string;
};

export type RiskAnalysisOutput = {
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  summary: string;
  predictedHotspots: { latitude: number; longitude: number; riskScore: number }[];
  safetyTips: string[];
};

type SafeRouteInput = {
  originLat: number;
  originLng: number;
  destLat: number;
  destLng: number;
};

export type SafeRouteOutput = {
  route: Array<{ lat: number; lng: number }>;
  waypoints: Array<{ lat: number; lng: number }>;
  riskSegments: Array<{ lat: number; lng: number; riskScore: number }>;
  estimatedTime: number;
};

const riskCache = new Map<string, { expiresAt: number; value: RiskAnalysisOutput }>();
const CACHE_TTL_MS = 30 * 60_000;

/** Heuristic AI-style risk analysis with incident context and 30-minute cache. */
export async function getRiskAnalysis(input: RiskAnalysisInput): Promise<RiskAnalysisOutput> {
  const cacheKey = JSON.stringify(input);
  const cached = riskCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const incidents = await prisma.incident.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const nearby = incidents.filter((incident) => {
    return distanceMeters(input.lat, input.lng, incident.latitude, incident.longitude) <= input.radius;
  });
  const zones = await getNearbyRiskZones(input.lat, input.lng, input.radius);
  const avgSeverity =
    nearby.length > 0 ? nearby.reduce((sum, incident) => sum + incident.severity, 0) / nearby.length : 0;
  const topZoneScore = zones[0]?.riskScore ?? 0;
  const blended = Math.min(1, topZoneScore * 0.7 + Math.min(1, nearby.length / 10) * 0.2 + (avgSeverity / 5) * 0.1);
  const riskLevel = toRiskLevel(blended);
  const commonTypes = summarizeTypes(nearby.map((incident) => incident.type));

  const result: RiskAnalysisOutput = {
    riskLevel,
    summary:
      nearby.length > 0
        ? `${nearby.length} recent incidents nearby. Highest concern signals: ${commonTypes}. Current zone risk is ${Math.round(
            blended * 100,
          )}%.`
        : `No dense recent incident cluster detected. Current modeled area risk is ${Math.round(
            blended * 100,
          )}% with ${zones.length > 0 ? "some nearby risk zone activity" : "limited recent activity"}.`,
    predictedHotspots: zones.slice(0, 3).map((zone) => ({
      latitude: zone.latitude,
      longitude: zone.longitude,
      riskScore: zone.riskScore,
    })),
    safetyTips: buildSafetyTips(riskLevel, nearby.length, input.timeOfDay),
  };

  riskCache.set(cacheKey, { expiresAt: Date.now() + CACHE_TTL_MS, value: result });
  return result;
}

/** Build a simple route plus risk-segment overlays from current risk zones. */
export async function getSafeRoute(input: SafeRouteInput): Promise<SafeRouteOutput> {
  const route = interpolateRoute(input.originLat, input.originLng, input.destLat, input.destLng, 6);
  const riskSegments = (
    await Promise.all(
      route.map(async (point) => {
        const nearby = await getNearbyRiskZones(point.lat, point.lng, 400);
        return {
          lat: point.lat,
          lng: point.lng,
          riskScore: nearby[0]?.riskScore ?? 0,
        };
      }),
    )
  ).filter((segment) => segment.riskScore > 0);

  return {
    route,
    waypoints: route,
    riskSegments,
    estimatedTime: Math.max(5, Math.round(distanceMeters(input.originLat, input.originLng, input.destLat, input.destLng) / 70)),
  };
}

function toRiskLevel(score: number): RiskAnalysisOutput["riskLevel"] {
  if (score >= 0.85) return "CRITICAL";
  if (score >= 0.65) return "HIGH";
  if (score >= 0.35) return "MEDIUM";
  return "LOW";
}

function summarizeTypes(types: string[]): string {
  if (types.length === 0) return "none";
  const counts = new Map<string, number>();
  for (const type of types) counts.set(type, (counts.get(type) ?? 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([type, count]) => `${type.toLowerCase().replaceAll("_", " ")} x${count}`)
    .join(", ");
}

function buildSafetyTips(
  riskLevel: RiskAnalysisOutput["riskLevel"],
  incidentCount: number,
  timeOfDay?: string,
): string[] {
  const tips = ["Keep live tracking active with at least one trusted contact."];
  if (riskLevel === "HIGH" || riskLevel === "CRITICAL") {
    tips.push("Prefer better-lit main roads and avoid isolated shortcuts.");
  }
  if (incidentCount >= 3) {
    tips.push("Stay alert near transit exits and pause in populated zones if possible.");
  }
  if (timeOfDay?.toLowerCase().includes("night")) {
    tips.push("Night conditions increase risk score in this area. Stay on active corridors.");
  }
  return tips.slice(0, 4);
}

function interpolateRoute(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number,
  steps: number,
): Array<{ lat: number; lng: number }> {
  return Array.from({ length: steps + 1 }, (_, index) => ({
    lat: startLat + ((endLat - startLat) * index) / steps,
    lng: startLng + ((endLng - startLng) * index) / steps,
  }));
}

function distanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (degrees: number): number => (degrees * Math.PI) / 180;
  const earthRadius = 6_371_000;
  const deltaLat = toRad(lat2 - lat1);
  const deltaLng = toRad(lng2 - lng1);
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(deltaLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadius * c;
}

