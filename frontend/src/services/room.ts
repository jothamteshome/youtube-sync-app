// services/room.ts
import axios from "axios";

const BACKEND_URL = `${import.meta.env.REACT_APP_BACKEND_URL}:${import.meta.env.REACT_APP_BACKEND_PORT}`;

export async function createRoom(videoId?: string) {
  const response = await axios.post(`${BACKEND_URL}/rooms/create-room`, { videoId });
  return response.data.roomId;
}
