import type { Room } from '../types/room.js'
import type { Server } from 'socket.io'
import * as roomStore from './roomStore.js'
import {
  shuffleCashBuilderQuestionIds,
  getFirstCashBuilderQuestion,
  getNextCashBuilderQuestion,
  getEarnedAmount,
  shuffleChaseRoundQuestionIds,
  getFirstChaseRoundQuestion,
} from './questions.js'
import * as chaseDuelLogic from './chaseDuelLogic.js'
import * as chaseDuelTimer from './chaseDuelTimer.js'

const BOARD_SIZE = 8 // positions 0 (chaser start) to 8 (home)
const CHASER_START_POSITION = 0

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

const HIGHER_OFFER_ZERO_CORRECT_OPTIONS = [-1000, -500, 0]

function computeOffers(correctAnswers: number, earnedAmount: number) {
  const middleOffer = earnedAmount

  let higherOffer: number
  if (correctAnswers === 0) {
    const idx = Math.floor(Math.random() * HIGHER_OFFER_ZERO_CORRECT_OPTIONS.length)
    higherOffer = HIGHER_OFFER_ZERO_CORRECT_OPTIONS[idx]
  } else {
    higherOffer = correctAnswers * 500 * 3 + 2000
  }

  const lowerOffer = correctAnswers > 0 ? correctAnswers * 500 - 1500 : 0

  return { lowerOffer, middleOffer, higherOffer }
}

function transitionToOfferSelection(room: Room): void {
  const cb = room.cashBuilder!
  const earned = cb.earnedAmount
  const { lowerOffer, middleOffer, higherOffer } = computeOffers(cb.correctAnswers, earned)

  room.phase = 'offer_selection'
  room.cashBuilder = {
    ...cb,
    currentQuestion: null,
    timeLeft: 0,
  }
  room.offerSelection = {
    lowerOffer,
    middleOffer,
    higherOffer,
    selectedOffer: null,
  }
}

/**
 * Player position mapping (boardSize=7, chaser at 0, home at 7):
 * - higherOffer: riskier, start at 2 (further from home)
 * - middleOffer: bank, start at 3
 * - lowerOffer: safer, start at 4 (closer to home)
 */
const PLAYER_POSITION_BY_OFFER = {
  higher: 2,
  middle: 3,
  lower: 4,
} as const

export function selectOffer(
  socketId: string,
  offerValue: number
): { success: true; room: Room } | { success: false; error: string } {
  const room = roomStore.getRoomBySocketId(socketId)

  if (!room) {
    return { success: false, error: 'You are not in a room' }
  }

  if (room.phase !== 'offer_selection') {
    return { success: false, error: 'Not in offer selection phase' }
  }

  const offer = room.offerSelection
  if (!offer) {
    return { success: false, error: 'No offer selection state' }
  }

  if (offer.selectedOffer !== null) {
    return { success: false, error: 'Offer already selected' }
  }

  const player = room.players.find((p) => p.socketId === socketId)
  if (!player) {
    return { success: false, error: 'Player not found in room' }
  }

  if (room.activePlayerId !== player.id) {
    return { success: false, error: 'Only the active player can select an offer' }
  }

  const validOffers = [offer.higherOffer, offer.middleOffer, offer.lowerOffer]
  if (!validOffers.includes(offerValue)) {
    return { success: false, error: 'Invalid offer value' }
  }

  offer.selectedOffer = offerValue

  let playerPosition: number
  if (offerValue === offer.higherOffer) {
    playerPosition = PLAYER_POSITION_BY_OFFER.higher
  } else if (offerValue === offer.middleOffer) {
    playerPosition = PLAYER_POSITION_BY_OFFER.middle
  } else {
    playerPosition = PLAYER_POSITION_BY_OFFER.lower
  }

  startChaseRound(room, offerValue, playerPosition)
  roomStore.setRoom(room)
  return { success: true, room }
}

export function submitChaseAnswer(
  socketId: string,
  optionIndex: number
): { success: true; room: Room } | { success: false; error: string } {
  const room = roomStore.getRoomBySocketId(socketId)

  if (!room) {
    return { success: false, error: 'You are not in a room' }
  }

  if (room.phase !== 'chase_round') {
    return { success: false, error: 'Not in chase round' }
  }

  const chase = room.chaseRound
  if (!chase?.currentQuestion || !chase.duelState) {
    return { success: false, error: 'No active question' }
  }

  const player = room.players.find((p) => p.socketId === socketId)
  if (!player || room.activePlayerId !== player.id) {
    return { success: false, error: 'Only the active player can answer' }
  }

  if (chase.duelState.playerAnswered) {
    return { success: false, error: 'Already answered' }
  }

  if (chase.duelState.resolved) {
    return { success: false, error: 'Question already resolved' }
  }

  if (
    chase.duelState.countdownEndsAt &&
    Date.now() >= chase.duelState.countdownEndsAt
  ) {
    return { success: false, error: 'Too late' }
  }

  if (optionIndex < 0 || optionIndex >= chase.currentQuestion.options.length) {
    return { success: false, error: 'Invalid answer' }
  }

  const updated = chaseDuelLogic.recordPlayerAnswer(room.code, optionIndex, player.id)
  if (!updated) {
    return { success: false, error: 'Could not record answer' }
  }

  roomStore.setRoom(updated)
  return { success: true, room: updated }
}

export function maybeScheduleChaserAnswer(room: Room, io: Server): void {
  const duel = room.chaseRound?.duelState
  if (duel?.chaserWillAnswer) {
    chaseDuelTimer.scheduleChaserAnswer(room.code, duel.chaserAnswerDelayMs, io)
  }
}

function startChaseRound(room: Room, bankValue: number, playerPosition: number): void {
  const shuffledQuestionIds = shuffleChaseRoundQuestionIds()
  const firstQuestion = getFirstChaseRoundQuestion(shuffledQuestionIds)

  room.phase = 'chase_round'
  room.roundResult = null
  room.chaseRound = {
    boardSize: BOARD_SIZE,
    playerPosition,
    chaserPosition: CHASER_START_POSITION,
    bankValue,
    currentQuestion: firstQuestion,
    askedQuestionIds: [],
    shuffledQuestionIds,
    duelState: null,
  }

  chaseDuelLogic.initDuelForQuestion(room)
}
