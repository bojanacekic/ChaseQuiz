# ChaseQuiz

ChaseQuiz is a real-time quiz game inspired by the TV show **"The Chase"**. The player first plays a Cash Builder round to earn money, then selects an offer and enters the Chase round where a simulated chaser tries to catch them.

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
- **Correct answers** move your token (or the chaser’s) forward one step on the board

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

## Technology Stack

| Layer    | Technologies                          |
|----------|---------------------------------------|
| **Frontend** | React, TypeScript, TailwindCSS, Socket.IO client |
| **Backend**  | Node.js, Express, Socket.IO, TypeScript |
| **Database** | MongoDB, Mongoose                     |

---

## Questions (MongoDB)

Questions are stored in MongoDB in the **`questions`** collection.

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

## Game Flow

1. **Start screen** – Enter your nickname and click **Start Game**
2. **Cash Builder** – Answer questions for 60 seconds to build your total
3. **Offer selection** – Choose High, Middle, or Low offer
4. **Chase round** – Answer questions; first to answer starts the 5-second window; correct answers move you or the chaser
5. **Result screen** – See whether you escaped or were caught and your winnings (0€ if caught)
6. **Play again** – Use **Play Again** to return to the start and begin a new game

---

## UI Notes

- **Chase screen** uses a **two-column layout**:
  - **Left:** Chase board (positions 0–8, chaser at top, HOME at bottom)
  - **Right:** Current question, 3 answer buttons, bank value
- **Countdown** and duel status (e.g. “Player answered”, “Chaser answered”) appear **below the answer buttons**
- The chase board is large and readable with clear labels for CHASER START and HOME
- The main gameplay panel is **centered** on the page

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
