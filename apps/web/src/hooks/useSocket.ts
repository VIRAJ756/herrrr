import type { GuardianSocket } from "../services/socket";
import { createSocket } from "../services/socket";

export function useSocket(): GuardianSocket {
  const socket = globalSocket;
  return socket;
}

const globalSocket: GuardianSocket = createSocket();

