import express from "express";
import cors from "cors";
import helmet from "helmet";
import type { Env } from "./config/env";
import { apiRateLimiter } from "./middleware/rateLimiter";
import { errorHandler } from "./middleware/errorHandler";
import { authRouter } from "./routes/auth";
import { incidentsRouter } from "./routes/incidents";
import { zonesRouter } from "./routes/zones";
import { sosRouter } from "./routes/sos";
import { journeyRouter } from "./routes/journey";
import { contactsRouter } from "./routes/contacts";
import { aiRouter } from "./routes/ai";
import evidenceRouter from "./routes/evidence";
import path from "path";

/** Build the Express app with all routes and middleware. */
export function createApp(env: Env): express.Express {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: ["http://localhost:3000", "http://localhost:3001"],
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "2mb" }));
  app.use(apiRateLimiter);

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, env: env.NODE_ENV, time: new Date().toISOString() });
  });

  app.use("/api/auth", authRouter());
  app.use("/api/incidents", incidentsRouter());
  app.use("/api/zones", zonesRouter());
  app.use("/api/sos", sosRouter(env));
  app.use("/api/journey", journeyRouter());
  app.use("/api/contacts", contactsRouter());
  app.use("/api/ai", aiRouter(env));
  app.use("/api/evidence", evidenceRouter);

  app.use("/uploads", (_req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  });
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  app.use((_req, res) => {
    res.status(404).json({ error: { code: "NOT_FOUND", message: "Route not found." } });
  });

  app.use(errorHandler);
  return app;
}

