import { socket } from "../services/socket";

declare global {
  interface Window {
    YT: typeof YT;
    onYouTubeIframeAPIReady: () => void;
  }
}

export class YoutubeManager {
    private player: YT.Player | null = null;
    private roomId: string;
    private videoId?: string;

    constructor(roomId: string, videoId?: string) {
        console.log("Creating room");

        this.roomId = roomId;
        this.videoId = videoId;

        // Sync events from server
        socket.on("video:play", ({ time, eventProcessedCount }) => this.videoPlayHandler(time, eventProcessedCount));
        socket.on("video:pause", ({ time, eventProcessedCount }) => this.videoPauseHandler(time, eventProcessedCount));
        socket.on("video:seek", ({ time, eventProcessedCount }) => this.videoSeekHandler(time, eventProcessedCount));
        socket.on("video:sync", ({ videoId: syncVideoId, currentTime, isPlaying, eventProcessedCount }) => this.videoSyncHandler(syncVideoId, currentTime, isPlaying, eventProcessedCount));
    }

    destroy() {
        socket.off("video:play");
        socket.off("video:pause");
        socket.off("video:seek");
        socket.off("video:sync");
        this.player?.destroy();
        this.player = null;
    }


    private videoPlayHandler(time: number, eventProcessedCount: number) {
        if (!this.player || eventProcessedCount > 1) return;

        this.player.seekTo(time, true);
        this.player.playVideo();
    }

    private videoPauseHandler(time: number, eventProcessedCount: number) {
        if (!this.player || eventProcessedCount > 1) return;

        this.player.seekTo(time, true);
        this.player.pauseVideo();
    }

    private videoSeekHandler(time: number, eventProcessedCount: number) {
        if (!this.player || eventProcessedCount > 1) return;

        this.player.seekTo(time, true);
    }

    private videoSyncHandler(videoId: string, currentTime: number, isPlaying: boolean, eventProcessedCount: number) {
        if (!this.player || eventProcessedCount > 1) return;

        if (this.player.getVideoData()?.video_id !== videoId) {
            this.player.loadVideoById(videoId, currentTime);
        } else {
            this.player.seekTo(currentTime, true);
        }


        if (isPlaying && this.player.getPlayerState() !== YT.PlayerState.PLAYING) this.player.playVideo();
        else if (!isPlaying && this.player.getPlayerState() !== YT.PlayerState.PAUSED) this.player.pauseVideo();

    }

    private onPlayerReady = () => {
        // Join room
        if (!socket.connected) {
            socket.connect();
            socket.once("connect", () => {
                socket.emit("video:join", { roomId: this.roomId, eventProcessedCount: 0 });
            });
        } else {
            socket.emit("video:join", { roomId: this.roomId, eventProcessedCount: 0 });
        }
    }

    private onPlayerStateChange = (event: YT.OnStateChangeEvent) => {
        const player = event.target;
        const time = player.getCurrentTime();

        if (event.data === YT.PlayerState.PLAYING) {
            socket.emit("video:play", { roomId: this.roomId, time, eventProcessedCount: 0 });
        } else if (event.data === YT.PlayerState.PAUSED) {
            socket.emit("video:pause", { roomId: this.roomId, time, eventProcessedCount: 0 });
        } 
        // else if (event.data === YT.PlayerState.BUFFERING && player.getVideoLoadedFraction() < 1) {
        //     socket.emit("video:seek", { roomId: this.roomId, time, eventProcessedCount: 0 });
        // }
    }

    initPlayer(containerId = "yt-player") {
        const init = () => {
            if (this.player) {
                if (this.videoId) {
                    // If player already exists, just load the new video
                    this.player.loadVideoById(this.videoId);
                } else {
                    console.log("Player exists but videoId is null");
                }
            } else {
                this.player = new window.YT.Player(containerId, {
                    playerVars: { playsinline: 1 },
                    events: {
                        onReady: this.onPlayerReady,
                        onStateChange: this.onPlayerStateChange,
                    },
                });
            }
        }


        // Load YouTube API script if not already loaded
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode!.insertBefore(tag, firstScriptTag);
      window.onYouTubeIframeAPIReady = init;
    } else {
      init();
    }

    };


    setVideo(videoId: string) {
        this.videoId = videoId;

        if (this.player) {
            this.player.loadVideoById(videoId);
        }
    }
}