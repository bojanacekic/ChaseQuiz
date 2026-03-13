import type { Player, Room, RoomState } from '../types/room.js'
import { generateRoomCode } from '../utils/generateRoomCode.js'
import * as roomStore from './roomStore.js'
import * as chaseService from './chaseService.js'

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
    phase: 'lobby',
    createdAt: new Date(),
    activePlayerId: null,
    cashBuilder: null,
    offerSelection: null,
    chaseRound: null,
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
  const cashBuilder = room.cashBuilder
    ? {
        ...room.cashBuilder,
        currentQuestion: room.cashBuilder.currentQuestion
          ? { ...room.cashBuilder.currentQuestion }
          : null,
      }
    : null

  const offerSelection = room.offerSelection
    ? { ...room.offerSelection }
    : null

  const chaseRound = room.chaseRound
    ? {
        ...room.chaseRound,
        currentQuestion: room.chaseRound.currentQuestion
          ? { ...room.chaseRound.currentQuestion }
          : null,
      }
    : null

  return {
    ...room,
    players: room.players.map((p) => ({ ...p })),
    cashBuilder,
    offerSelection,
    chaseRound,
  }
}

export function startGame(socketId: string): { success: true; room: Room } | { success: false; error: string } {
  const room = roomStore.getRoomBySocketId(socketId)

  if (!room) {
    return { success: false, error: 'You are not in a room' }
  }

  if (room.phase !== 'lobby') {
    return { success: false, error: 'Game has already started' }
  }

  const player = room.players.find((p) => p.socketId === socketId)
  if (!player?.isHost) {
    return { success: false, error: 'Only the host can start the game' }
  }

  if (room.players.length < 1) {
    return { success: false, error: 'Need at least 1 player to start' }
  }

  chaseService.startCashBuilder(room)
  roomStore.setRoom(room)
  return { success: true, room }
}
