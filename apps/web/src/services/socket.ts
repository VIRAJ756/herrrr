import { io, type Socket } from "socket.io-client";

export type GuardianSocket = Socket;

function socketUrl(): string {
  return (import.meta.env.VITE_SOCKET_URL as string | undefined) ?? "http://localhost:3001";
}

export function createSocket(): GuardianSocket {
  return io(socketUrl(), {
    transports: ["websocket"],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 12,
    reconnectionDelayMax: 2500,
  });
}

