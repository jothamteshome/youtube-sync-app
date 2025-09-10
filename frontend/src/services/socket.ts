import { io, Socket } from "socket.io-client";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

export const socket: Socket = io(SERVER_URL, {
  path: "/api/v1/socket-io",
  autoConnect: false, // connect manually when needed
});

export function joinRoom(roomId: string) {
  if (!socket.connected) socket.connect();
  socket.emit("video:join", { roomId });
}
