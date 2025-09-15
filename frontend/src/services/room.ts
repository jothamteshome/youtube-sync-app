// services/room.ts
import axios from "axios";

export async function createRoom(videoId?: string) {
  const response = await axios.post(`${import.meta.env.VITE_APP_BACKEND_URL}/v1/rooms/create-room`, { videoId });
  return response.data.roomId;
}
