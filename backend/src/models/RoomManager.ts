import type { RoomUsers } from "../interfaces/RoomUsers.js";
import type { VideoState, QueueState } from "../interfaces/States.js";
import type { VideoData } from "../interfaces/VideoData.js";


class RoomManager {
    public roomUsers: RoomUsers = {};
    public cachedVideoData: Map<string, VideoData> = new Map<string, VideoData>();
    public queueStates: Map<string, QueueState> = new Map<string, QueueState>();
    public videoStates: Map<string, VideoState> = new Map<string, VideoState>();


    public createRoom(roomId: string) {
        // Set room state
        this.videoStates.set(roomId, {
            eventId: 0,
            videoUrl: null,
            currentTime: 0,
            isPlaying: false,
            playbackRate: 1,
            lastUpdate: Date.now()
        });


        // Set queue state
        this.queueStates.set(roomId, {
            eventId: 0,
            items: [],
            currentIndex: -1,
            isLooping: false
        });
    }
};


export const roomManager = new RoomManager();