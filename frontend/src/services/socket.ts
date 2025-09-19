import { io, Socket } from "socket.io-client";

export const socket: Socket = io(import.meta.env.VITE_APP_BACKEND_URL, {
  path: "/v1/socket-io",
  autoConnect: false, // connect manually when needed
});
