export type VideoState = {
    videoUrl: string;
    currentTime: number;
    isPlaying: boolean;
    playbackRate: number;
    eventId: number;
};

export abstract class BaseVideoManager {
    protected roomId: string;
    protected eventId: number = -1;
    protected lastPlaybackRate = 1;
    readonly driftThreshold: number = 0.5;


    constructor(roomId: string) {
        this.roomId = roomId;
    }

    public abstract destroy(): void;
    public abstract initPlayer(containerId: string): void;
    public abstract sync(state: VideoState): void;
    protected abstract syncHandler(state: VideoState): void;
    protected abstract monitorPlaybackRate(): void;
    
}