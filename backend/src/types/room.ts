import type {
  GamePhase,
  CashBuilderState,
  OfferSelectionState,
  ChaseRoundState,
} from './game.js'

export interface Player {
  id: string
  nickname: string
  socketId: string
  isHost: boolean
  isConnected: boolean
  score: number
}

export interface Room {
  code: string
  players: Player[]
  phase: GamePhase
  createdAt: Date
  activePlayerId: string | null
  cashBuilder: CashBuilderState | null
  offerSelection: OfferSelectionState | null
  chaseRound: ChaseRoundState | null
}

export type RoomState = Room
