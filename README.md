# ChaseQuiz

A **real-time quiz game** inspired by the TV show *The Chase*. Play a Cash Builder round, choose your offer, then face a simulated chaser on the board—escape to bank your winnings.

---

## Features

- **Real-time gameplay** — Room-based sessions with live updates via WebSockets  
- **Cash Builder round** — 60-second timer, 500€ per correct answer  
- **Offer selection** — High, middle, or low offer sets your starting position on the chase board  
- **Chaser AI** — Simulated chaser with difficulty-based knowledge and response delays  
- **Chase round** — 5-second countdown, first to answer triggers the clock  
- **Score & bank tracking** — Winnings depend on whether you escape or get caught  
- **LAN support** — Play from other devices on your network using the host IP  
- **Dockerized** — Run frontend, backend, and MongoDB with one command  

---

## Tech Stack

| Layer | Technologies |
|-------|---------------|
| **Frontend** | React, TypeScript, Vite, TailwindCSS |
| **Backend** | Node.js, Express, TypeScript |
| **Real-time** | Socket.IO (client + server) |
| **Database** | MongoDB, Mongoose |
| **DevOps** | Docker, Docker Compose |

---

## Project Structure

```
ChaseQuiz/
├── frontend/          # React + Vite app
│   ├── src/
│   │   ├── components/   # UI components (Lobby, ChaseBoard, etc.)
│   │   ├── config/       # Runtime config (e.g. backend URL)
│   │   ├── pages/        # Start page
│   │   ├── socket/       # Socket.IO client
│   │   └── types/        # TypeScript types
│   ├── Dockerfile
│   └── package.json
├── backend/           # Node.js + Express API
│   ├── src/
│   │   ├── config/       # DB connection
│   │   ├── game/         # Game logic, chaser, timers
│   │   ├── models/       # Mongoose models
│   │   ├── services/    # Question service
│   │   ├── socket/       # Socket.IO handlers
│   │   └── server.ts
│   ├── scripts/          # e.g. validateQuestions
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml   # Frontend, backend, MongoDB
└── package.json        # Root scripts (concurrently)
```

---

## Running the Project Locally

**Prerequisites:** Node.js (v18+), MongoDB running locally.

### 1. Install dependencies

```bash
# Backend
cd backend && npm install && cd ..

# Frontend
cd frontend && npm install && cd ..
```

### 2. Backend environment

Create `backend/.env`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/chasequiz
PORT=5000
```

### 3. Start the backend

```bash
cd backend && npm run dev
```

### 4. Start the frontend (new terminal)

```bash
cd frontend && npm run dev
```

Or from the **project root** (with `concurrently`):

```bash
npm run dev
```

- **Frontend:** http://localhost:5173  
- **Backend:** http://localhost:5000  

---

## Running with Docker (recommended)

Run the whole stack with one command:

```bash
docker compose up --build
```

**Services:**

| Service   | Port  | Description        |
|----------|-------|--------------------|
| Frontend | 5173  | React + Vite app   |
| Backend  | 5000  | API + Socket.IO    |
| MongoDB  | 27017 | Database           |

- **Frontend:** http://localhost:5173  
- **Backend:** http://localhost:5000  
- **Health check:** http://localhost:5000/health  

MongoDB data is stored in a Docker volume so it persists between restarts.

---

## Running on the Same Local Network

You can open the game from another device (e.g. phone or tablet) on the same Wi‑Fi:

1. Find your machine’s local IP (e.g. `192.168.0.14`).
2. On the other device, open:

   `http://<LOCAL_IP>:5173`

   Example: `http://192.168.0.14:5173`

The frontend connects to the backend using the same hostname, so no extra config is needed when your IP changes.

---

## Stopping Containers

Stop all services:

```bash
docker compose down
```

Stop and remove MongoDB data (volume):

```bash
docker compose down -v
```

---

## Future Improvements

- **Matchmaking** — Join or create public/private rooms  
- **Authentication** — User accounts and sessions  
- **Persistent leaderboards** — Store and display high scores  
- **UI/UX** — Animations, sound effects, responsive polish  
- **Deployment** — Production hosting (e.g. cloud + managed DB)  

---

## Author

**[Your Name](https://github.com/yourusername)**

---

*This project is for educational and entertainment purposes.*
