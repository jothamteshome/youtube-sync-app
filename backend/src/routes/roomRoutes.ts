import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { roomManager } from "../models/RoomManager.js";
import getFormattedDate from "../utils/date.js";

const router = Router();

/** Route to create a new room on the server  */
router.post("/create-room", (req, res) => {
  console.log(`[${getFormattedDate()}] creating room`);
  const roomId = uuidv4();

  roomManager.createRoom(roomId);

  res.json({ roomId });
});


/** Route to get a room on the server  */
router.get("/:roomId", (req, res) => {
  const { roomId } = req.params;

  if (roomManager.videoStates.has(roomId)) {
    res.status(200).json(roomManager.videoStates.get(roomId));
  } else {
    res.status(404).json({ error: "Room not found" });
  }

});

export default router;
