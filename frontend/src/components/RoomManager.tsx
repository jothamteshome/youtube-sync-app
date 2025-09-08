import { useState, useEffect, useRef } from "react";
import { createRoom } from "../services/room";
import { socket } from "../services/socket";
import { YoutubeManager } from "../managers/YoutubeManager";

export function RoomManager() {
    const [roomId, setRoomId] = useState<string | null>(null);
    const youtubeManagerRef = useRef<YoutubeManager | null>(null);
    const [url, setUrl] = useState<string>("");

    useEffect(() => {
        const parts = window.location.pathname.split("/");
        if (parts[1]) {
            const existingRoomId = parts[1];
            setRoomId(existingRoomId);

            youtubeManagerRef.current = new YoutubeManager(existingRoomId);
            youtubeManagerRef.current.initPlayer("yt-player");
        }
    }, []);

    const handleCreateRoom = async () => {
        try {
            const newRoomId = await createRoom();
            setRoomId(newRoomId);

            // Update URL
            window.history.pushState({}, "", `/${newRoomId}`);

            // Initialize YoutubeManager for this room
            youtubeManagerRef.current = new YoutubeManager(newRoomId);
            youtubeManagerRef.current.initPlayer("yt-player");
        } catch (err) {
            console.error("Error creating room:", err);
        }
    };


    const handleLoadVideo = () => {
        if (!url || !roomId || !youtubeManagerRef.current) return;

        const videoId = extractYouTubeId(url);
        if (!videoId) {
            alert("Invalid YouTube URL");
            return;
        }

        // Load video into existing player
        youtubeManagerRef.current.setVideo(videoId);

        // Notify server to update room state and broadcast to others
        socket.emit("video:set", { roomId, videoId, eventProcessedCount: 0 });
    };

    const extractYouTubeId = (url: string): string | null => {
        const regex = /(?:youtube\.com\/.*v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
    };

    return (
        <div className="room-manager">
            {!roomId ? (
                <button onClick={handleCreateRoom}>Create Room</button>
            ) : (
                <>
                    <div>
                        <input
                            type="text"
                            placeholder="Paste YouTube URL"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                        <button onClick={handleLoadVideo}>Load Video</button>
                    </div>

                    <div id="yt-player" style={{ width: "640px", height: "360px" }} />
                </>
            )}
        </div>
    );
}
