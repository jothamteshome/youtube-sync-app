import { useState, useEffect } from "react";
import { createRoom } from "../services/room";
import { joinRoom, socket } from "../services/socket";
import { YouTubePlayer } from "./YouTubePlayer";

export function RoomManager() {
    const [roomId, setRoomId] = useState<string | null>(null);
    const [videoId, setVideoId] = useState<string | undefined>();
    const [videoUrl, setVideoUrl] = useState<string>("");

    useEffect(() => {
        const path = window.location.pathname;
        const match = path.match(/^\/room\/(.+)$/);

        if (match) {
            const existingRoomId = match[1];
            setRoomId(existingRoomId);
            joinRoom(existingRoomId);
        }
    }, []);

    function handleSetVideo() {
        const id = extractVideoId(videoUrl);
        setVideoId(id);

        // Notify server to update room state and broadcast to others
        socket.emit("video:set", { roomId, videoId });
    }

    async function handleCreateRoom() {
        const newRoomId = await createRoom();
        setRoomId(newRoomId);
        setRoomUrl(newRoomId);

        // Join the room via socket
        joinRoom(newRoomId);
    }


    function setRoomUrl(roomId: string) {
        window.history.pushState({ roomId }, "", `/room/${roomId}`);
    }


    function extractVideoId(url: string) {
        try {
            const parsed = new URL(url);
            if (parsed.hostname.includes("youtu.be")) {
                return parsed.pathname.slice(1);
            }
            if (parsed.hostname.includes("youtube.com")) {
                return parsed.searchParams.get("v") || undefined;
            }
        } catch {
            return undefined;
        }
        return undefined;
    }

    if (!roomId) {
        return <button onClick={handleCreateRoom}>Create Room</button>;
    }

    return (
        <div>
            {/* URL input bar at the top */}
            <div className="flex mb-[1rem]">
                <input
                    className="flex padding-[0.5rem]"
                    type="text"
                    placeholder="Enter YouTube URL"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                />
                <button onClick={handleSetVideo} style={{ padding: "0.5rem 1rem" }}>
                    Load Video
                </button>
            </div>

            {/* The YouTube player */}
            <YouTubePlayer roomId={roomId} videoId={videoId} />
        </div>
    );
}
