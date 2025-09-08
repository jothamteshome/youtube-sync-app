export interface RoomState {
    videoId?: string;
    currentTime: number;
    isPlaying: boolean;
    users: Record<string, boolean>;
}

export interface ClientRoomState {
    videoId?: string | undefined;
    currentTime: number;
    isPlaying: boolean;
    eventProcessedCount: number;
}

export const rooms: Map<string, RoomState> = new Map<string, RoomState>();