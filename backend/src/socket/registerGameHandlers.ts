import type { Server, Socket } from 'socket.io'
import type { SubmitAnswerPayload } from '../types/socket.js'
import * as gameService from '../game/gameService.js'
import * as roomService from '../game/roomService.js'

export function registerGameHandlers(io: Server): void {
  io.on('connection', (socket: Socket) => {
    socket.on('submit_answer', (payload: SubmitAnswerPayload) => {
      const optionIndex = payload?.optionIndex

      if (typeof optionIndex !== 'number') {
        socket.emit('submit_answer_error', { message: 'Invalid answer' })
        return
      }

      const result = gameService.submitAnswer(socket.id, optionIndex)

      if (!result.success) {
        socket.emit('submit_answer_error', { message: result.error })
        return
      }

      const roomState = roomService.serializeRoom(result.room)
      io.to(result.room.code).emit('room_state', { room: roomState })
    })
  })
}
