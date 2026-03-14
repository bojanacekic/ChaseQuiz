import type { Question } from '../types/game.js'
import * as questionService from '../services/questionService.js'

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

/** Returns empty array - question order is now determined by MongoDB random sampling */
export function shuffleCashBuilderQuestionIds(): string[] {
  return []
}

/** Shuffle question options and update correctAnswer index. Returns a new question. */
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

/** Get first cash builder question from MongoDB (random sample, no exclusions) */
export async function getFirstCashBuilderQuestion(
  _shuffledQuestionIds: string[]
): Promise<Question | null> {
  return questionService.getRandomCashBuilderQuestion([])
}

/** Get next cash builder question from MongoDB (excludes already asked) */
export async function getNextCashBuilderQuestion(
  _shuffledQuestionIds: string[],
  askedQuestionIds: string[]
): Promise<Question | null> {
  return questionService.getRandomCashBuilderQuestion(askedQuestionIds)
}

/** Returns empty array - question order is now determined by MongoDB random sampling */
export function shuffleChaseRoundQuestionIds(): string[] {
  return []
}

/** Get first chase round question from MongoDB (random sample, no exclusions) */
export async function getFirstChaseRoundQuestion(
  _shuffledQuestionIds: string[]
): Promise<Question | null> {
  return questionService.getRandomChaseQuestion([])
}

/** Get next chase round question from MongoDB (excludes already asked) */
export async function getNextChaseRoundQuestion(
  _shuffledQuestionIds: string[],
  askedQuestionIds: string[]
): Promise<Question | null> {
  return questionService.getRandomChaseQuestion(askedQuestionIds)
}

export function getEarnedAmount(correctAnswers: number): number {
  return correctAnswers * CASH_PER_CORRECT
}
