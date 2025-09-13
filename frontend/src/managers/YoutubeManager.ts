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
    private eventId: number = -1;
    readonly driftThreshold: number = 0.5;

    constructor(roomId: string) {
        this.roomId = roomId;

        // Sync events from server
        socket.on("video:sync", ({ videoUrl, currentTime, isPlaying, lastUpdate, eventId }) => this.videoSyncHandler(videoUrl, currentTime, isPlaying, lastUpdate, eventId));
    }

    destroy() {
        socket.off("video:sync");
        this.player?.destroy();
        this.player = null;
    }

    private videoSyncHandler(videoUrl: string, currentTime: number, isPlaying: boolean, lastUpdate: number, eventId: number) {
        if (!this.player) return;

        // Ignore sync events if the eventId is less than or equal to what is known to the client
        if (this.eventId >= eventId) return;
        
        // Update this.eventId
        this.eventId = eventId;

        // Set new videoId from youtube video url
        const videoId = extractYouTubeId(videoUrl);
        if (!videoId) return;

        // If video changed
        if (this.player.getVideoData()?.video_id !== videoId) {
            this.player.loadVideoById(videoId, currentTime);
            return;
        }


        const drift = Math.abs(this.player.getCurrentTime() - currentTime);
        if (drift > this.driftThreshold) {
            this.player.seekTo(currentTime, true);
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
        const player = event.target;
        const time = player.getCurrentTime();

        if (event.data === YT.PlayerState.PLAYING) {
            socket.emit("video:play", { roomId: this.roomId, time, eventId: this.eventId });
        } else if (event.data === YT.PlayerState.PAUSED) {
            socket.emit("video:pause", { roomId: this.roomId, time, eventId: this.eventId });
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