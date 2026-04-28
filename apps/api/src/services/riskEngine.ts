import { prisma } from "../prisma/client";

type IncidentForRisk = {
  id: string;
  latitude: number;
  longitude: number;
  severity: number;
  createdAt: Date;
  type: string;
};

export type ComputedRiskZone = {
  id: string;
  latitude: number;
  longitude: number;
  radius: number;
  riskScore: number;
  incidentCount: number;
  incidents: IncidentForRisk[];
  lastUpdated: string;
};

type RiskCache = {
  zones: ComputedRiskZone[];
  computedAtMs: number;
};

const CLUSTER_RADIUS_METERS = 200;
const ZONE_ALERT_RADIUS_METERS = 500;
const RISK_CACHE_TTL_MS = 5 * 60_000;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

let riskCache: RiskCache | null = null;

/**
 * Compute risk zones by clustering recent incidents within a 200m radius.
 * The scoring model uses recent density, 30-day density, severity, and a
 * time-of-day factor normalized to 0..1 and kept SQLite-safe by using JS only.
 */
export async function getRiskZones(options?: {
  forceRefresh?: boolean;
  now?: Date;
}): Promise<ComputedRiskZone[]> {
  const now = options?.now ?? new Date();
  const nowMs = now.getTime();

  if (!options?.forceRefresh && riskCache && nowMs - riskCache.computedAtMs < RISK_CACHE_TTL_MS) {
    return riskCache.zones;
  }

  const minCreatedAt = new Date(nowMs - THIRTY_DAYS_MS);
  const incidents = await prisma.incident.findMany({
    where: {
      createdAt: { gte: minCreatedAt },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      latitude: true,
      longitude: true,
      severity: true,
      createdAt: true,
      type: true,
    },
  });

  const zones = buildRiskZones(incidents, now);
  riskCache = {
    zones,
    computedAtMs: nowMs,
  };

  return zones;
}

/** Clear the in-memory zone cache when incidents change. */
export function invalidateRiskZoneCache(): void {
  riskCache = null;
}

/** Return zones within a given radius of a point. */
export async function getNearbyRiskZones(
  lat: number,
  lng: number,
  radiusMeters = ZONE_ALERT_RADIUS_METERS,
): Promise<ComputedRiskZone[]> {
  const zones = await getRiskZones();
  return zones.filter(
    (zone) => haversineMeters(lat, lng, zone.latitude, zone.longitude) <= radiusMeters,
  );
}

/** Build zones from incidents using a greedy geospatial grouping pass. */
export function buildRiskZones(incidents: IncidentForRisk[], now: Date): ComputedRiskZone[] {
  const remaining = [...incidents];
  const zones: ComputedRiskZone[] = [];

  while (remaining.length > 0) {
    const seed = remaining.shift();
    if (!seed) break;

    const cluster: IncidentForRisk[] = [seed];
    for (let i = remaining.length - 1; i >= 0; i -= 1) {
      const candidate = remaining[i];
      if (
        haversineMeters(seed.latitude, seed.longitude, candidate.latitude, candidate.longitude) <=
        CLUSTER_RADIUS_METERS
      ) {
        cluster.push(candidate);
        remaining.splice(i, 1);
      }
    }

    const center = centroid(cluster);
    const score = scoreCluster(cluster, now);
    zones.push({
      id: `zone-${cluster[0].id}`,
      latitude: center.latitude,
      longitude: center.longitude,
      radius: CLUSTER_RADIUS_METERS,
      riskScore: score,
      incidentCount: cluster.length,
      incidents: cluster,
      lastUpdated: now.toISOString(),
    });
  }

  return zones.sort((a, b) => b.riskScore - a.riskScore);
}

function scoreCluster(cluster: IncidentForRisk[], now: Date): number {
  const nowMs = now.getTime();

  let weighted30d = 0;
  let weighted7d = 0;
  let severityNumerator = 0;
  let severityWeightDenominator = 0;

  for (const incident of cluster) {
    const ageMs = Math.max(0, nowMs - incident.createdAt.getTime());
    const ageDays = ageMs / (24 * 60 * 60 * 1000);
    const decay30d = Math.exp(-ageDays / 14);
    const decay7d = Math.exp(-ageDays / 3);
    const normalizedSeverity = clamp(incident.severity / 5, 0, 1);

    weighted30d += decay30d;
    if (ageMs <= SEVEN_DAYS_MS) {
      weighted7d += decay7d;
    }

    severityNumerator += normalizedSeverity * decay30d;
    severityWeightDenominator += decay30d;
  }

  const density30d = clamp(weighted30d / 6, 0, 1);
  const density7d = clamp(weighted7d / 4, 0, 1);
  const severityAverage =
    severityWeightDenominator > 0 ? clamp(severityNumerator / severityWeightDenominator, 0, 1) : 0;
  const densityFactor = clamp(cluster.length / 5, 0, 1);
  const timeOfDayFactor = getTimeOfDayFactor(now);

  const score =
    density30d * 0.28 +
    density7d * 0.27 +
    severityAverage * 0.2 +
    densityFactor * 0.15 +
    timeOfDayFactor * 0.1;

  return clamp(score, 0, 1);
}

function getTimeOfDayFactor(now: Date): number {
  const hour = now.getHours();
  if (hour >= 22 || hour < 5) return 1;
  if (hour >= 19 || hour < 7) return 0.7;
  if (hour >= 17) return 0.45;
  return 0.2;
}

function centroid(cluster: IncidentForRisk[]): { latitude: number; longitude: number } {
  const totals = cluster.reduce(
    (acc, incident) => {
      acc.latitude += incident.latitude;
      acc.longitude += incident.longitude;
      return acc;
    },
    { latitude: 0, longitude: 0 },
  );

  return {
    latitude: totals.latitude / cluster.length,
    longitude: totals.longitude / cluster.length,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
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

