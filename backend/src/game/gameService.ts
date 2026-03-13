import type { Room } from '../types/room.js'
import * as chaseService from './chaseService.js'

export function submitAnswer(
  socketId: string,
  optionIndex: number
): { success: true; room: Room } | { success: false; error: string } {
  return chaseService.submitCashBuilderAnswer(socketId, optionIndex)
}
