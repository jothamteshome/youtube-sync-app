import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { rooms } from "../models/roomState.js";
import getFormattedDate from "../utils/date.js";

const router = Router();

router.post("/create-room", (req, res) => {
  console.log(`[${getFormattedDate()}] creating room`);
  const roomId = uuidv4();
  const { videoUrl } = req.body;

  rooms.set(roomId,
    {
    videoUrl,
    currentTime: 0,
    isPlaying: false,
    lastUpdate: Date.now()
    }
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
