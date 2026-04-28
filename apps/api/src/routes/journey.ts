import { Router } from "express";

/** Journey REST endpoints (socket events are primary). */
export function journeyRouter(): Router {
  const r = Router();
  r.post("/start", (_req, res) =>
    res.status(501).json({ error: { code: "NOT_IMPLEMENTED", message: "Use socket event journey:start." } }),
  );
  return r;
}

