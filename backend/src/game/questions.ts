import type { Question } from '../types/game.js'
import { CASH_BUILDER_QUESTIONS } from './cashBuilderQuestions.js'
import { CHASE_ROUND_QUESTIONS } from './chaseQuestions.js'

const CASH_PER_CORRECT = 500

/** Fisher-Yates shuffle - returns a new shuffled copy of the array */
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/** Shuffle question order for a new game - returns array of question IDs */
export function shuffleCashBuilderQuestionIds(): string[] {
  return shuffleArray(CASH_BUILDER_QUESTIONS.map((q) => q.id))
}

/** Shuffle options order and update correctAnswer index. Returns a new question. */
export function shuffleQuestionOptions(question: Question): Question {
  const indices = [0, 1, 2, 3].slice(0, question.options.length)
  const shuffledIndices = shuffleArray(indices)
  const correctOriginalIndex = question.correctAnswer
  const newCorrectIndex = shuffledIndices.indexOf(correctOriginalIndex)

  return {
    ...question,
    options: shuffledIndices.map((i) => question.options[i]),
    correctAnswer: newCorrectIndex,
  }
}

/**
 * Get the next cash builder question from the shuffled queue.
 * Uses askedQuestionIds.length as the index into shuffledQuestionIds.
 * Returns null if we've used all questions (fallback - triggers transition to offer_selection).
 */
export function getNextCashBuilderQuestion(
  shuffledQuestionIds: string[],
  askedQuestionIds: string[]
): Question | null {
  const nextIndex = askedQuestionIds.length
  if (nextIndex >= shuffledQuestionIds.length) {
    return null
  }

  const nextId = shuffledQuestionIds[nextIndex]
  const question = CASH_BUILDER_QUESTIONS.find((q) => q.id === nextId)
  if (!question) return null

  const cloned = { ...question, options: [...question.options] }
  return shuffleQuestionOptions(cloned)
}

/** Get first cash builder question for a new round (uses index 0 of shuffled ids) */
export function getFirstCashBuilderQuestion(
  shuffledQuestionIds: string[]
): Question | null {
  if (shuffledQuestionIds.length === 0) return null
  const firstId = shuffledQuestionIds[0]
  const question = CASH_BUILDER_QUESTIONS.find((q) => q.id === firstId)
  if (!question) return null
  const cloned = { ...question, options: [...question.options] }
  return shuffleQuestionOptions(cloned)
}

/** Shuffle chase round question order for a new chase - returns array of question IDs */
export function shuffleChaseRoundQuestionIds(): string[] {
  return shuffleArray(CHASE_ROUND_QUESTIONS.map((q) => q.id))
}

/** Get first chase round question (index 0 of shuffled ids) */
export function getFirstChaseRoundQuestion(shuffledQuestionIds: string[]): Question | null {
  if (shuffledQuestionIds.length === 0) return null
  const firstId = shuffledQuestionIds[0]
  const question = CHASE_ROUND_QUESTIONS.find((q) => q.id === firstId)
  if (!question) return null
  const cloned = { ...question, options: [...question.options] }
  return shuffleQuestionOptions(cloned)
}

/** Get next chase round question from shuffled queue */
export function getNextChaseRoundQuestion(
  shuffledQuestionIds: string[],
  askedQuestionIds: string[]
): Question | null {
  const nextIndex = askedQuestionIds.length
  if (nextIndex >= shuffledQuestionIds.length) return null
  const nextId = shuffledQuestionIds[nextIndex]
  const question = CHASE_ROUND_QUESTIONS.find((q) => q.id === nextId)
  if (!question) return null
  const cloned = { ...question, options: [...question.options] }
  return shuffleQuestionOptions(cloned)
}

export function getChaseRoundQuestion(excludeIds: string[]): Question | null {
  const available = CHASE_ROUND_QUESTIONS.filter((q) => !excludeIds.includes(q.id))
  if (available.length === 0) return null
  const q = available[Math.floor(Math.random() * available.length)]
  const cloned = { ...q, options: [...q.options] }
  return shuffleQuestionOptions(cloned)
}

export function getEarnedAmount(correctAnswers: number): number {
  return correctAnswers * CASH_PER_CORRECT
}

export { CASH_BUILDER_QUESTIONS } from './cashBuilderQuestions.js'
export { CHASE_ROUND_QUESTIONS } from './chaseQuestions.js'
