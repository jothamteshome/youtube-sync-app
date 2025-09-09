// services/room.ts
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_APP_BACKEND_URL;

export async function createRoom(videoId?: string) {
  const response = await axios.post(`${BACKEND_URL}/api/v1/rooms/create-room`, { videoId });
  return response.data.roomId;
}
