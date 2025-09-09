import { socket } from "../services/socket";
import { YoutubeManager } from "./YoutubeManager";
import { extractYouTubeId } from "../utils/youtube";

export class RoomManager {
  private roomId: string;
  private youtubeManager: YoutubeManager | null = null;

  constructor(roomId: string) {
    this.roomId = roomId;

    this.youtubeManager = new YoutubeManager(this.roomId);
    this.youtubeManager.initPlayer("yt-player");
  }

  loadVideo(videoUrl: string) {
    if (!this.youtubeManager) return;

    const videoId = extractYouTubeId(videoUrl);

    if (!videoId) {
      alert("Invalid YouTube URL");
      return;
    }

    socket.emit("video:set", { roomId: this.roomId, videoUrl });
  }

  destroy() {
    socket.off("video:set");
    this.youtubeManager?.destroy();
    this.youtubeManager = null;
  }
}
