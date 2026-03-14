import type { Room } from '../types/room.js'
import type { ChaseDuelState } from '../types/game.js'
import { randomBool, randomInt } from '../utils/random.js'
import * as roomStore from './roomStore.js'
import { getNextChaseRoundQuestion } from './questions.js'

const CHASER_KNOWLEDGE: Record<string, number> = {
  easy: 0.9,
  medium: 0.75,
  hard: 0.6,
}

const CHASER_DELAY_MIN_MS = 1500
const CHASER_DELAY_MAX_MS = 5500

const COUNTDOWN_DURATION_MS = 5000

export function simulateChaserKnowledge(difficulty: string): boolean {
  const p = CHASER_KNOWLEDGE[difficulty.toLowerCase()] ?? 0.7
  return randomBool(p)
}

export function generateChaserDelay(): number {
  return randomInt(CHASER_DELAY_MIN_MS, CHASER_DELAY_MAX_MS)
}

export function createEmptyDuelState(questionId: string): ChaseDuelState {
  return {
    questionId,
    playerAnswered: false,
    playerAnswer: null,
    playerAnsweredAt: null,
    playerWasCorrect: null,
    chaserKnowsAnswer: false,
    chaserWillAnswer: false,
    chaserAnswerDelayMs: 0,
    chaserAnswered: false,
    chaserAnsweredAt: null,
    chaserWasCorrect: null,
    countdownStarted: false,
    countdownStartedBy: null,
    countdownEndsAt: null,
    countdownTimeLeft: 0,
    resolved: false,
    playerMoved: false,
    chaserMoved: false,
  }
}

export function initDuelForQuestion(room: Room): { chaserWillAnswer: boolean; chaserDelayMs: number } | null {
  const chase = room.chaseRound
  const question = chase?.currentQuestion
  if (!chase || !question) return null

  const chaserKnows = simulateChaserKnowledge(question.difficulty)
  const chaserDelay = generateChaserDelay()

  chase.duelState = {
    ...createEmptyDuelState(question.id),
    chaserKnowsAnswer: chaserKnows,
    chaserWillAnswer: chaserKnows,
    chaserAnswerDelayMs: chaserDelay,
  }

  return chaserKnows ? { chaserWillAnswer: true, chaserDelayMs: chaserDelay } : null
}

function isCountdownExpired(endsAt: number): boolean {
  return Date.now() >= endsAt
}

export function recordPlayerAnswer(roomCode: string, optionIndex: number, playerId: string): Room | null {
  const room = roomStore.getRoom(roomCode)
  const chase = room?.chaseRound
  const duel = chase?.duelState
  if (!room || !chase || !duel || !chase.currentQuestion) return null

  if (duel.resolved) return null
  if (duel.playerAnswered) return null
  if (duel.countdownStarted && duel.countdownEndsAt && isCountdownExpired(duel.countdownEndsAt)) return null

  duel.playerAnswered = true
  duel.playerAnswer = optionIndex
  duel.playerAnsweredAt = Date.now()
  duel.playerWasCorrect = optionIndex === chase.currentQuestion.correctAnswer

  if (!duel.countdownStarted) {
    duel.countdownStarted = true
    duel.countdownStartedBy = 'player'
    duel.countdownEndsAt = Date.now() + COUNTDOWN_DURATION_MS
    duel.countdownTimeLeft = 5
  }

  return room
}

export function recordChaserAnswer(roomCode: string): Room | null {
  const room = roomStore.getRoom(roomCode)
  const chase = room?.chaseRound
  const duel = chase?.duelState
  if (!room || !chase || !duel || !chase.currentQuestion) return null

  if (duel.resolved) return null
  if (duel.chaserAnswered) return null
  if (!duel.chaserWillAnswer) return null
  if (duel.countdownStarted && duel.countdownEndsAt && isCountdownExpired(duel.countdownEndsAt)) return null

  duel.chaserAnswered = true
  duel.chaserAnsweredAt = Date.now()
  duel.chaserWasCorrect = true // chaser only answers when they know

  if (!duel.countdownStarted) {
    duel.countdownStarted = true
    duel.countdownStartedBy = 'chaser'
    duel.countdownEndsAt = Date.now() + COUNTDOWN_DURATION_MS
    duel.countdownTimeLeft = 5
  }

  return room
}

export function shouldStartCountdown(room: Room): boolean {
  const duel = room.chaseRound?.duelState
  return duel ? duel.countdownStarted && !duel.resolved : false
}

export function startCountdown(roomCode: string): Room | null {
  const room = roomStore.getRoom(roomCode)
  const duel = room?.chaseRound?.duelState
  if (!room || !duel || !duel.countdownEndsAt) return null

  const left = Math.max(0, Math.ceil((duel.countdownEndsAt - Date.now()) / 1000))
  duel.countdownTimeLeft = left
  return room
}

export function tickCountdown(roomCode: string): Room | null {
  const room = roomStore.getRoom(roomCode)
  const duel = room?.chaseRound?.duelState
  if (!room || !duel || !duel.countdownEndsAt) return null

  const left = Math.max(0, Math.ceil((duel.countdownEndsAt - Date.now()) / 1000))
  duel.countdownTimeLeft = left
  return room
}

export function resolveChaseQuestion(room: Room): { room: Room; loadNext: boolean } {
  const chase = room.chaseRound!
  const duel = chase.duelState!

  if (duel.resolved) return { room, loadNext: false }
  duel.resolved = true

  const countdownEnded = duel.countdownEndsAt ? Date.now() >= duel.countdownEndsAt : true

  const playerAnsweredInTime = duel.playerAnswered && (!duel.countdownEndsAt || duel.playerAnsweredAt! < duel.countdownEndsAt)
  const chaserAnsweredInTime = duel.chaserAnswered && (!duel.countdownEndsAt || duel.chaserAnsweredAt! < duel.countdownEndsAt)

  if (playerAnsweredInTime && duel.playerWasCorrect) {
    chase.playerPosition = Math.min(chase.playerPosition + 1, chase.boardSize)
    duel.playerMoved = true
  }

  if (chaserAnsweredInTime && duel.chaserWasCorrect) {
    chase.chaserPosition = Math.min(chase.chaserPosition + 1, chase.boardSize)
    duel.chaserMoved = true
  }

  if (chase.chaserPosition === chase.playerPosition) {
    transitionToRoundResult(room, 'caught')
    return { room, loadNext: false }
  }

  if (chase.playerPosition >= chase.boardSize) {
    transitionToRoundResult(room, 'escaped')
    return { room, loadNext: false }
  }

  return { room, loadNext: true }
}

export async function loadNextChaseQuestionAndInitDuel(room: Room): Promise<void> {
  await loadNextChaseQuestion(room)
}

function transitionToRoundResult(room: Room, outcome: 'caught' | 'escaped'): void {
  room.phase = 'round_result'
  room.roundResult = {
    outcome,
    bankValue: room.chaseRound!.bankValue,
  }
}

async function loadNextChaseQuestion(room: Room): Promise<void> {
  const chase = room.chaseRound!
  const duel = chase.duelState!
  chase.askedQuestionIds.push(duel.questionId)
  const nextQuestion = await getNextChaseRoundQuestion(chase.shuffledQuestionIds, chase.askedQuestionIds)

  if (!nextQuestion) {
    transitionToRoundResult(room, 'escaped')
    return
  }

  chase.currentQuestion = nextQuestion
  chase.duelState = null

  initDuelForQuestion(room)
}
