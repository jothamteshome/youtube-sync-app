// services/room.ts
import axios from "axios";
import { BACKEND_URL } from "../utils/backendUrl";

export async function createRoom(videoId?: string) {
  const response = await axios.post(`${BACKEND_URL}/api/v1/rooms/create-room`, { videoId });
  return response.data.roomId;
}
