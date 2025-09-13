import { socket } from "../services/socket";
import { BaseVideoManager, type VideoState } from "./BaseVideoManager";
import { extractYouTubeId } from "../utils/youtube";

declare global {
    interface Window {
        YT: typeof YT;
        onYouTubeIframeAPIReady: () => void;
    }
}

export class YoutubeManager extends BaseVideoManager {
    private player: YT.Player | null = null;

    initPlayer(containerId = "yt-player") {
        const init = () => {
            if (this.player) return;

            this.player = new window.YT.Player(containerId, {
                playerVars: { controls: 0, modestbranding: 1, rel: 0, autoplay: 1 },
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

    destroy() {
        this.player?.destroy();
        this.player = null;
    };

    getCurrentTime() {
        return this.player?.getCurrentTime() ?? 0;
    };

    getDuration() {
        return this.player?.getDuration() ?? 0;
    };

    play() {
        this.player?.playVideo();
    };

    pause() {
        this.player?.pauseVideo();
    };

    seek(time: number) {
        this.player?.seekTo(time, true);
    };

    isPlaying(): boolean {
        return this.player?.getPlayerState() === YT.PlayerState.PLAYING;
    }

    loadVideoByUrl(videoUrl: string): void {
        // Set new videoId from youtube video url
        const videoId = extractYouTubeId(videoUrl);
        if (!videoId) return;

        this.player?.loadVideoById(videoId, 0);
    }


    protected applyRemoteState({ videoUrl, currentTime, isPlaying }: VideoState, onComplete: () => void): void {
        if (!this.player) return;

        // Set new videoId from youtube video url
        const videoId = extractYouTubeId(videoUrl);
        if (!videoId) return;

        // If video changed
        if (this.player.getVideoData()?.video_id !== videoId) {
            this.player.loadVideoById(videoId, currentTime);
            return;
        }

        const drift = Math.abs(this.getCurrentTime() - currentTime);
        if (drift > this.driftThreshold) this.seek(currentTime);

        if (isPlaying && this.player.getPlayerState() !== YT.PlayerState.PLAYING) this.play();
        else if (!isPlaying && this.player.getPlayerState() !== YT.PlayerState.PAUSED) this.pause();

        onComplete();
    };

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
    };

    private onPlayerStateChange = (event: YT.OnStateChangeEvent) => {
        if (this.isApplyingRemote) {
            this.isApplyingRemote = false;
        }

        const time = this.getCurrentTime();
        if (event.data === YT.PlayerState.PLAYING) socket.emit("video:play", { roomId: this.roomId, time });
        else if (event.data === YT.PlayerState.PAUSED) socket.emit("video:pause", { roomId: this.roomId, time });
    };
}