import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";

export type AuthedRequest = Request & { userId: string };

export type AuthErrorBody = { error: { code: "UNAUTHORIZED"; message: string } };

const HeaderSchema = z
  .string()
  .regex(/^Bearer\s+.+$/i, "Invalid Authorization header");

/** Build a Supabase-backed JWT verification middleware. */
export function authMiddleware(supabase: SupabaseClient) {
  return async function auth(
    req: Request,
    res: Response<AuthErrorBody>,
    next: NextFunction,
  ): Promise<void> {
    const raw = req.header("authorization");
    const parsed = HeaderSchema.safeParse(raw);
    if (!parsed.success) {
      res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Missing or invalid token." } });
      return;
    }

    const token = parsed.data.replace(/^Bearer\s+/i, "").trim();
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user?.id) {
      res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Token verification failed." } });
      return;
    }

    (req as AuthedRequest).userId = data.user.id;
    next();
  };
}

