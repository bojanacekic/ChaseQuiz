import type { Room } from '../types/room.js'
import * as roomStore from './roomStore.js'
import {
  shuffleCashBuilderQuestionIds,
  getFirstCashBuilderQuestion,
  getNextCashBuilderQuestion,
  getEarnedAmount,
} from './questions.js'

/**
 * Cash builder flow:
 * - Questions are served from a shuffled queue (one shuffle per game start)
 * - Each answer triggers the next question immediately
 * - Round ends when: (1) timer expires (future) or (2) questions run out (fallback)
 * - No duplicates within a round - we use askedQuestionIds to track and advance
 */
export function startCashBuilder(room: Room): Room {
  const activePlayer = room.players[0]
  const shuffledQuestionIds = shuffleCashBuilderQuestionIds()
  const firstQuestion = getFirstCashBuilderQuestion(shuffledQuestionIds)

  room.phase = 'cash_builder'
  room.activePlayerId = activePlayer.id
  room.cashBuilder = {
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

  const player = room.players.find((p) => p.socketId === socketId)
  if (!player) {
    return { success: false, error: 'Player not found in room' }
  }

  if (room.activePlayerId !== player.id) {
    return { success: false, error: 'Only the active player can answer' }
  }

  const cb = room.cashBuilder
  if (!cb?.currentQuestion) {
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

  // Serve next question from shuffled queue
  const nextQuestion = getNextCashBuilderQuestion(
    cb.shuffledQuestionIds,
    cb.askedQuestionIds
  )

  if (nextQuestion === null) {
    // Fallback: ran out of questions - transition to offer selection
    transitionToOfferSelection(room)
  } else {
    cb.currentQuestion = nextQuestion
  }

  roomStore.setRoom(room)
  return { success: true, room }
}

function transitionToOfferSelection(room: Room): void {
  const cb = room.cashBuilder!
  const earned = cb.earnedAmount

  room.phase = 'offer_selection'
  room.cashBuilder = {
    ...cb,
    currentQuestion: null,
  }
  room.offerSelection = {
    lowerOffer: Math.floor(earned * 0.25),
    middleOffer: Math.floor(earned * 0.5),
    higherOffer: Math.floor(earned * 1),
    selectedOffer: null,
  }
}
