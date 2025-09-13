import { Server, Socket } from "socket.io";
import { rooms, type RoomState } from "../models/roomState.js";
import { roomUsers } from "../models/roomUsers.js";
import type { VideoEvent } from "../models/videoEvent.js";


/**
 * Handle room join events from socket.IO
 * @param socket The current socket
 * @param roomId The current roomId to handle join events for
 */
function joinRoom(socket: Socket, roomId: string) {
  // Initialize roomUsers set if missing
  if (!roomUsers[roomId]) { 
    roomUsers[roomId] = new Set(); 
  };
  roomUsers[roomId].add(socket.id);

  // Join the room
  socket.join(roomId);

  // Log user joining room
  console.log(`${socket.id} joined room ${roomId}`);

  // Send current room state to client
  const state = rooms.get(roomId);

  // If state doesn't exist, return none
  if (!state) {
    console.log(`Room ${roomId} does not exist`);
    return;
  }

  const oldLastUpdate = state.lastUpdate;
  const elapsed = state.isPlaying ? (Date.now() - oldLastUpdate) / 1000 : 0;

  // Construct new state
  const newState: RoomState = {
    eventId: state.eventId,
    videoUrl: state?.videoUrl,
    currentTime: state.currentTime + elapsed,
    isPlaying: state.isPlaying,
    lastUpdate: Date.now()
  };

  // Set new state
  rooms.set(roomId, newState);

  // Sync client
  console.log(newState)
  socket.emit("video:sync", newState);
}


/**
 * Handle video set events from socket.IO
 * @param io                    The server instance handling events
 * @param videoEvent.roomId     The current roomId to handle events for
 * @param videoEvent.videoUrl   The id of the new video
 */
function handleSetVideo(io: Server, { roomId, videoUrl }: { roomId: string, videoUrl: string }) {
  console.log(`Setting video: ${videoUrl} in ${roomId}`);

  const state = rooms.get(roomId);

  // Update room state with new video
  rooms.set(roomId,
    {
      eventId: state!.eventId+1,
      videoUrl,
      currentTime: 0,
      isPlaying: true,
      lastUpdate: Date.now()
    }
  );

  // Broadcast the new video state to all users in the room
  console.log(rooms.get(roomId));
  io.to(roomId).emit("video:sync", rooms.get(roomId));
}


/**
 * Handle video play events from socket.IO
 * @param io                  The server instance handling events
 * @param videoEvent.roomId   The current roomId to handle events for
 * @param videoEvent.time     The timestamp to set the video to
 */
function handlePlayVideo(io: Server, { roomId, time, eventId }: VideoEvent) {
  // Get the current room
  const room = rooms.get(roomId);

  // If the room doesn't exist, return
  if (!room) {
    console.log(`Room with id ${roomId} does not exist`);
    return;
  }

  // Ignore sync events if the eventId is less than or equal to what is known to the server
  if (room.eventId > eventId) return;

  // Update room's state on server
  room.eventId++;
  room.currentTime = time;
  room.isPlaying = true;
  room.lastUpdate = Date.now();

  console.log(`Broadcasting video:play in room ${roomId} at time ${time}`);
  console.log(room);
  io.to(roomId).emit("video:sync", room);
}


/**
 * Handle video pause events from socket.IO
 * @param io                  The server instance handling events
 * @param videoEvent.roomId   The current roomId to handle events for
 * @param videoEvent.time     The timestamp to set the video to
 */
function handlePauseVideo(io: Server, { roomId, time, eventId }: VideoEvent) {
  // Get the current room
  const room = rooms.get(roomId);

  // If the room doesn't exist, return
  if (!room) {
    console.log(`Room with id ${roomId} does not exist`);
    return;
  }

  // Ignore sync events if the eventId is less than or equal to what is known to the server
  if (room.eventId > eventId) return;

  // Update room's state on server
  room.eventId++;
  room.currentTime = time;
  room.isPlaying = false;
  room.lastUpdate = Date.now();


  console.log(`Broadcasting video:pause in room ${roomId} at time ${time}`);
  console.log(room);
  io.to(roomId).emit("video:sync", room);
}


/**
 * Handle video seek events from socket.IO
 * @param io                  The server instance handling events
 * @param videoEvent.roomId   The current roomId to handle events for
 * @param videoEvent.time     The timestamp to set the video to
 */
function handleSeekVideo(io: Server, { roomId, time, eventId }: VideoEvent) {
  // Get the current room
  const room = rooms.get(roomId);

  // If the room doesn't exist, return
  if (!room) {
    console.log(`Room with id ${roomId} does not exist`);
    return;
  }

  // Ignore sync events if the eventId is less than or equal to what is known to the server
  if (room.eventId > eventId) return;


  // Update room's state on server
  room.eventId++;
  room.currentTime = time;
  room.lastUpdate = Date.now();

  console.log(`Broadcasting video:seek in room ${roomId} at time ${time}`);
  console.log(room);
  io.to(roomId).emit("video:sync", room);
}


/**
 * Handle disconnection events from socket.IO
 * @param socket The current socket being disconnected from
 */
function disconnect(socket: Socket) {
  console.log("User disconnected:", socket.id);

  // Run cleanup function for each room in socket
  for (const [roomId, userSet] of Object.entries(roomUsers)) {
    disconnectCleanup(socket, roomId, userSet);
  }
}


/**
 * Helper function to cleanup unused rooms from in-memory store
 * @param socket The current socket being disconnected from
 * @param roomId The current roomId to remove the socket from
 */
function disconnectCleanup(socket: Socket, roomId: string, userSet: Set<string>) {
  // Get set of users in room
  const currentRoomUsers = userSet;

  // If room doesn't exist, return
  if (!currentRoomUsers) return;

  // If socket id exists in room users, remove from rooms users
  if (currentRoomUsers.has(socket.id)) {
    console.log(`Deleting user ${socket.id} from users`);
    currentRoomUsers.delete(socket.id);
  }

  // If users list for room is empty, delete room entirely
  if (currentRoomUsers.size === 0) {
    delete roomUsers[roomId];
    rooms.delete(roomId);
    console.log(`Room ${roomId} deleted because it is empty`);
  }
}


export default function socketEventHandler(io: Server, socket: Socket) {
  console.log("New client connected:", socket.id);

  // Join room
  socket.on("video:join", ({ roomId }: { roomId: string }) => joinRoom(socket, roomId));

  // Video events
  socket.on("video:set", ({ roomId, videoUrl }: { roomId: string, videoUrl: string }) => handleSetVideo(io, { roomId, videoUrl }));
  socket.on("video:play", ({ roomId, time, eventId }: { roomId: string; time: number, eventId: number }) => handlePlayVideo(io, { roomId, time, eventId }));
  socket.on("video:pause", ({ roomId, time, eventId }: { roomId: string; time: number, eventId: number }) => handlePauseVideo(io, { roomId, time, eventId }));
  socket.on("video:seek", ({ roomId, time, eventId }: { roomId: string; time: number, eventId: number }) => handleSeekVideo(io, { roomId, time, eventId }));

  // Disconnect
  socket.on("disconnect", () => disconnect(socket));
}