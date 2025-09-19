import { Server, Socket } from "socket.io";
import type { QueueAddEvent, QueueNextEvent } from "../interfaces/QueueEvents.js";
import type { QueueState } from "../interfaces/States.js";
import { roomManager } from "../models/RoomManager.js";


export function handleQueueJoinRoomSync(socket: Socket, roomId: string) {
    // Send current queue state to client
    const queueState = roomManager.queueStates.get(roomId);

    // If queue state doesn't exist, return
    if (!queueState) {
        console.log(`Queue for room ${roomId} does not exist`);
        return;
    }

    // Sync client
    console.log("Queue state: ", queueState)
    socket.emit("queue:sync", queueState);
}


function handleQueueAdd(io: Server, { roomId, videoUrl, eventId }: QueueAddEvent) {
    const state: QueueState | undefined = roomManager.queueStates.get(roomId);

    // If the room doesn't exist, return
    if (!state) {
        console.log(`Queue for with id ${roomId} does not exist`);
        return;
    }

    // Ignore events if the eventId is less than or equal to what is known to the server
    if (state.eventId > eventId) return;

    // Update room's state on server
    state.eventId++;
    state.items.push(videoUrl);

    // If this is the first video in the queue, set currentIndex to 0
    if (state.currentIndex === -1) {
        state.currentIndex = 0;
    }


    console.log(`Broadcasting queue:add in room ${roomId}`);
    console.log(state);
    io.to(roomId).emit("queue:sync", state);
};


function handleQueueNext(io: Server, { roomId, eventId }: QueueNextEvent) {
    const state: QueueState | undefined = roomManager.queueStates.get(roomId);

    // If the room doesn't exist, return
    if (!state) {
        console.log(`Queue for with id ${roomId} does not exist`);
        return;
    }

    // Ignore events if the eventId is less than or equal to what is known to the server
    if (state.eventId > eventId) return;

    // Update room's state on server
    state.eventId++;
    state.currentIndex++;

    console.log(`Broadcasting queue:next in room ${roomId}`);
    console.log(state);
    io.to(roomId).emit("queue:sync", state);
};


export function registerQueueEventHandlers(io: Server, socket: Socket) {
    // Queue events
    socket.on("queue:add", ({ roomId, eventId, videoUrl }: QueueAddEvent) => handleQueueAdd(io, { roomId, videoUrl, eventId }));
    socket.on("queue:next", ({ roomId, eventId }: QueueNextEvent) => handleQueueNext(io, { roomId, eventId }));
};