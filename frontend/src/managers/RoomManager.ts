import { socket } from "../services/socket";
import { YoutubeManager } from "./YoutubeManager";

export class RoomManager {
  private roomId: string;
  private youtubeManager: YoutubeManager | null = null;

  constructor(roomId: string) {
    this.roomId = roomId;

    this.youtubeManager = new YoutubeManager(this.roomId);
    this.youtubeManager.initPlayer("yt-player");
  }

  loadVideo(videoId: string) {
    if (!this.youtubeManager) return;

    this.youtubeManager.setVideo(videoId);
    console.log("Video ID:", videoId)
    socket.emit("video:set", { roomId: this.roomId, videoId, eventProcessedCount: 0 });
  }

  destroy() {
    socket.off("video:set");
    this.youtubeManager?.destroy();
    this.youtubeManager = null;
  }
}
