export interface Question {
  id: string
  text: string
  options: string[]
  correctAnswer: number
  category: string
  difficulty: string
}

export type GamePhase =
  | 'lobby'
  | 'cash_builder'
  | 'offer_selection'
  | 'chase_round'
  | 'round_result'
  | 'finished'

export interface CashBuilderState {
  startedAt: number   // Unix timestamp (ms)
  endsAt: number     // Unix timestamp (ms) - when round expires
  timeLeft: number   // seconds remaining, updated by timer
  correctAnswers: number
  earnedAmount: number
  currentQuestion: Question | null
  askedQuestionIds: string[]
  shuffledQuestionIds: string[]
}

export interface OfferSelectionState {
  lowerOffer: number
  middleOffer: number
  higherOffer: number
  selectedOffer: number | null
}

export type CountdownStartedBy = 'player' | 'chaser' | null

export interface ChaseDuelState {
  questionId: string
  playerAnswered: boolean
  playerAnswer: number | null
  playerAnsweredAt: number | null
  playerWasCorrect: boolean | null
  chaserKnowsAnswer: boolean
  chaserWillAnswer: boolean
  chaserAnswerDelayMs: number
  chaserAnswered: boolean
  chaserAnsweredAt: number | null
  chaserWasCorrect: boolean | null
  countdownStarted: boolean
  countdownStartedBy: CountdownStartedBy
  countdownEndsAt: number | null
  countdownTimeLeft: number
  resolved: boolean
  playerMoved: boolean
  chaserMoved: boolean
}

export interface ChaseRoundState {
  boardSize: number
  playerPosition: number
  chaserPosition: number
  bankValue: number
  currentQuestion: Question | null
  askedQuestionIds: string[]
  shuffledQuestionIds: string[]
  duelState: ChaseDuelState | null
}

export type RoundResultOutcome = 'caught' | 'escaped'

export interface RoundResultState {
  outcome: RoundResultOutcome
  bankValue: number
}
