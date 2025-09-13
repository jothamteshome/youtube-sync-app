import { socket } from "../services/socket";
import { YoutubeManager } from "./YoutubeManager";
import { extractYouTubeId } from "../utils/youtube";
import { type VideoState } from "./BaseVideoManager";

export class RoomManager {
  private youtubeManager: YoutubeManager | null = null;
  private roomId: string;
  private pendingState: VideoState | null = null;

  constructor(roomId: string) {
    this.roomId = roomId;

    this.youtubeManager = new YoutubeManager(this.roomId);
    this.youtubeManager.initPlayer("yt-player");

    this.registerSocketEvents();
  };

  private registerSocketEvents() {
    // Server sent a full video sync (play/pause/seek)
    socket.on("video:sync", (state: VideoState) => {
      if (!this.youtubeManager) return;

      console.log("Syncing...", this.pendingState, this.youtubeManager.getApplyingRemote())

      // If already applying a remote op, queue it
      if (this.youtubeManager.getApplyingRemote()) {
        this.pendingState = state;
      } else {
        this.youtubeManager.handleRemoteState(state, () => { this.processPendingState(); });
      }
    });
  }

  private processPendingState() {
    if (!this.youtubeManager || !this.pendingState) return;

    const state = this.pendingState;
    this.pendingState = null;

    this.youtubeManager.handleRemoteState(state, () => { this.processPendingState(); });
  }

  /** User wants to load a new video */
  loadVideo(videoUrl: string) {
    if (!this.youtubeManager) return;

    const videoId = extractYouTubeId(videoUrl);
    if (!videoId) {
      alert("Invalid YouTube URL");
      return;
    }

    // Emit to server; server will broadcast back
    socket.emit("video:set", { roomId: this.roomId, videoUrl });
  }

  /** User clicked play */
  emitPlay() {
    if (!this.youtubeManager) return;
    const time = this.youtubeManager.getCurrentTime();

    socket.emit("video:play", {
      roomId: this.roomId,
      currentTime: time,
      isPlaying: true,
      lastUpdate: Date.now(),
    });
  }

  /** User clicked pause */
  emitPause() {
    if (!this.youtubeManager) return;
    const time = this.youtubeManager.getCurrentTime();

    socket.emit("video:pause", {
      roomId: this.roomId,
      currentTime: time,
      isPlaying: false,
      lastUpdate: Date.now(),
    });
  }

  /** User dragged seek bar */
  emitSeek(time: number) {
    if (!this.youtubeManager) return;

    socket.emit("video:seek", {
      roomId: this.roomId,
      currentTime: time,
      isPlaying: this.youtubeManager.isPlaying(),
      lastUpdate: Date.now(),
    });
  }

  destroy() {
    socket.off("video:sync");
    socket.off("video:set");
    this.youtubeManager?.destroy();
    this.youtubeManager = null;
  }
}
