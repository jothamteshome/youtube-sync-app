import { useParams } from "react-router-dom";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { RoomManager } from "../managers/RoomManager";
import SearchBar from "../components/SearchBar";
import { YoutubeFrame } from "../components/YoutubeFrame";
import RoomInfo from "../components/RoomInfo";

export default function RoomPage() {
  const params = useParams();
  const roomId = params.roomId!;
  const roomManagerRef = useRef<RoomManager | null>(null);
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (!roomId) return;

    roomManagerRef.current = new RoomManager(roomId);

    return () => roomManagerRef.current?.destroy();
  }, [roomId]);

  const handleLoadVideo = () => {
    if (!roomId || !roomManagerRef.current) return;

    const videoId = extractYouTubeId(url);
    if (!videoId) {
      alert("Invalid YouTube URL");
      return;
    }

    roomManagerRef.current.loadVideo(videoId);
  };

  const extractYouTubeId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/.*v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  return (
    <div className="w-full h-full flex flex-col items-center">
      <RoomInfo roomId={roomId} />

      <SearchBar
        onChange={(e: ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
        onClick={handleLoadVideo}
      />

      <YoutubeFrame />
    </div>
  );
}
