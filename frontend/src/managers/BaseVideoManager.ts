export type VideoState = {
    currentTime: number;
    isPlaying: boolean;
    lastUpdate: number;
    videoUrl?: string;
};

export abstract class BaseVideoManager {
    protected roomId: string;
    protected isApplyingRemote = false;
    readonly driftThreshold = 0.5;
    

    constructor(roomId: string) {
        this.roomId = roomId;
    }


    abstract initPlayer(containerId: string): void;
    abstract destroy(): void;
    abstract getCurrentTime(): number;
    abstract getDuration(): number;
    abstract play(): void;
    abstract pause(): void;
    abstract seek(time: number): void;
    abstract isPlaying(): boolean;
    abstract loadVideoByUrl(videoUrl: string): void;


    /**
     * Checks drift and decides whether to apply remote update
     * @param state The remote video state to apply
     * @returns A boolean value stating whether the video manager should apply a remote video state
     */
    protected shouldApplyRemote(state: VideoState): boolean {
        const drift = Math.abs(this.getCurrentTime() - state.currentTime);
        return drift > this.driftThreshold || this.getCurrentTime() === 0;
    }


    /**
     * Subclass implements the actual update logic
     * @param state The remote video state to apply
     */
    protected abstract applyRemoteState(state: VideoState, onComplete: () => void): void;


    public getApplyingRemote(): boolean {
        return this.isApplyingRemote;
    };


    /**
     * Handles syncing from the server
     * @param state The remote video state to apply
     */
    public handleRemoteState(state: VideoState, onComplete: () => void): void {
        if (!this.shouldApplyRemote(state)) return;

        this.isApplyingRemote = true;
        this.applyRemoteState(state, onComplete);
    }
}