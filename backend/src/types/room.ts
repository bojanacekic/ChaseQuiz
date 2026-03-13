export interface Player {
  id: string
  nickname: string
  socketId: string
  isHost: boolean
  isConnected: boolean
  score: number
}

export type RoomStatus = 'lobby' | 'question_round' | 'finished'

export interface Room {
  code: string
  players: Player[]
  status: RoomStatus
  createdAt: Date
}

export type RoomState = Room
