import { io, Socket } from "socket.io-client";
import { BACKEND_URL } from "../utils/backendUrl";

export const socket: Socket = io(BACKEND_URL, {
  path: "/v1/socket-io",
  autoConnect: false, // connect manually when needed
});

export function joinRoom(roomId: string) {
  if (!socket.connected) socket.connect();
  socket.emit("video:join", { roomId });
}
