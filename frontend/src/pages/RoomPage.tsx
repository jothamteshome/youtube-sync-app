import { useParams } from "react-router-dom";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { RoomManager } from "../managers/RoomManager";
import SearchBar from "../components/room/SearchBar";
import { YoutubeFrame } from "../components/room/YoutubeFrame";
import RoomInfo from "../components/room/RoomInfo";

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

    roomManagerRef.current.loadVideo(url);
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
