import type { Server } from 'socket.io'
import * as roomStore from './roomStore.js'
import * as roomService from './roomService.js'
import * as chaseDuelLogic from './chaseDuelLogic.js'

const TICK_INTERVAL_MS = 1000
const REVEAL_DELAY_MS = 2000

interface RoomTimers {
  chaserTimeout: ReturnType<typeof setTimeout> | null
  countdownInterval: ReturnType<typeof setInterval> | null
}

const timers = new Map<string, RoomTimers>()

function getOrCreateTimers(roomCode: string): RoomTimers {
  let t = timers.get(roomCode)
  if (!t) {
    t = { chaserTimeout: null, countdownInterval: null }
    timers.set(roomCode, t)
  }
  return t
}

export function clearAll(roomCode: string): void {
  const t = timers.get(roomCode)
  if (t) {
    if (t.chaserTimeout) clearTimeout(t.chaserTimeout)
    if (t.countdownInterval) clearInterval(t.countdownInterval)
    t.chaserTimeout = null
    t.countdownInterval = null
    timers.delete(roomCode)
  }
}

export function scheduleChaserAnswer(roomCode: string, delayMs: number, io: Server): void {
  clearAll(roomCode)
  const t = getOrCreateTimers(roomCode)
  t.chaserTimeout = setTimeout(() => {
    t.chaserTimeout = null
    const room = chaseDuelLogic.recordChaserAnswer(roomCode)
    if (room) {
      roomStore.setRoom(room)
      const state = roomService.serializeRoom(room)
      io.to(roomCode).emit('room_state', { room: state })
      if (chaseDuelLogic.shouldStartCountdown(room)) {
        startCountdown(roomCode, io)
      }
    }
  }, delayMs)
}

function clearCountdownOnly(roomCode: string): void {
  const t = timers.get(roomCode)
  if (t?.countdownInterval) {
    clearInterval(t.countdownInterval)
    t.countdownInterval = null
  }
}

export function startCountdown(roomCode: string, io: Server): void {
  const room = chaseDuelLogic.startCountdown(roomCode)
  if (!room) return
  roomStore.setRoom(room)

  clearCountdownOnly(roomCode)
  const t = getOrCreateTimers(roomCode)
  t.countdownInterval = setInterval(() => {
    const r = chaseDuelLogic.tickCountdown(roomCode)
    if (!r) {
      clearAll(roomCode)
      return
    }
    roomStore.setRoom(r)
    const state = roomService.serializeRoom(r)
    io.to(roomCode).emit('room_state', { room: state })

    if (r.chaseRound?.duelState && r.chaseRound.duelState.countdownTimeLeft <= 0) {
      clearAll(roomCode)
      const { room: resolvedRoom, loadNext } = chaseDuelLogic.resolveChaseQuestion(r)
      roomStore.setRoom(resolvedRoom)
      const finalState = roomService.serializeRoom(resolvedRoom)
      io.to(roomCode).emit('room_state', { room: finalState })

      if (loadNext) {
        setTimeout(async () => {
          const currentRoom = roomStore.getRoom(roomCode)
          if (!currentRoom || currentRoom.phase !== 'chase_round') return
          await chaseDuelLogic.loadNextChaseQuestionAndInitDuel(currentRoom)
          roomStore.setRoom(currentRoom)
          const nextState = roomService.serializeRoom(currentRoom)
          io.to(roomCode).emit('room_state', { room: nextState })
          if (currentRoom.chaseRound?.duelState?.chaserWillAnswer) {
            scheduleChaserAnswer(
              roomCode,
              currentRoom.chaseRound.duelState.chaserAnswerDelayMs,
              io
            )
          }
        }, REVEAL_DELAY_MS)
      }
    }
  }, TICK_INTERVAL_MS)
}
