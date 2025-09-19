import type { VideoState } from "../interfaces/States";

export abstract class BaseVideoManager {
    protected roomId: string;
    protected eventId: number = -1;
    protected lastPlaybackRate = 1;
    protected onVideoEnd: () => void;
    protected videoLoaded: boolean = false;
    readonly driftThreshold: number = 0.5;


    constructor(roomId: string, onVideoEnd: () => void) {
        this.roomId = roomId;
        this.onVideoEnd = onVideoEnd;
    }

    public isVideoLoaded(): boolean { return this.videoLoaded}

    public abstract destroy(): void;
    public abstract initPlayer(containerId: string): void;
    public abstract sync(state: VideoState): void;
    protected abstract syncHandler(state: VideoState): void;
    protected abstract monitorPlaybackRate(): void;
    
}