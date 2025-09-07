export interface RoomState {
    videoUrl?: string;
    currentTime: number;
    isPlaying: boolean;
    users: Record<string, boolean>;
}

export const rooms: Map<string, RoomState> = new Map<string, RoomState>();