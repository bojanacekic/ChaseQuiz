import type { Server } from 'socket.io'
import * as roomStore from './roomStore.js'
import * as roomService from './roomService.js'
import * as chaseService from './chaseService.js'

const CASH_BUILDER_DURATION_MS = 60 * 1000
const TICK_INTERVAL_MS = 1000

const activeTimers = new Map<string, ReturnType<typeof setInterval>>()

function computeTimeLeft(endsAt: number): number {
  return Math.max(0, Math.ceil((endsAt - Date.now()) / 1000))
}

export function startCashBuilderTimer(roomCode: string, io: Server): void {
  stopCashBuilderTimer(roomCode)

  const room = roomStore.getRoom(roomCode)
  if (!room || room.phase !== 'cash_builder' || !room.cashBuilder) {
    return
  }

  const intervalId = setInterval(() => {
    const currentRoom = roomStore.getRoom(roomCode)
    if (!currentRoom || currentRoom.phase !== 'cash_builder' || !currentRoom.cashBuilder) {
      stopCashBuilderTimer(roomCode)
      return
    }

    const cb = currentRoom.cashBuilder
    const timeLeft = computeTimeLeft(cb.endsAt)
    cb.timeLeft = timeLeft

    const roomState = roomService.serializeRoom(currentRoom)
    io.to(roomCode).emit('room_state', { room: roomState })

    if (timeLeft <= 0) {
      stopCashBuilderTimer(roomCode)
      chaseService.endCashBuilder(currentRoom)
      roomStore.setRoom(currentRoom)
      const finalState = roomService.serializeRoom(currentRoom)
      io.to(roomCode).emit('room_state', { room: finalState })
    }
  }, TICK_INTERVAL_MS)

  activeTimers.set(roomCode, intervalId)
}

export function stopCashBuilderTimer(roomCode: string): void {
  const existing = activeTimers.get(roomCode)
  if (existing) {
    clearInterval(existing)
    activeTimers.delete(roomCode)
  }
}

export function isTimerActive(roomCode: string): boolean {
  return activeTimers.has(roomCode)
}
