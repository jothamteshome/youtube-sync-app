import { io, Socket } from "socket.io-client";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:4000";

export const socket: Socket = io(SERVER_URL, {
  autoConnect: false, // connect manually when needed
});

export function joinRoom(roomId: string) {
  if (!socket.connected) socket.connect();
  socket.emit("video:join", { roomId });
}
