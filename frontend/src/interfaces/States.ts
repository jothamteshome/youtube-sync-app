/** Interface for queue states */
export interface QueueState {
    items: string[];
    currentIndex: number;
    isLooping: boolean;
    eventId: number;
};


export type VideoState = {
    videoUrl: string;
    currentTime: number;
    isPlaying: boolean;
    playbackRate: number;
    eventId: number;
};