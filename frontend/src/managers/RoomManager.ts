import { BaseVideoManager, type VideoState } from "./BaseVideoManager";
import YoutubeManager from "./YoutubeManager";
import { socket } from "../services/socket";
import extractVideoId from "../utils/extractVideoId";


type VideoService = "youtube";


/**
 * Manages video playback and synchronization for a room.
 * Acts as a coordinator between socket events and video service managers (e.g. YouTube).
 */
export default class RoomManager {
  private roomId: string;
  private videoId?: string;
  private currentService?: VideoService;
  private videoManagers: Record<VideoService, BaseVideoManager>;
  private onVideoChange: () => void;


  /**
   * Creates a new RoomManager instance for a specific room.
   *
   * @param roomId - The unique identifier for the room.
   */
  constructor(roomId: string, onVideoChange: () => void) {
    this.roomId = roomId;
    this.onVideoChange = onVideoChange;

    this.videoManagers = {
      youtube: new YoutubeManager(this.roomId)
    }

    for (const [service, manager] of Object.entries(this.videoManagers)) {
      manager.initPlayer(`${service}-player`);
    }

    this.registerSocketEvents();
  }


  /**
   * Registers socket listeners to handle incoming server events
   * (e.g. video synchronization).
   *
   * @private
   */
  private registerSocketEvents() {
    // Sync events from server
    socket.on("video:sync", (state: VideoState) => this.sync(state));
  }


  /**
   * Syncs the local player state with the server-provided video state.
   *
   * @param state - The current state of the video, including URL, time, etc.
   * @private
   */
  private sync(state: VideoState) {
    const { videoId, service } = extractVideoId(state.videoUrl);
    this.videoId = videoId;
    this.currentService = service as VideoService;

    if (!this.videoId) {
      alert("Invalid URL");
      return;
    }

    if (!this.currentService) {
      alert(`${service} is an unsupported service`);
      return;
    }
    
    this.videoManagers[this.currentService].sync(state);
    this.onVideoChange();
  }


  /**
   * Loads a new video into the current room. Validates the URL and notifies the server.
   *
   * @param videoUrl - The full video URL to load (e.g. YouTube link).
   */
  public loadVideo(videoUrl: string) {
    const { videoId, service } = extractVideoId(videoUrl);

    if (!videoId) {
      alert("Invalid URL");
      return;
    }

    if (!service || !(service in this.videoManagers)) {
      alert(`${service} is an unsupported service`);
      return;
    }

    this.videoId = videoId;
    this.currentService = service as VideoService;

    socket.emit("video:set", { roomId: this.roomId, videoUrl });
  }


  public getVideoId(): string | undefined {
    return this.videoId;
  }


  /**
   * Cleans up all resources associated with this RoomManager,
   * including socket listeners and video manager instances.
   */
  destroy() {
    socket.off("video:sync");
    socket.off("video:set");
    Object.values(this.videoManagers).forEach(manager => manager.destroy());
  }
}
