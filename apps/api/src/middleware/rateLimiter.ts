import rateLimit from "express-rate-limit";

/** Global API rate limiter. */
export const apiRateLimiter = rateLimit({
  windowMs: 60_000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
});

