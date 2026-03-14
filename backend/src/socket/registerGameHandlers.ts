import type { Server, Socket } from 'socket.io'
import type { SubmitAnswerPayload, SelectOfferPayload, SubmitChaseAnswerPayload } from '../types/socket.js'
import * as gameService from '../game/gameService.js'
import * as roomService from '../game/roomService.js'
import * as chaseService from '../game/chaseService.js'
import * as chaseDuelTimer from '../game/chaseDuelTimer.js'

export function registerGameHandlers(io: Server): void {
  io.on('connection', (socket: Socket) => {
    socket.on('select_offer', async (payload: SelectOfferPayload) => {
      const offerValue = payload?.offerValue

      if (typeof offerValue !== 'number') {
        socket.emit('select_offer_error', { message: 'Invalid offer' })
        return
      }

      const result = await gameService.selectOffer(socket.id, offerValue)

      if (!result.success) {
        socket.emit('select_offer_error', { message: result.error })
        return
      }

      chaseService.maybeScheduleChaserAnswer(result.room, io)

      const roomState = roomService.serializeRoom(result.room)
      io.to(result.room.code).emit('room_state', { room: roomState })
    })

    socket.on('submit_chase_answer', (payload: SubmitChaseAnswerPayload) => {
      const optionIndex = payload?.optionIndex

      if (typeof optionIndex !== 'number') {
        socket.emit('submit_chase_answer_error', { message: 'Invalid answer' })
        return
      }

      const result = gameService.submitChaseAnswer(socket.id, optionIndex)

      if (!result.success) {
        socket.emit('submit_chase_answer_error', { message: result.error })
        return
      }

      const room = result.room
      const duel = room.chaseRound?.duelState
      if (duel?.countdownStarted && !duel.resolved) {
        chaseDuelTimer.startCountdown(room.code, io)
      }

      const roomState = roomService.serializeRoom(room)
      io.to(room.code).emit('room_state', { room: roomState })
    })

    socket.on('submit_answer', async (payload: SubmitAnswerPayload) => {
      const optionIndex = payload?.optionIndex

      if (typeof optionIndex !== 'number') {
        socket.emit('submit_answer_error', { message: 'Invalid answer' })
        return
      }

      const result = await gameService.submitAnswer(socket.id, optionIndex)

      if (!result.success) {
        socket.emit('submit_answer_error', { message: result.error })
        return
      }

      const roomState = roomService.serializeRoom(result.room)
      io.to(result.room.code).emit('room_state', { room: roomState })
    })
  })
}
