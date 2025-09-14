import { socket } from "../services/socket";
import { extractVideoId } from "../utils/extractVideoId";
import { BaseVideoManager, type VideoState } from "./BaseVideoManager";

declare global {
    interface Window {
        YT: typeof YT;
        onYouTubeIframeAPIReady: () => void;
    }
}

export class YoutubeManager extends BaseVideoManager {
    private player: YT.Player | null = null;

    destroy() {
        this.player?.destroy();
        this.player = null;
    }

    public initPlayer(containerId = "youtube-player") {
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

    public sync(state: VideoState): void {
        this.syncHandler(state);
    }
    

    protected syncHandler({ videoUrl, currentTime, isPlaying, playbackRate, eventId }: VideoState): void {
        if (!this.player) return;

        // Ignore sync events if the eventId is less than or equal to what is known to the client
        if (this.eventId >= eventId) return;

        // Update this.eventId
        this.eventId = eventId;

        // Set new videoId from youtube video url
        const { videoId } = extractVideoId(videoUrl);
        if (!videoId) return;


        // Load new video if video has changed
        if (this.player.getVideoData()?.video_id !== videoId) {
            this.player.loadVideoById(videoId, currentTime);
        }

        
        // Load new playback rate if it has changed
        if (this.player.getPlaybackRate() !== playbackRate) {
            this.player.setPlaybackRate(playbackRate);
        }


        // Compute drift due to network latency
        const drift = Math.abs(this.player.getCurrentTime() - currentTime);
        if (drift > this.driftThreshold) {
            this.player.seekTo(currentTime, true);
        }


        // Update player state
        if (isPlaying && this.player.getPlayerState() !== YT.PlayerState.PLAYING) {
            this.player.playVideo();
        } else if (!isPlaying && this.player.getPlayerState() !== YT.PlayerState.PAUSED) {
            this.player.pauseVideo();
        }
    }


    protected monitorPlaybackRate(): void {
        setInterval(() => {
            if (!this.player) return;
            const currentRate = this.player.getPlaybackRate();

            if (currentRate !== this.lastPlaybackRate) {
                this.lastPlaybackRate = currentRate;

                socket.emit("video:playbackrate", { roomId: this.roomId, time: this.player.getCurrentTime(), eventId: this.eventId, playbackRate: currentRate});
            }
        }, 200);
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

        this.monitorPlaybackRate();
    }


    private onPlayerStateChange = (event: YT.OnStateChangeEvent) => {
        const player = event.target;
        const time = player.getCurrentTime();
        const playbackRate = player.getPlaybackRate();

        if (event.data === YT.PlayerState.PLAYING) {
            socket.emit("video:play", { roomId: this.roomId, time, eventId: this.eventId, playbackRate });
        } else if (event.data === YT.PlayerState.PAUSED) {
            socket.emit("video:pause", { roomId: this.roomId, time, eventId: this.eventId, playbackRate });
        }
    }
}