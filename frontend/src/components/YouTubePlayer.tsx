import { useEffect, useRef } from "react";
import { socket } from "../services/socket";

export interface YouTubePlayerProps {
  roomId: string;
  videoId?: string;
}

declare global {
  interface Window {
    YT: typeof YT;
    onYouTubeIframeAPIReady: () => void;
  }
}

export function YouTubePlayer({ roomId, videoId }: YouTubePlayerProps) {
  const playerRef = useRef<YT.Player | null>(null);
  const lastCheckRef = useRef<number>(0);
  const lastWallClockRef = useRef<number>(Date.now());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!videoId) return;

    function initPlayer() {
        if (playerRef.current) {
            // If player already exists, just load the new video
            playerRef.current.loadVideoById(videoId!);
        } else {
            playerRef.current = new window.YT.Player("yt-player", {
                videoId: videoId,
                playerVars: { playsinline: 1 },
                events: {
                onReady: onPlayerReady,
                onStateChange: onPlayerStateChange,
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
      window.onYouTubeIframeAPIReady = initPlayer;
    } else {
      initPlayer();
    }


    function onPlayerStateChange(event: YT.OnStateChangeEvent) {
      const player = event.target;
      const time = player.getCurrentTime();

      if (event.data === YT.PlayerState.PLAYING) {
        socket.emit("video:play", { roomId, time });
      } else if (event.data === YT.PlayerState.PAUSED) {
        socket.emit("video:pause", { roomId, time });
      } else if (event.data === YT.PlayerState.BUFFERING) {
        socket.emit("video:seek", { roomId, time });
      }
    }


    function onPlayerReady() {
        // Sync events from server
        socket.on("video:play", ({ time }) => {
        if (playerRef.current) {
            playerRef.current.seekTo(time, true);
            playerRef.current.playVideo();
        }
        });

        socket.on("video:pause", ({ time }) => {
        if (playerRef.current) {
            playerRef.current.seekTo(time, true);
            playerRef.current.pauseVideo();
        }
        });

        socket.on("video:seek", ({ time }) => {
        if (playerRef.current) {
            playerRef.current.seekTo(time, true);
        }
        });

        socket.on("video:sync", ({ videoId, currentTime, isPlaying }) => {
            if (!playerRef.current) return;

            if (playerRef.current.getVideoData().video_id !== videoId) {
                playerRef.current.loadVideoById(videoId, currentTime);
            } else {
                playerRef.current.seekTo(currentTime, true);
            }

            if (isPlaying) playerRef.current.playVideo();
            else playerRef.current.pauseVideo();
        });
    }


    intervalRef.current = setInterval(() => {
      const player = playerRef.current;
      console.log('here')
      if (!player || typeof player.getPlayerState !== "function") return;
      if (player.getPlayerState() !== YT.PlayerState.PLAYING) return;

      const currentTime = player.getCurrentTime();
      const now = Date.now();
      const wallDelta = (now - lastWallClockRef.current) / 1000;
      const expectedTime = lastCheckRef.current + wallDelta;

      // Check if jump is too big
      if (Math.abs(currentTime - expectedTime) > 1.5) {
        socket.emit("video:seek", { roomId, time: currentTime });
      }

      lastCheckRef.current = currentTime;
      lastWallClockRef.current = now;
    }, 500);


    return () => {
      socket.off("video:play");
      socket.off("video:pause");
      socket.off("video:seek");
      socket.off("video:sync");
      if (intervalRef.current) clearInterval(intervalRef.current);
      playerRef.current?.destroy();
    };
  }, [roomId, videoId]);

  return (
    <div className="w-full max-w-4xl mx-auto aspect-video">
        <div id="yt-player" className="w-full h-full" />
    </div>
  );
}
