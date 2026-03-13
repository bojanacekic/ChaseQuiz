import type { RoomState } from './room'

// Client -> Server events
export interface ClientToServerEvents {
  create_room: (payload: { nickname: string }) => void
  join_room: (payload: { nickname: string; roomCode: string }) => void
  leave_room: () => void
  get_room_state: () => void
  start_game: () => void
  submit_answer: (payload: { optionIndex: number }) => void
  select_offer: (payload: { offerValue: number }) => void
}

// Server -> Client events
export interface ServerToClientEvents {
  room_created: (payload: { room: RoomState }) => void
  room_joined: (payload: { room: RoomState }) => void
  room_state: (payload: { room: RoomState }) => void
  left_room: () => void
  create_room_error: (payload: { message: string }) => void
  join_room_error: (payload: { message: string }) => void
  start_game_error: (payload: { message: string }) => void
  submit_answer_error: (payload: { message: string }) => void
  select_offer_error: (payload: { message: string }) => void
  leave_room_error: (payload: { message: string }) => void
  get_room_state_error: (payload: { message: string }) => void
}
