import { useNavigate } from "react-router-dom";
import { createRoom } from "../../services/room";



export default function CreateRoom() {
    const navigate = useNavigate();

    const handleCreateRoom = async () => {
        const newRoomId = await createRoom();
        navigate(`/room/${newRoomId}`);
    };

    return (
        <button
            className="bg-red-600 text-white font-medium text-lg px-8 py-3 rounded-lg shadow hover:bg-red-700 transition"
            onClick={handleCreateRoom}
        >
            Create Room
        </button>
    );
}
