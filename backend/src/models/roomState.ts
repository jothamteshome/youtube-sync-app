export interface RoomState {
  eventId: number;
  videoUrl: string | null;
  currentTime: number;
  isPlaying: boolean;
  playbackRate: number;
  lastUpdate: number; // Date.now()
}

export const rooms: Map<string, RoomState> = new Map<string, RoomState>();