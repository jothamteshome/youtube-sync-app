import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import roomRoutes from "./routes/roomRoutes.js";
import socketEventHandler from "./sockets/eventHandler.js";
import dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();

const app = express();
const httpServer = createServer(app);

export const io = new Server(httpServer, { cors: { origin: "*" } });

app.use(cors());

// Middleware
app.use(express.json());

// Routes
app.use("/api/v1/rooms", roomRoutes);

// Socket.IO events
io.on("connection", (socket) => { socketEventHandler(io, socket); });

const PORT = process.env.PORT;

if (!PORT) {
  throw new Error("PORT not set in production!");
}

httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
