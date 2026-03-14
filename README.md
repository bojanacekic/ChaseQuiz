# ChaseQuiz

ChaseQuiz is a real-time quiz game inspired by the TV show **"The Chase"**. The current version is **single-player**: you compete against a **simulated chaser** controlled by the backend. The player first plays a Cash Builder round to earn money, then selects an offer and enters the Chase round where the chaser tries to catch them.

---

## Main Features

### Cash Builder Round

- **60 second timer** – answer as many questions as you can before time runs out
- **500€ per correct answer** – build your prize fund
- Questions are loaded **randomly from MongoDB**

### Offer Selection

After the Cash Builder, you choose one of three offers:

- **High offer** – riskier, start further from home on the chase board
- **Middle offer** – bank your Cash Builder total
- **Low offer** – safer, start closer to home

The chosen offer determines your **starting position** on the chase board.

### Chase Round

- **Player vs simulated chaser** – the chaser is controlled by the backend
- **First to answer** starts a **5-second countdown**
- The other side has **up to 5 seconds** to answer
- If **both answer before the countdown ends**, the countdown stops immediately and the question is resolved
- **Correct answers** move your token (or the chaser's) forward one step on the board

### Game Outcomes

| Outcome   | Condition                          | Winnings        |
|----------|-------------------------------------|-----------------|
| **Escape** | Player reaches HOME (position 8)   | Selected bank offer |
| **Caught** | Chaser lands on the same cell as the player | **0€**          |

- **Caught** → winnings = **0€**
- **Escaped** → winnings = **selected bank offer**

---

## Chase Board

The board has 9 positions (0–8):

| Position | Label          | Notes                    |
|----------|----------------|--------------------------|
| **0**    | CHASER START   | Chaser begins here       |
| 1        | —              |                          |
| **2**    | —              | High offer start         |
| **3**    | —              | Middle offer start       |
| **4**    | —              | Low offer start          |
| 5        | —              |                          |
| 6        | —              |                          |
| 7        | —              |                          |
| **8**    | **HOME**       | Player must reach here to escape |

The board is shown **vertically**: 0 at the top, 8 (HOME) at the bottom.

---

## Chaser AI

The chaser is **simulated on the backend**. For each question in the Chase round, the backend determines:

- **Whether the chaser knows the answer** – based on the question’s difficulty (see table below)
- **How long the chaser takes to respond** – if the chaser knows the answer, a random thinking delay is applied

**Chaser knowledge by difficulty:**

| Difficulty | Chance |
|-----------|--------|
| Easy      | 90%    |
| Medium    | 75%    |
| Hard      | 60%    |

When the chaser knows the answer, a random response delay between **1.5s and 5.5s** is generated before the chaser’s answer is submitted.

---

## Answer Reveal System

After each question is resolved:

- The **correct answer** is always highlighted in **green**.
- If the player selected a **wrong answer**, that option is shown in **red** (the correct answer remains green so both are visible).
- A short **reveal delay** gives the player time to see the result before the next question loads.

---

## Technology Stack

| Layer    | Technologies                          |
|----------|---------------------------------------|
| **Frontend** | React, TypeScript, TailwindCSS, Socket.IO client |
| **Backend**  | Node.js, Express, Socket.IO, TypeScript |
| **Database** | MongoDB, Mongoose                     |

---

## Questions (MongoDB)

Questions are **stored in MongoDB** and **fetched randomly during gameplay** (Cash Builder and Chase round). They are held in the **`questions`** collection.

Each document includes:

| Field           | Type     | Description                    |
|-----------------|----------|--------------------------------|
| `text`          | string   | Question text                  |
| `options`       | string[] | Exactly 3 answer options       |
| `correctAnswer` | string   | The correct option text        |
| `difficulty`   | string   | `"easy"`, `"medium"`, or `"hard"` |
| `category`     | string   | e.g. Geography, Science        |
| `round`        | string   | `"cash_builder"` or `"chase"`  |

**Example document:**

```json
{
  "text": "Who wrote Hamlet?",
  "options": ["Shakespeare", "Dickens", "Tolkien"],
  "correctAnswer": "Shakespeare",
  "difficulty": "easy",
  "category": "literature",
  "round": "cash_builder"
}
```

---

## Running the Project Locally

### Prerequisites

- **Node.js** (v18+)
- **MongoDB** running locally

### 1. Start MongoDB

```bash
mongod
```

(Or start MongoDB in the way you normally do on your system.)

### 2. Backend setup

```bash
cd backend
npm install
```

### 3. Backend environment

Create a **`.env`** file in the `backend` folder:

```env
MONGO_URI=mongodb://127.0.0.1:27017/chasequiz
PORT=5000
```

### 4. Start the backend

```bash
npm run dev
```

The API and Socket.IO server will run at **http://localhost:5000**.

### 5. Frontend setup

In a **new terminal**:

```bash
cd frontend
npm install
```

### 6. Start the frontend

```bash
npm run dev
```

Vite will serve the app (e.g. **http://localhost:5173**). Open that URL in your browser.

### Run everything from the project root (optional)

From the **project root**:

```bash
npm run dev
```

This starts both backend and frontend together (requires `concurrently` to be set up in the root `package.json`).

---

## Running with Docker

The whole app (frontend, backend, and MongoDB) can be run with Docker Compose.

From the **project root**:

```bash
docker compose up --build
```

Then open in your browser:

- **Frontend:** http://localhost:5173  
- **Backend (API / Socket.IO):** http://localhost:5000  

MongoDB runs in a container and data is stored in a Docker volume so it persists between restarts.

**LAN access:** You can open the app from another device on the same network (e.g. `http://<host-ip>:5173`). The frontend connects to the backend using the same hostname, so the game works without code changes. Optionally you can set `VITE_SOCKET_URL` or `VITE_API_URL` in the frontend build to override the backend URL (e.g. `VITE_SOCKET_URL=http://192.168.0.14:5000`).

---

## Game Flow

1. **Start screen** – Enter your nickname and click **Start Game**
2. **Cash Builder** – Answer questions for 60 seconds to build your total
3. **Offer selection** – Choose High, Middle, or Low offer
4. **Chase round** – Answer questions; first to answer starts the 5-second window; correct answers move you or the chaser
5. **Result screen** – See whether you escaped or were caught and your winnings (0€ if caught)
6. **Play again** – Use **Play Again** to return to the start and begin a new game

---

## Future Improvements

Possible enhancements:

- **Multiplayer version** – real opponents instead of a simulated chaser
- **Board movement animations** – smooth token movement along the board
- **Leaderboard** – high scores and best performances
- **Admin panel** – add, edit, and manage questions in the database
- **Sound effects** – timers, correct/incorrect, chase music

---

## License

This project is for educational and entertainment purposes.
