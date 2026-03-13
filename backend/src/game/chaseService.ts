import type { Room } from '../types/room.js'
import * as roomStore from './roomStore.js'
import {
  shuffleCashBuilderQuestionIds,
  getFirstCashBuilderQuestion,
  getNextCashBuilderQuestion,
  getEarnedAmount,
} from './questions.js'

const CASH_BUILDER_DURATION_MS = 60 * 1000

/**
 * Cash builder flow:
 * - 60-second timer controlled by timerService
 * - Questions served from shuffled queue until timer expires
 * - Reject answers when timeLeft <= 0 (use endsAt to avoid race conditions)
 */
export function startCashBuilder(room: Room): Room {
  const activePlayer = room.players[0]
  const shuffledQuestionIds = shuffleCashBuilderQuestionIds()
  const firstQuestion = getFirstCashBuilderQuestion(shuffledQuestionIds)
  const now = Date.now()
  const endsAt = now + CASH_BUILDER_DURATION_MS

  room.phase = 'cash_builder'
  room.activePlayerId = activePlayer.id
  room.cashBuilder = {
    startedAt: now,
    endsAt,
    timeLeft: 60,
    correctAnswers: 0,
    earnedAmount: 0,
    currentQuestion: firstQuestion,
    askedQuestionIds: [],
    shuffledQuestionIds,
  }
  room.offerSelection = null
  room.chaseRound = null

  return room
}

function isTimeExpired(endsAt: number): boolean {
  return Date.now() >= endsAt
}

export function submitCashBuilderAnswer(
  socketId: string,
  optionIndex: number
): { success: true; room: Room } | { success: false; error: string } {
  const room = roomStore.getRoomBySocketId(socketId)

  if (!room) {
    return { success: false, error: 'You are not in a room' }
  }

  if (room.phase !== 'cash_builder') {
    return { success: false, error: 'Not in cash builder phase' }
  }

  const cb = room.cashBuilder
  if (!cb) {
    return { success: false, error: 'No cash builder state' }
  }

  if (isTimeExpired(cb.endsAt)) {
    return { success: false, error: 'Time is up' }
  }

  const player = room.players.find((p) => p.socketId === socketId)
  if (!player) {
    return { success: false, error: 'Player not found in room' }
  }

  if (room.activePlayerId !== player.id) {
    return { success: false, error: 'Only the active player can answer' }
  }

  if (!cb.currentQuestion) {
    return { success: false, error: 'No question active' }
  }

  if (optionIndex < 0 || optionIndex >= cb.currentQuestion.options.length) {
    return { success: false, error: 'Invalid answer option' }
  }

  const isCorrect = optionIndex === cb.currentQuestion.correctAnswer
  cb.askedQuestionIds.push(cb.currentQuestion.id)

  if (isCorrect) {
    cb.correctAnswers += 1
    cb.earnedAmount = getEarnedAmount(cb.correctAnswers)
  }

  const nextQuestion = getNextCashBuilderQuestion(
    cb.shuffledQuestionIds,
    cb.askedQuestionIds
  )
  cb.currentQuestion = nextQuestion

  roomStore.setRoom(room)
  return { success: true, room }
}

export function endCashBuilder(room: Room): void {
  transitionToOfferSelection(room)
}

function transitionToOfferSelection(room: Room): void {
  const cb = room.cashBuilder!
  const earned = cb.earnedAmount

  room.phase = 'offer_selection'
  room.cashBuilder = {
    ...cb,
    currentQuestion: null,
    timeLeft: 0,
  }
  room.offerSelection = {
    lowerOffer: Math.max(earned - 2, 0),
    middleOffer: earned,
    higherOffer: earned + 2,
    selectedOffer: null,
  }
}
