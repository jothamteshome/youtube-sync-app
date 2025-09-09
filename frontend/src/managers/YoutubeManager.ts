import { socket } from "../services/socket";
import { extractYouTubeId } from "../utils/youtube";

declare global {
    interface Window {
        YT: typeof YT;
        onYouTubeIframeAPIReady: () => void;
    }
}

export class YoutubeManager {
    private player: YT.Player | null = null;
    private roomId: string;
    private isInitialSync: boolean = true;
    readonly driftThreshold: number = 0.5;

    constructor(roomId: string) {
        this.roomId = roomId;

        // Sync events from server
        socket.on("video:sync", ({ videoUrl, currentTime, isPlaying, lastUpdate }) => this.videoSyncHandler(videoUrl, currentTime, isPlaying, lastUpdate));
    }

    destroy() {
        socket.off("video:sync");
        this.player?.destroy();
        this.player = null;
    }

    private videoSyncHandler(videoUrl: string, currentTime: number, isPlaying: boolean, lastUpdate: number) {
        if (!this.player) return;

        // Set new videoId from youtube video url
        const videoId = extractYouTubeId(videoUrl);
        if (!videoId) return;

        // If video changed
        if (this.player.getVideoData()?.video_id !== videoId) {
            this.player.loadVideoById(videoId, currentTime);
            return;
        }

        // Calculate drift
        let targetTime = currentTime;
        if (isPlaying) {
            const elapsed = (Date.now() - lastUpdate) / 1000;
            targetTime += elapsed;
        }

        const drift = Math.abs(this.player.getCurrentTime() - targetTime);
        if (drift > this.driftThreshold) {
            this.player.seekTo(targetTime, true);
        }

        if (isPlaying && this.player.getPlayerState() !== YT.PlayerState.PLAYING) {
            this.player.playVideo();
        } else if (!isPlaying && this.player.getPlayerState() !== YT.PlayerState.PAUSED) {
            this.player.pauseVideo();
        }
    }

    private onPlayerReady = () => {
        // Join room
        if (!socket.connected) {
            socket.connect();
            socket.once("connect", () => {
                socket.emit("video:join", { roomId: this.roomId });
            });
        } else {
            socket.emit("video:join", { roomId: this.roomId });
        }
    }

    private onPlayerStateChange = (event: YT.OnStateChangeEvent) => {
        if (this.isInitialSync) {
            this.isInitialSync = false;
            return;
        }

        const player = event.target;
        const time = player.getCurrentTime();

        if (event.data === YT.PlayerState.PLAYING) {
            socket.emit("video:play", { roomId: this.roomId, time });
        } else if (event.data === YT.PlayerState.PAUSED) {
            socket.emit("video:pause", { roomId: this.roomId, time });
        }
        // else if (event.data === YT.PlayerState.BUFFERING && player.getVideoLoadedFraction() < 1) {
        //     socket.emit("video:seek", { roomId: this.roomId, time });
        // }
    }

    initPlayer(containerId = "yt-player") {
        const init = () => {
            if (this.player) return;

            this.player = new window.YT.Player(containerId, {
                playerVars: { playsinline: 1 },
                events: {
                    onReady: this.onPlayerReady,
                    onStateChange: this.onPlayerStateChange,
                },
            });
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
}