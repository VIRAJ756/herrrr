import { Router } from "express";

/** Auth routes (handled by Supabase on client; kept for extensibility). */
export function authRouter(): Router {
  const r = Router();
  r.get("/me", (_req, res) => {
    res.status(501).json({ error: { code: "NOT_IMPLEMENTED", message: "Use Supabase Auth on client." } });
  });
  return r;
}

