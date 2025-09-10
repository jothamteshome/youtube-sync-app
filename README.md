# Watch Together App

A real-time collaborative platform to watch YouTube videos with friends. Users can create or join rooms, synchronize playback, and enjoy videos together in perfect sync.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Sync Behavior](#sync-behavior)

---

## Features

- Create and join rooms for private video sessions
- Real-time YouTube video playback synchronization
- Load YouTube videos via URL
- Latency tracking and sync correction
- Responsive frontend interface with search bar
- Optional room info tooltip (room ID + latency)
- Works across multiple devices and users

---

## Tech Stack

- **Frontend:** React, TypeScript, TailwindCSS, Vite  
- **Backend:** Node.js, Express, Socket.IO  
- **Realtime Sync:** WebSockets via Socket.IO  
- **Hosting:** EC2, CloudFront, S3, Route53  
- **Video:** YouTube IFrame API

---

## Installation

### Prerequisites

- Node.js >= 22.x (required for Vite 7+)  
- npm >= 10.x  

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
npm run dev
```

---

## Configuration
Create `.env` files for frontend and backend.

### Frontend `.env`:
```env
VITE_BACKEND_URL=https://[your-domain].com
```

### Backend `.env`:
```env
PORT=4000
```

---

## Usage

1. Open the frontend in a browser: `http://localhost:5173` (or deployed URL)
2. Click **Create Room** to start a session
3. Copy the room link to share with friends
4. Paste a YouTube URL to load a video
5. Playback is synchronized across all participants

---

## Sync Behavior

- The backend keeps track of video start time and playback state
- Joining users automatically sync to the current playback time
- Latency corrections prevent drift between clients
- All video events (play, pause, seek) are propagated in real-time
