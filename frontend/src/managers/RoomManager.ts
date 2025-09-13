import { socket } from "../services/socket";
import { YoutubeManager } from "./YoutubeManager";
import { extractYouTubeId } from "../utils/youtube";
import { type VideoState } from "./BaseVideoManager";

export class RoomManager {
  private roomId: string;
  private youtubeManager: YoutubeManager | null = null;

  constructor(roomId: string) {
    this.roomId = roomId;

    this.youtubeManager = new YoutubeManager(this.roomId);
    this.youtubeManager.initPlayer("yt-player");

    this.registerSocketEvents();
  }

  private registerSocketEvents() {
    // Sync events from server
    socket.on("video:sync", (state: VideoState) => this.sync(state));
  }

  private sync(state: VideoState) {
    this.youtubeManager?.sync(state);
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
    socket.off("video:sync");
    socket.off("video:set");
    this.youtubeManager?.destroy();
    this.youtubeManager = null;
  }
}
