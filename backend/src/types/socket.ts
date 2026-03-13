// Client -> Server payloads
export interface CreateRoomPayload {
  nickname: string
}

export interface JoinRoomPayload {
  nickname: string
  roomCode: string
}

// Server -> Client payloads
export interface RoomCreatedPayload {
  room: import('./room.js').RoomState
}

export interface RoomJoinedPayload {
  room: import('./room.js').RoomState
}

export interface RoomStatePayload {
  room: import('./room.js').RoomState
}

export interface ErrorPayload {
  message: string
}
