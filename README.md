# ChaseQuiz

A real-time multiplayer quiz game inspired by The Chase.

## Project Structure

```
ChaseQuiz/
├── frontend/          # React + Vite + TypeScript + Tailwind
├── backend/           # Node.js + Express + Socket.IO
├── package.json       # Root scripts
└── README.md
```

## Setup

### 1. Install dependencies

Run these commands in PowerShell (from the project root or each folder):

```powershell
# Frontend
cd c:\Users\User\Desktop\ChaseQuiz\frontend
npm install

# Backend (in a new terminal or after the first completes)
cd c:\Users\User\Desktop\ChaseQuiz\backend
npm install
```

### 2. Run locally

**Option A – two terminals**

```powershell
# Terminal 1 – Backend (port 5000)
cd c:\Users\User\Desktop\ChaseQuiz\backend
npm run dev

# Terminal 2 – Frontend (port 5173)
cd c:\Users\User\Desktop\ChaseQuiz\frontend
npm run dev
```

**Option B – from project root (PowerShell)**

```powershell
# Terminal 1 – Backend
cd c:\Users\User\Desktop\ChaseQuiz\backend; npm run dev

# Terminal 2 – Frontend
cd c:\Users\User\Desktop\ChaseQuiz\frontend; npm run dev
```

### 3. Open the app

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

When the frontend loads and connects to the backend, you should see  
`Connected to ChaseQuiz server` in the browser console.
