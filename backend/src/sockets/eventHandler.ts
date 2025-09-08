import { Server, Socket } from "socket.io";
import { rooms, type ClientRoomState } from "../models/roomState.js";
import type { VideoEvent } from "../models/videoEvent.js";


/**
 * Handle room join events from socket.IO
 * @param socket The current socket
 * @param roomId The current roomId to handle join events for
 */
function joinRoom(socket: Socket, roomId: string, eventProcessedCount: number) {
  if (eventProcessedCount > 1) return;

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

  const clientRoomState: ClientRoomState = {
    videoId: room.videoId,
    currentTime: room.currentTime,
    isPlaying: room.isPlaying,
    eventProcessedCount: eventProcessedCount + 1
  };

  // Sync current room state with user
  socket.emit("video:sync", clientRoomState);
}


/**
 * Handle video update events from socket.IO
 * @param socket              The current socket handling events
 * @param videoEvent.roomId   The current roomId to handle events for
 * @param videoEvent.event    The event type being processed
 * @param videoEvent.time     The timestamp to set the video to
 */
function handleVideoEvent(socket: Socket, { roomId, event, time, eventProcessedCount }: VideoEvent) {
  if (eventProcessedCount > 1) return;

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
  console.log(`${socket.id} is broadcasting video:${event} in room ${roomId} at time ${time}`);
  socket.to(roomId).emit(`video:${event}`, { time, eventProcessedCount: eventProcessedCount + 1 });
}


function handleSetVideo(socket: Socket, { roomId, videoId, eventProcessedCount }: { roomId: string, videoId: string, eventProcessedCount: number }) {
  console.log('Setting video');

  if (eventProcessedCount > 1) return;

  const room = rooms.get(roomId);
  if (!room) return;

  room.videoId = videoId;

  const clientRoomState: ClientRoomState = {
    videoId: room.videoId,
    currentTime: room.currentTime,
    isPlaying: room.isPlaying,
    eventProcessedCount: eventProcessedCount + 1
  };

  // Broadcast the new videoId to all users including sender
  socket.to(roomId).emit("video:sync", clientRoomState);
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
  socket.on("video:join", ({ roomId, eventProcessedCount }: { roomId: string, eventProcessedCount: number }) => joinRoom(socket, roomId, eventProcessedCount));

  // Video events
  socket.on("video:set", ({ roomId, videoId, eventProcessedCount }: { roomId: string, videoId: string, eventProcessedCount: number }) => handleSetVideo(socket, { roomId, videoId, eventProcessedCount }));
  socket.on("video:play", ({ roomId, time, eventProcessedCount }: { roomId: string; time: number, eventProcessedCount: number }) => handleVideoEvent(socket, { roomId, event: "play", time, eventProcessedCount }));
  socket.on("video:pause", ({ roomId, time, eventProcessedCount }: { roomId: string; time: number, eventProcessedCount: number }) => handleVideoEvent(socket, { roomId, event: "pause", time, eventProcessedCount }));
  socket.on("video:seek", ({ roomId, time, eventProcessedCount }: { roomId: string; time: number, eventProcessedCount: number }) => handleVideoEvent(socket, { roomId, event: "seek", time, eventProcessedCount }));

  // Disconnect
  socket.on("disconnect", () => disconnect(socket));
}