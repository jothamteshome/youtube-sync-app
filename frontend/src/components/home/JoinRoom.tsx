import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function JoinRoom() {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState<string>("");
  const [invalidRoom, setInvalidRoom] = useState<boolean>(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInvalidRoom(false);
    setRoomId(e.target.value);
  };


  const onClick = async () => {
    try {
      await fetch(`/${roomId}`);

      if (!roomId) {
        setInvalidRoom(true);
        return;
      }
      navigate(`/room/${roomId}`);
    } catch {
      setInvalidRoom(true);
    }
  };

  const getRoomInputColor = () => {
    if (invalidRoom) return "outline-red-600";
    else return "outline-gray-600";
  };

  return (
    <div className="flex gap-3 w-full">
      <input
        type="text"
        placeholder="Enter Room ID"
        className={`bg-white text-black flex-1 px-4 py-3 rounded-lg outline ${getRoomInputColor()} focus:outline-none focus:ring-2 focus:ring-blue-500 transition`}
        onChange={onChange}
        id="roomIdInput"
      />
      <button
        className="bg-red-600 text-white font-medium px-6 py-3 rounded-lg shadow hover:bg-red-700 transition"
        onClick={onClick}
      >
        Join
      </button>
    </div>
  );
}
