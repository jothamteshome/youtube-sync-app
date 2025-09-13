import { useParams } from "react-router-dom";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { RoomManager } from "../managers/RoomManager";
import SearchBar from "../components/room/SearchBar";
import { YoutubeFrame } from "../components/room/YoutubeFrame";
import RoomInfo from "../components/room/RoomInfo";

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const roomManagerRef = useRef<RoomManager | null>(null);
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (!roomId) return;

    roomManagerRef.current = new RoomManager(roomId);

    return () => roomManagerRef.current?.destroy();
  }, [roomId]);


  const handleLoadVideo = () => {
    if (!roomManagerRef.current) return;
    roomManagerRef.current.loadVideo(url);
  };

  const handleSeek = (time: number) => {
    if (!roomManagerRef.current) return;
    roomManagerRef.current.emitSeek(time);
  };

  const handlePlayPause = (play: boolean) => {
    if (!roomManagerRef.current) return;

    if (play) roomManagerRef.current.emitPlay();
    else roomManagerRef.current.emitPause();
  };


  return (
    <div className="w-full h-full flex flex-col items-center">
      <RoomInfo roomId={roomId!} />

      <SearchBar
        onChange={(e: ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
        onClick={handleLoadVideo}
      />

      <YoutubeFrame />
      <div className="flex gap-2 items-center mt-2">
        <button
          className="px-3 py-1 bg-blue-600 text-white rounded"
          onClick={() => handlePlayPause(true)}
        >
          Play
        </button>
        <button
          className="px-3 py-1 bg-gray-600 text-white rounded"
          onClick={() => handlePlayPause(false)}
        >
          Pause
        </button>
        <input
          type="range"
          min={0}
          max={100}
          className="w-64"
          onChange={(e) => handleSeek(Number(e.target.value))}
        />
      </div>
    </div>
  );
}
