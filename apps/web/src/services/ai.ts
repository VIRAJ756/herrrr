import { api } from "./api";

export type RiskAnalysisResponse = {
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  summary: string;
  predictedHotspots: { latitude: number; longitude: number; riskScore: number }[];
  safetyTips: string[];
};

export type SafeRouteResponse = {
  route: Array<{ lat: number; lng: number }>;
  waypoints: Array<{ lat: number; lng: number }>;
  riskSegments: Array<{ lat: number; lng: number; riskScore: number }>;
  estimatedTime: number;
};

export async function fetchRiskAnalysis(payload: {
  lat: number;
  lng: number;
  radius: number;
  timeOfDay?: string;
}): Promise<RiskAnalysisResponse> {
  const response = await api.post<RiskAnalysisResponse>("/ai/risk-analysis", payload);
  return response.data;
}

export async function fetchSafeRoute(payload: {
  originLat: number;
  originLng: number;
  destLat: number;
  destLng: number;
}): Promise<SafeRouteResponse> {
  const response = await api.post<SafeRouteResponse>("/ai/safe-route", payload);
  return response.data;
}

