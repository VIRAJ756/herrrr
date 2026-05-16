import { Router } from "express";
import { z } from "zod";
import { getRiskAnalysis, getSafeRoute } from "../services/aiPredictor";
import { analyzeRiskWithGemini, getSafeRouteWithGemini } from "../services/geminiService";
const RiskAnalysisSchema = z.object({
    lat: z.number().finite().min(-90).max(90),
    lng: z.number().finite().min(-180).max(180),
    radius: z.number().positive().max(5000),
    timeOfDay: z.string().optional(),
});
const SafeRouteSchema = z.object({
    originLat: z.number().finite().min(-90).max(90),
    originLng: z.number().finite().min(-180).max(180),
    destLat: z.number().finite().min(-90).max(90),
    destLng: z.number().finite().min(-180).max(180),
});
/** AI-style analysis routes with Gemini integration. */
export function aiRouter(env) {
    const r = Router();
    r.post("/risk-analysis", async (req, res, next) => {
        try {
            const input = RiskAnalysisSchema.parse(req.body);
            // Get base analysis from heuristic engine
            const baseAnalysis = await getRiskAnalysis(input);
            // Try to enhance with Gemini if available
            const geminiResult = await analyzeRiskWithGemini(env, {
                lat: input.lat,
                lng: input.lng,
                radius: input.radius,
                incidentCount: baseAnalysis.predictedHotspots.length,
                avgSeverity: baseAnalysis.riskLevel === "CRITICAL" ? 4.5 : baseAnalysis.riskLevel === "HIGH" ? 3.5 : 2,
                timeOfDay: input.timeOfDay,
            });
            // Merge Gemini results if available, keeping same response format
            if (geminiResult) {
                res.json({
                    ...baseAnalysis,
                    summary: geminiResult.summary || baseAnalysis.summary,
                    safetyTips: geminiResult.safetyTips.length > 0 ? geminiResult.safetyTips : baseAnalysis.safetyTips,
                    _enhanced: "gemini",
                });
            }
            else {
                res.json({
                    ...baseAnalysis,
                    _enhanced: "heuristic",
                });
            }
        }
        catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ error: { code: "BAD_REQUEST", message: error.message } });
                return;
            }
            next(error);
        }
    });
    r.post("/safe-route", async (req, res, next) => {
        try {
            const input = SafeRouteSchema.parse(req.body);
            // Get base route analysis
            const baseRoute = await getSafeRoute(input);
            // Try to enhance with Gemini if available
            const geminiInsight = await getSafeRouteWithGemini(env, {
                originLat: input.originLat,
                originLng: input.originLng,
                destLat: input.destLat,
                destLng: input.destLng,
                riskSegments: baseRoute.riskSegments,
            });
            res.json({
                ...baseRoute,
                aiInsight: geminiInsight || undefined,
                _enhanced: geminiInsight ? "gemini" : "heuristic",
            });
        }
        catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ error: { code: "BAD_REQUEST", message: error.message } });
                return;
            }
            next(error);
        }
    });
    return r;
}
