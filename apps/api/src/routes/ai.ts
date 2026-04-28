import { Router } from "express";

/** AI routes (implemented in Phase 6). */
export function aiRouter(): Router {
  const r = Router();
  r.post("/risk-analysis", (_req, res) =>
    res.status(501).json({ error: { code: "NOT_IMPLEMENTED", message: "AI risk analysis not enabled yet." } }),
  );
  r.post("/safe-route", (_req, res) =>
    res.status(501).json({ error: { code: "NOT_IMPLEMENTED", message: "Safe-route not enabled yet." } }),
  );
  return r;
}

