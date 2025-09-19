import type { Server, Socket } from "socket.io";
import type { VideoSetEvent, VideoUpdateEvent } from "../interfaces/VideoEvents.js";
import type { VideoState } from "../interfaces/States.js";
import { roomManager } from "../models/RoomManager.js";


export function handleVideoJoinRoomSync(socket: Socket, roomId: string) {
    // Send current room state to client
    const state = roomManager.videoStates.get(roomId);

    // If state doesn't exist, return none
    if (!state) {
        console.log(`Room ${roomId} does not exist`);
        return;
    }

    const oldLastUpdate = state.lastUpdate;
    const elapsed = state.isPlaying ? (Date.now() - oldLastUpdate) / 1000 : 0;

    // Construct new state
    const newState: VideoState = {
        eventId: state.eventId,
        videoUrl: state?.videoUrl,
        currentTime: state.currentTime + elapsed,
        isPlaying: state.isPlaying,
        playbackRate: state.playbackRate,
        lastUpdate: Date.now()
    };

    // Set new state
    roomManager.videoStates.set(roomId, newState);

    // Sync client
    console.log("Video state", newState)
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

    const state = roomManager.videoStates.get(roomId);

    if (!state) {
        console.log(`Room with id ${roomId} does not exist`);
        return;
    }

    // Update video state with new video
    roomManager.videoStates.set(roomId,
        {
            eventId: state.eventId + 1,
            videoUrl,
            currentTime: 0,
            isPlaying: true,
            playbackRate: 1,
            lastUpdate: Date.now()
        }
    );

    // Broadcast the new video state to all users in the room
    console.log(roomManager.videoStates.get(roomId));
    io.to(roomId).emit("video:sync", roomManager.videoStates.get(roomId));
};


/**
 * Handle video pause events from socket.IO
 * @param io                        The server instance handling events
 * @param videoEvent.roomId         The current roomId to handle events for
 * @param videoEvent.time           The timestamp to set the video to
 * @param videoEvent.playbackRate   The playback rate of the video
 * @param videoEvent.eventId        The eventId of the video event
 */
function handlePlayVideo(io: Server, { roomId, time, playbackRate, eventId }: VideoUpdateEvent) {
    // Get the current room
    const state = roomManager.videoStates.get(roomId);

    // If the room doesn't exist, return
    if (!state) {
        console.log(`Room with id ${roomId} does not exist`);
        return;
    }

    // Ignore sync events if the eventId is less than or equal to what is known to the server
    if (state.eventId > eventId) return;

    // Update room's state on server
    state.eventId++;
    state.currentTime = time;
    state.isPlaying = true;
    state.playbackRate = playbackRate;
    state.lastUpdate = Date.now();

    console.log(`Broadcasting video:play in room ${roomId} at time ${time}`);
    console.log(state);
    io.to(roomId).emit("video:sync", state);
};


/**
 * Handle video pause events from socket.IO
 * @param io                        The server instance handling events
 * @param videoEvent.roomId         The current roomId to handle events for
 * @param videoEvent.time           The timestamp to set the video to
 * @param videoEvent.playbackRate   The playback rate of the video
 * @param videoEvent.eventId        The eventId of the video event
 */
function handlePauseVideo(io: Server, { roomId, time, playbackRate, eventId }: VideoUpdateEvent) {
    // Get the current room
    const state = roomManager.videoStates.get(roomId);

    // If the room doesn't exist, return
    if (!state) {
        console.log(`Room with id ${roomId} does not exist`);
        return;
    }

    // Ignore sync events if the eventId is less than or equal to what is known to the server
    if (state.eventId > eventId) return;

    // Update room's state on server
    state.eventId++;
    state.currentTime = time;
    state.isPlaying = false;
    state.playbackRate = playbackRate;
    state.lastUpdate = Date.now();


    console.log(`Broadcasting video:pause in room ${roomId} at time ${time}`);
    console.log(state);
    io.to(roomId).emit("video:sync", state);
};


/**
 * Handle general video update events from socket.IO
 * @param io                        The server instance handling events
 * @param videoEvent.roomId         The current roomId to handle events for
 * @param videoEvent.time           The timestamp to set the video to
 * @param videoEvent.playbackRate   The playback rate of the video
 * @param videoEvent.eventId        The eventId of the video event
 */
function handleUpdateVideo(io: Server, { roomId, time, playbackRate, eventId }: VideoUpdateEvent) {
    // Get the current video state
    const state = roomManager.videoStates.get(roomId);

    // If the state doesn't exist, return
    if (!state) {
        console.log(`Room with id ${roomId} does not exist`);
        return;
    }

    // Ignore sync events if the eventId is less than or equal to what is known to the server
    if (state.eventId > eventId) return;


    // Update video's state on server
    state.eventId++;
    state.currentTime = time;
    state.playbackRate = playbackRate;
    state.lastUpdate = Date.now();

    console.log(`Broadcasting video:update in room ${roomId} at time ${time}`);
    console.log(state);
    io.to(roomId).emit("video:sync", state);
};


export function registerVideoEventHandlers(io: Server, socket: Socket) {
    // Video events
    socket.on("video:set", ({ roomId, videoUrl }: VideoSetEvent) => handleSetVideo(io, { roomId, videoUrl }));
    socket.on("video:play", (event: VideoUpdateEvent) => handlePlayVideo(io, event));
    socket.on("video:pause", (event: VideoUpdateEvent) => handlePauseVideo(io, event));
    socket.on("video:seek", (event: VideoUpdateEvent) => handleUpdateVideo(io, event));
    socket.on("video:playbackrate", (event: VideoUpdateEvent) => handleUpdateVideo(io, event));
}