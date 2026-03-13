import { io, Socket } from 'socket.io-client'
import type { ClientToServerEvents, ServerToClientEvents } from '../types/socket'

const SOCKET_URL = 'http://localhost:5000'

export type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>

export const socket: TypedSocket = io(SOCKET_URL) as TypedSocket

socket.on('connect', () => {
  console.log('Connected to ChaseQuiz server')
})
