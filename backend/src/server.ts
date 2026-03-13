import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'

const app = express()
const httpServer = createServer(app)

app.use(cors())

const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
})

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)
})

const PORT = 5000

httpServer.listen(PORT, () => {
  console.log(`ChaseQuiz server running on http://localhost:${PORT}`)
})
