import type { Player, Room, RoomState } from '../types/room.js'
import { generateRoomCode } from '../utils/generateRoomCode.js'
import * as roomStore from './roomStore.js'

export function createRoom(nickname: string, socketId: string): Room {
  let code: string
  let existing: Room | undefined
  do {
    code = generateRoomCode()
    existing = roomStore.getRoom(code)
  } while (existing)

  const player: Player = {
    id: crypto.randomUUID(),
    nickname: nickname.trim(),
    socketId,
    isHost: true,
    isConnected: true,
    score: 0,
  }

  const room: Room = {
    code,
    players: [player],
    status: 'waiting',
    createdAt: new Date(),
  }

  roomStore.setRoom(room)
  return room
}

export function joinRoom(
  nickname: string,
  roomCode: string,
  socketId: string
): { success: true; room: Room } | { success: false; error: string } {
  const code = roomCode.trim().toUpperCase()
  const room = roomStore.getRoom(code)

  if (!room) {
    return { success: false, error: 'Room not found' }
  }

  const alreadyInRoom = room.players.some((p) => p.socketId === socketId)
  if (alreadyInRoom) {
    return { success: false, error: 'You are already in this room' }
  }

  const player: Player = {
    id: crypto.randomUUID(),
    nickname: nickname.trim(),
    socketId,
    isHost: false,
    isConnected: true,
    score: 0,
  }

  room.players.push(player)
  roomStore.setRoom(room)
  return { success: true, room }
}

export function leaveRoom(socketId: string): Room | null {
  const room = roomStore.getRoomBySocketId(socketId)
  if (!room) return null

  room.players = room.players.filter((p) => p.socketId !== socketId)

  if (room.players.length === 0) {
    roomStore.deleteRoom(room.code)
    return null
  }

  // If host left, promote first player to host
  const hostLeft = !room.players.some((p) => p.isHost)
  if (hostLeft && room.players.length > 0) {
    room.players[0].isHost = true
  }

  roomStore.setRoom(room)
  return room
}

export function markPlayerDisconnected(socketId: string): Room | null {
  const room = roomStore.getRoomBySocketId(socketId)
  if (!room) return null

  const player = room.players.find((p) => p.socketId === socketId)
  if (player) {
    player.isConnected = false
  }
  roomStore.setRoom(room)
  return room
}

export function getRoomState(roomCode: string): RoomState | null {
  const room = roomStore.getRoom(roomCode.toUpperCase())
  return room ?? null
}

export function serializeRoom(room: Room): RoomState {
  return {
    ...room,
    players: room.players.map((p) => ({ ...p })),
  }
}
