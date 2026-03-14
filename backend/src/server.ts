import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import { connectDB } from './config/db.js'
import { ensureQuestionsSeeded } from './services/seedService.js'
import { registerRoomHandlers } from './socket/registerRoomHandlers.js'
import { registerGameHandlers } from './socket/registerGameHandlers.js'

const app = express()
const httpServer = createServer(app)

/** Allow localhost, 127.0.0.1, and private LAN origins (e.g. 192.168.x.x:5173) for dev/LAN access */
function allowOrigin(origin: string | undefined, cb: (err: Error | null, allow?: boolean) => void) {
  if (origin === undefined || origin === '') {
    return cb(null, true)
  }
  try {
    const u = new URL(origin)
    const h = u.hostname.toLowerCase()
    if (h === 'localhost' || h === '127.0.0.1') {
      return cb(null, true)
    }
    if (h.startsWith('192.168.') || h.startsWith('10.')) {
      return cb(null, true)
    }
    if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(h)) {
      return cb(null, true)
    }
  } catch {
    return cb(null, false)
  }
  return cb(null, false)
}

app.use(cors({ origin: allowOrigin }))

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

const io = new Server(httpServer, {
  cors: {
    origin: (origin, cb) => {
      allowOrigin(origin, (err, allow) => cb(err, allow ?? false))
    },
    methods: ['GET', 'POST'],
  },
})

registerRoomHandlers(io)
registerGameHandlers(io)

const PORT = 5000

async function start(): Promise<void> {
  await connectDB()
  await ensureQuestionsSeeded()

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`ChaseQuiz server running on http://localhost:${PORT}`)
  })
}

start().catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
