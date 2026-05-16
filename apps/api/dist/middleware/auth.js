import { z } from "zod";
const HeaderSchema = z
    .string()
    .regex(/^Bearer\s+.+$/i, "Invalid Authorization header");
/** Build a Supabase-backed JWT verification middleware. */
export function authMiddleware(supabase) {
    return async function auth(req, res, next) {
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
        req.userId = data.user.id;
        next();
    };
}
