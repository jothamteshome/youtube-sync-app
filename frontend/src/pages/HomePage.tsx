import { useNavigate } from "react-router-dom";
import { createRoom } from "../services/room";

export default function HomePage() {
  const navigate = useNavigate();

  const handleCreateRoom = async () => {
    const newRoomId = await createRoom();
    navigate(`/room/${newRoomId}`);
  };

  return (
    <div>
      <h1>Welcome</h1>
      <button onClick={handleCreateRoom}>Create Room</button>
    </div>
  );
}
