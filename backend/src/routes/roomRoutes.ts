import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { rooms, type RoomState } from "../models/roomState.js";

const router = Router();

router.post("/create-room", (req, res) => {
  const roomId = uuidv4();
  const { videoId } = req.body;

  rooms.set(roomId,
    {
      videoId: videoId || null,
      currentTime: 0,
      isPlaying: false,
      users: {}
    } as RoomState
  );

  res.json({ roomId });
});


router.get("/:roomId", (req, res) => {
  const { roomId } = req.params;

  if ( rooms.has(roomId) ) {
    res.json(rooms.get(roomId));
  } else {
    res.status(404).json({ error: "Room not found" });
  }

});

export default router;
