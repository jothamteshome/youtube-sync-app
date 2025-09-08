interface RoomState {
  videoUrl: string | null;
  currentTime: number;
  isPlaying: boolean;
  lastUpdate: number; // Date.now()
}

export const rooms: Map<string, RoomState> = new Map<string, RoomState>();