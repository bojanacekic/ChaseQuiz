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

export interface ChaseRoundState {
  boardSize: number
  playerPosition: number
  chaserPosition: number
  bankValue: number
  currentQuestion: Question | null
  askedQuestionIds: string[]
  shuffledQuestionIds: string[]
}
