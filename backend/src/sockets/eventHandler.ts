import { Server, Socket } from "socket.io";
import { rooms } from "../models/roomState.js";
import type { VideoEvent } from "../models/videoEvent.js";


/**
 * Handle room join events from socket.IO
 * @param socket The current socket
 * @param roomId The current roomId to handle join events for
 */
function joinRoom(socket: Socket, roomId: string) {
  // Join the room
  socket.join(roomId);

  // Log user joining room
  console.log(`${socket.id} joined room ${roomId}`);

  // Get current room
  const room = rooms.get(roomId);

  // If room doesn't exist, return
  if (!room) {
    console.log(`Room ${roomId} does not exist`);
    return;
  }

  // Update room's user list
  room.users[socket.id] = true;

  // Sync current room state with user
  socket.emit("video:sync", room);
}


/**
 * Handle video update events from socket.IO
 * @param socket              The current socket handling events
 * @param videoEvent.roomId   The current roomId to handle events for
 * @param videoEvent.event    The event type being processed
 * @param videoEvent.time     The timestamp to set the video to
 */
function handleVideoEvent(socket: Socket, { roomId, event, time }: VideoEvent) {
  // Get the current room
  const room = rooms.get(roomId);

  // If the room doesn't exist, return
  if (!room) {
    console.log(`Room with id ${roomId} does not exist`);
    return;
  }

  // Update room's state on server
  room.currentTime = time;
  room.isPlaying = event === "play";

  
  // Broadcast video event state to other users in room
  console.log(`Broadcasting video:${event} in room ${roomId} at time ${time}`);
  socket.to(roomId).emit(`video:${event}`, { time });
}


/**
 * Handle disconnection events from socket.IO
 * @param socket The current socket being disconnected from
 */
function disconnect(socket: Socket) {
  console.log("User disconnected:", socket.id);

  // Get list of rooms for the current socket
  const userRooms = Array.from(socket.rooms).filter(r => r !== socket.id);

  // Run cleanup function for each room in socket
  userRooms.forEach(roomId => disconnectCleanup(socket, roomId));  
}


/**
 * Helper function to cleanup unused rooms from in-memory store
 * @param socket The current socket being disconnected from
 * @param roomId The current roomId to remove the socket from
 */
function disconnectCleanup(socket: Socket, roomId: string) {
  // Get room from store
  const room = rooms.get(roomId);

  // If room doesn't exist, return
  if (!room) return;

  // If socket id exists in room users, remove from rooms users
  if (socket.id in room.users) {
    console.log(`Deleting user ${socket.id} from users`);
    delete room.users[socket.id];
  }

  // If users list for room is empty, delete room entirely
  if (Object.keys(room.users).length === 0) {
    rooms.delete(roomId);
    console.log(`Room ${roomId} deleted because it is empty`);
  }
}


export default function socketEventHandler(io: Server, socket: Socket) {
  console.log("New client connected:", socket.id);

  // Join room
  socket.on("video:join", ({ roomId }: { roomId: string }) => joinRoom(socket, roomId));

  // Video events
  socket.on("video:play", ({ roomId, time }: { roomId: string; time: number }) => handleVideoEvent(socket, { roomId, event: "play", time }));
  socket.on("video:pause", ({ roomId, time }: { roomId: string; time: number }) => handleVideoEvent(socket, { roomId, event: "pause", time }));
  socket.on("video:seek", ({ roomId, time }: { roomId: string; time: number }) => handleVideoEvent(socket, { roomId, event: "seek", time }));

  // Disconnect
  socket.on("disconnect", () => disconnect(socket));
}