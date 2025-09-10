import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import roomRoutes from "./routes/roomRoutes.js";
import socketEventHandler from "./sockets/eventHandler.js";
import getFormattedDate from "./utils/date.js";
import dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();

const app = express();
const httpServer = createServer(app);

export const io = new Server(httpServer, { 
  path: "/v1/socket-io",
  cors: { origin: "*" } 
});

app.use(cors());

// Middleware
app.use(express.json());

// Routes
app.use("/v1/rooms", roomRoutes);
app.get('/health', (req, res) => {
  console.log(`[${getFormattedDate()}] health check - OK`);
  res.status(200).send("OK");
});


// Socket.IO events
io.on("connection", (socket) => { socketEventHandler(io, socket); });

const PORT = process.env.PORT;

if (!PORT) {
  throw new Error("PORT not set in production!");
}

httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
