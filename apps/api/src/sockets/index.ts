import type { Server as SocketIOServer } from "socket.io";
import type { Env } from "../config/env";
import { sosHandler } from "./sosHandler";
import { trackingHandler } from "./trackingHandler";
import { incidentHandler } from "./incidentHandler";

/** Register all Socket.io handlers. */
export function registerSockets(io: SocketIOServer, env: Env): void {
  io.on("connection", (socket) => {
    sosHandler(io, socket, env);
    trackingHandler(io, socket, env);
    incidentHandler(io, socket, env);
  });
}

