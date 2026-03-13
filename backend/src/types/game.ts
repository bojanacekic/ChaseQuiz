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
  timeLeft: number
  correctAnswers: number
  earnedAmount: number
  currentQuestion: Question | null
  askedQuestionIds: string[]
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
  currentQuestion: Question | null
}
