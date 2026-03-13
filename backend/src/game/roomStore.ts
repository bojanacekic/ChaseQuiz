import type { Room } from '../types/room.js'

const rooms = new Map<string, Room>()

export function getRoom(code: string): Room | undefined {
  return rooms.get(code.toUpperCase())
}

export function setRoom(room: Room): void {
  rooms.set(room.code, room)
}

export function deleteRoom(code: string): void {
  rooms.delete(code.toUpperCase())
}

export function getRoomBySocketId(socketId: string): Room | undefined {
  for (const room of rooms.values()) {
    if (room.players.some((p) => p.socketId === socketId)) {
      return room
    }
  }
  return undefined
}
