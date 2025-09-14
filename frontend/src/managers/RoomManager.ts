import { socket } from "../services/socket";
import { YoutubeManager } from "./YoutubeManager";
import { extractVideoId } from "../utils/extractVideoId";
import { BaseVideoManager, type VideoState } from "./BaseVideoManager";

type VideoService = "youtube";

export class RoomManager {
  private roomId: string;
  private currentService?: VideoService;
  private videoManagers: Record<VideoService, BaseVideoManager>;

  constructor(roomId: string) {
    this.roomId = roomId;


    this.videoManagers = {
      youtube: new YoutubeManager(this.roomId)
    }

    for (const [service, manager] of Object.entries(this.videoManagers)) {
      manager.initPlayer(`${service}-player`);
    }

    this.registerSocketEvents();
  }

  private registerSocketEvents() {
    // Sync events from server
    socket.on("video:sync", (state: VideoState) => this.sync(state));
  }

  private sync(state: VideoState) {
    const { service } = extractVideoId(state.videoUrl);
    this.currentService = service as VideoService;

    if (!this.currentService) {
      alert(`${service} is an unsupported service`);
      return;
    }
    
    this.videoManagers[this.currentService].sync(state);
  }


  loadVideo(videoUrl: string) {
    const { videoId, service } = extractVideoId(videoUrl);

    if (!videoId) {
      alert("Invalid URL");
      return;
    }

    if (!service || !(service in this.videoManagers)) {
      alert(`${service} is an unsupported service`);
      return;
    }

    this.currentService = service as VideoService;

    socket.emit("video:set", { roomId: this.roomId, videoUrl });
  }

  destroy() {
    socket.off("video:sync");
    socket.off("video:set");
    Object.values(this.videoManagers).forEach(manager => manager.destroy());
  }
}
