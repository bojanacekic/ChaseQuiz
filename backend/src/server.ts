import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import { connectDB } from './config/db.js'
import { registerRoomHandlers } from './socket/registerRoomHandlers.js'
import { registerGameHandlers } from './socket/registerGameHandlers.js'

const app = express()
const httpServer = createServer(app)

app.use(cors())

const io = new Server(httpServer, {
  cors: {
    origin: true,
    methods: ['GET', 'POST'],
  },
})

registerRoomHandlers(io)
registerGameHandlers(io)

const PORT = 5000

async function start(): Promise<void> {
  await connectDB()
  httpServer.listen(PORT, () => {
    console.log(`ChaseQuiz server running on http://localhost:${PORT}`)
  })
}

start().catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
