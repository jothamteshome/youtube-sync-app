import { BaseVideoManager } from "./BaseVideoManager";
import YoutubeManager from "./YoutubeManager";
import Queue from "../models/VideoQueue";
import type { QueueState, VideoState } from "../interfaces/States";
import { socket } from "../services/socket";
import extractVideoId from "../utils/extractVideoId";


type VideoService = "youtube";


/**
 * Manages video playback and synchronization for a room.
 * Acts as a coordinator between socket events and video service managers (e.g. YouTube).
 */
export default class RoomManager {
    private roomId: string;
    private videoId?: string;
    private currentService?: VideoService;
    private videoManagers: Record<VideoService, BaseVideoManager>;
    private onVideoChange: () => void;
    private onPlaylistUpdate: (videos: string[], index: number) => void;
    private queueEventId = 0;
    private queue = new Queue();


    /**
     * Creates a new RoomManager instance for a specific room.
     *
     * @param roomId - The unique identifier for the room.
     */
    constructor(roomId: string, onVideoChange: () => void, onPlaylistUpdate: (videos: string[], index: number) => void) {
        this.roomId = roomId;
        this.onVideoChange = onVideoChange;
        this.onPlaylistUpdate = onPlaylistUpdate;

        this.videoManagers = {
            youtube: new YoutubeManager(this.roomId, this.onVideoEnd)
        }

        for (const [service, manager] of Object.entries(this.videoManagers)) {
            manager.initPlayer(`${service}-player`);
        }

        this.registerSocketEvents();
    }


    /**
     * Registers socket listeners to handle incoming server events
     * (e.g. video synchronization).
     *
     * @private
     */
    private registerSocketEvents() {
        // Sync events from server
        socket.on("video:sync", (state: VideoState) => this.syncVideo(state));
        socket.on("queue:sync", (state: QueueState) => this.syncQueue(state));
    }


    /**
     * Syncs the local player state with the server-provided video state.
     *
     * @param state - The current state of the video, including URL, time, etc.
     * @private
     */
    private syncVideo(state: VideoState) {
        const { videoId, service } = extractVideoId(state.videoUrl);
        this.videoId = videoId;
        this.currentService = service as VideoService;

        if (!this.videoId) {
            alert("Invalid URL");
            return;
        }

        if (!this.currentService) {
            alert(`${service} is an unsupported service`);
            return;
        }

        this.videoManagers[this.currentService].sync(state);
        this.onVideoChange();
    }


    private syncQueue(state: QueueState) {
        // Ignore sync events if the eventId is less than or equal to what is known to the client
        if (this.queueEventId >= state.eventId) return;
        this.queueEventId = state.eventId;

        // Sync the local queue state with the server-provided queue state
        this.queue.sync(state);

        const currentVideo = this.queue.current;

        // Nothing to load if current video is undefined or empty
        if (!currentVideo || currentVideo.trim() === "") return;

        const { videoId, service } = extractVideoId(currentVideo);
        this.videoId = videoId;
        this.currentService = service as VideoService;


        if (!this.videoId) {
            console.warn("syncQueue: Invalid video URL:", currentVideo);
            return;
        }

        if (!this.currentService || !(this.currentService in this.videoManagers)) {
            console.warn(`syncQueue: Unsupported service: ${service}`);
            return;
        }

        const manager = this.videoManagers[this.currentService];

        // If we don’t already have this video loaded, load it
        if (!manager.isVideoLoaded()) {
            this.loadVideo(currentVideo);
        }

        this.onPlaylistUpdate(this.queue.getQueue(), state.currentIndex);
    }


    private onVideoEnd = () => {
        socket.emit("queue:next", { roomId: this.roomId });
    }


    /**
     * Loads a new video into the current room. Validates the URL and notifies the server.
     *
     * @param videoUrl - The full video URL to load (e.g. YouTube link).
     */
    private loadVideo(videoUrl: string) {
        const { videoId, service } = extractVideoId(videoUrl);

        if (!videoId) {
            alert("Invalid URL");
            return;
        }

        if (!service || !(service in this.videoManagers)) {
            alert(`${service} is an unsupported service`);
            return;
        }

        this.videoId = videoId;
        this.currentService = service as VideoService;

        socket.emit("video:set", { roomId: this.roomId, videoUrl });
    }


    public queueVideo(videoUrl: string) {
        const { videoId, service } = extractVideoId(videoUrl);

        // Validate URL before emitting to server
        if (!videoId) {
            alert("Invalid URL");
            return;
        }

        // Validate service
        if (!service || !(service in this.videoManagers)) {
            alert(`${service} is an unsupported service`);
            return;
        }

        socket.emit("queue:add", { roomId: this.roomId, videoUrl });
    }


    public getVideoId(): string | undefined {
        return this.videoId;
    }


    /**
     * Cleans up all resources associated with this RoomManager,
     * including socket listeners and video manager instances.
     */
    destroy() {
        socket.off("queue:sync");
        socket.off("video:sync");
        socket.off("video:set");
        Object.values(this.videoManagers).forEach(manager => manager.destroy());
    }
}
