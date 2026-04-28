import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Env } from "../config/env";

let genAI: GoogleGenerativeAI | null = null;

function getGenAI(env: Env): GoogleGenerativeAI | null {
  if (!env.GEMINI_API_KEY) {
    return null;
  }
  if (!genAI) {
    genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  }
  return genAI;
}

export interface GeminiAnalysisResult {
  summary: string;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  safetyTips: string[];
}

/**
 * Analyze safety risk using Google Gemini AI.
 * Falls back to heuristic analysis if Gemini is not configured.
 */
export async function analyzeRiskWithGemini(
  env: Env,
  input: {
    lat: number;
    lng: number;
    radius: number;
    incidentCount: number;
    avgSeverity: number;
    timeOfDay?: string;
  }
): Promise<GeminiAnalysisResult | null> {
  const client = getGenAI(env);
  if (!client) {
    return null;
  }

  try {
    const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are a women's safety analysis AI. Analyze the following location risk data and provide a safety assessment.

Location: ${input.lat}, ${input.lng}
Radius: ${input.radius} meters
Time of day: ${input.timeOfDay || "unknown"}
Recent incidents nearby: ${input.incidentCount}
Average severity (1-5): ${input.avgSeverity}

Respond in this exact JSON format:
{
  "summary": "Brief 1-2 sentence risk summary",
  "riskLevel": "LOW|MEDIUM|HIGH|CRITICAL",
  "safetyTips": ["Tip 1", "Tip 2", "Tip 3"]
}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as GeminiAnalysisResult;
      return parsed;
    }

    return null;
  } catch (error) {
    console.error("[Gemini Analysis Error]", error);
    return null;
  }
}

/**
 * Get safe route recommendations using Gemini AI.
 */
export async function getSafeRouteWithGemini(
  env: Env,
  input: {
    originLat: number;
    originLng: number;
    destLat: number;
    destLng: number;
    riskSegments: Array<{ lat: number; lng: number; riskScore: number }>;
  }
): Promise<string | null> {
  const client = getGenAI(env);
  if (!client) {
    return null;
  }

  try {
    const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are a route safety advisor. Analyze this route and provide brief safety guidance.

Origin: ${input.originLat}, ${input.originLng}
Destination: ${input.destLat}, ${input.destLng}
High-risk segments detected: ${input.riskSegments.length}

Provide a concise 1-2 sentence safety recommendation for this route.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("[Gemini Route Error]", error);
    return null;
  }
}
