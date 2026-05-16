import { sosHandler } from "./sosHandler";
import { trackingHandler } from "./trackingHandler";
import { incidentHandler } from "./incidentHandler";
/** Register all Socket.io handlers. */
export function registerSockets(io, env) {
    io.on("connection", (socket) => {
        sosHandler(io, socket, env);
        trackingHandler(io, socket, env);
        incidentHandler(io, socket, env);
    });
}
