import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useParams } from "react-router-dom";
import SearchBar from "../components/room/SearchBar";
import RoomInfo from "../components/room/RoomInfo";
import YoutubeVideo from "../components/youtube/YoutubeVideo";
import RoomManager from "../managers/RoomManager";
import type VideoData from "../models/VideoData";


export default function RoomPage() {
  const params = useParams();
  const roomId = params.roomId!;
  const roomManagerRef = useRef<RoomManager | null>(null);
  const [url, setUrl] = useState("");
  const [videoData, setVideoData] = useState<VideoData>();

  useEffect(() => {
    if (!roomId) return;

    const onVideoChanged = async () => {
      const videoId = roomManagerRef.current?.getVideoId();
      if (!videoId) return;

      try {
        const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/v1/youtube-api/video/${videoId}`);
        const data = await response.json();

        setVideoData(data);
      } catch {
        console.error(`Unable to retrieve data about video ${videoId}`);
      }
    };

    roomManagerRef.current = new RoomManager(roomId, onVideoChanged);

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

      <YoutubeVideo videoData={videoData} />
    </div>
  );
}
