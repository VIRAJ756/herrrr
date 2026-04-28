import { Router } from "express";

/** Contacts REST endpoints (Phase 5). */
export function contactsRouter(): Router {
  const r = Router();
  r.get("/", (_req, res) =>
    res.status(501).json({ error: { code: "NOT_IMPLEMENTED", message: "Contacts API not enabled yet." } }),
  );
  return r;
}

