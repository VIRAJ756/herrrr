import http from "http";
import { Server as SocketIOServer } from "socket.io";
import cron from "node-cron";
import { loadEnv } from "./config/env";
import { createApp } from "./app";
import { registerSockets } from "./sockets";
import { getRiskZones, invalidateRiskZoneCache } from "./services/riskEngine";

const env = loadEnv();
const app = createApp(env);

const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: true, credentials: true },
});

registerSockets(io, env);

cron.schedule("*/15 * * * *", async () => {
  invalidateRiskZoneCache();
  await getRiskZones({ forceRefresh: true });
});

server.listen(env.PORT, () => {
  if (env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.log(`GUARDIAN API listening on :${env.PORT}`);
  }
});

