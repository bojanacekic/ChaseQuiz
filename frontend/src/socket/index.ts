import { io, Socket } from 'socket.io-client'
import type { ClientToServerEvents, ServerToClientEvents } from '../types/socket'
import { getSocketUrl } from '../config/runtime'

export type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>

export const socket: TypedSocket = io(getSocketUrl()) as TypedSocket

socket.on('connect', () => {
  console.log('Connected to ChaseQuiz server')
})
