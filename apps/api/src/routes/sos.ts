import { Router } from "express";

/** SOS REST endpoints (socket events are primary). */
export function sosRouter(): Router {
  const r = Router();
  r.post("/trigger", (_req, res) => res.status(501).json({ error: { code: "NOT_IMPLEMENTED", message: "Use socket event sos:trigger." } }));
  return r;
}

