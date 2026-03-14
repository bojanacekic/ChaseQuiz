import type { Room } from '../types/room.js'
import * as chaseService from './chaseService.js'

export async function selectOffer(
  socketId: string,
  offerValue: number
): Promise<{ success: true; room: Room } | { success: false; error: string }> {
  return chaseService.selectOffer(socketId, offerValue)
}

export function submitChaseAnswer(
  socketId: string,
  optionIndex: number
): { success: true; room: Room } | { success: false; error: string } {
  return chaseService.submitChaseAnswer(socketId, optionIndex)
}

export async function submitAnswer(
  socketId: string,
  optionIndex: number
): Promise<{ success: true; room: Room } | { success: false; error: string }> {
  return chaseService.submitCashBuilderAnswer(socketId, optionIndex)
}
