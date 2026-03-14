import mongoose from 'mongoose'
import type { Question } from '../types/game.js'
import { Question as QuestionModel } from '../models/Question.js'

/** Fisher-Yates shuffle - returns a new shuffled copy */
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

type QuestionDoc = {
  _id: { toString: () => string }
  text: string
  options: string[]
  correctAnswer: string
  category: string
  difficulty: string
}

/**
 * Build a game Question with exactly 3 options, always including the correct answer.
 * Validates the raw doc; returns null if data is invalid (logs warning, does not throw).
 * - Correct answer is always included.
 * - Two wrong options are chosen from the remaining options (no duplicates in result).
 * - Final 3 options are shuffled before being returned.
 */
export function buildThreeOptionQuestion(doc: QuestionDoc | null): Question | null {
  if (!doc || !doc.options || !Array.isArray(doc.options)) {
    console.warn('[buildThreeOptionQuestion] Invalid question: missing or invalid options')
    return null
  }
  const correct = doc.correctAnswer
  if (correct == null || typeof correct !== 'string' || correct === '') {
    console.warn('[buildThreeOptionQuestion] Invalid question: missing correctAnswer', doc._id?.toString())
    return null
  }
  const allOptions = doc.options
  if (!allOptions.includes(correct)) {
    console.warn(
      '[buildThreeOptionQuestion] correctAnswer not in options – question skipped',
      { questionId: doc._id?.toString(), correctAnswer: correct, options: allOptions }
    )
    return null
  }
  const wrongOptions = [...new Set(allOptions.filter((o) => o !== correct))]
  if (wrongOptions.length < 2) {
    console.warn(
      '[buildThreeOptionQuestion] Need at least 2 distinct wrong options – question skipped',
      { questionId: doc._id?.toString(), optionsCount: allOptions.length }
    )
    return null
  }
  const pickedWrong =
    wrongOptions.length === 2
      ? wrongOptions
      : shuffleArray([...wrongOptions]).slice(0, 2)
  const finalOptions = shuffleArray([correct, ...pickedWrong])
  const correctIndex = finalOptions.indexOf(correct)
  return {
    id: doc._id.toString(),
    text: doc.text,
    options: finalOptions,
    correctAnswer: correctIndex,
    category: doc.category,
    difficulty: doc.difficulty,
  }
}

/**
 * Convert a MongoDB document to the game Question format with exactly 3 options.
 * Uses buildThreeOptionQuestion so the correct answer is always included.
 */
function docToQuestion(doc: QuestionDoc): Question | null {
  return buildThreeOptionQuestion(doc)
}

/**
 * Fetch a random cash builder question from MongoDB.
 * Optionally exclude already-asked question IDs.
 */
export async function getRandomCashBuilderQuestion(
  excludedIds: string[] = []
): Promise<Question | null> {
  try {
    const matchStage: Record<string, unknown> = { round: 'cash_builder' }
    if (excludedIds.length > 0) {
      const objectIds = excludedIds
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id))
      if (objectIds.length > 0) {
        matchStage._id = { $nin: objectIds }
      }
    }

    const docs = await QuestionModel.aggregate([
      { $match: matchStage },
      { $sample: { size: 1 } },
    ])

    if (!docs.length) {
      console.warn('No cash builder question returned from MongoDB')
      return null
    }
    const question = docToQuestion(docs[0])
    if (!question) return null
    return question
  } catch (err) {
    console.warn('getRandomCashBuilderQuestion failed:', err)
    return null
  }
}

/**
 * Fetch a random chase question from MongoDB.
 * Optionally exclude already-asked question IDs.
 */
export async function getRandomChaseQuestion(
  excludedIds: string[] = []
): Promise<Question | null> {
  try {
    const matchStage: Record<string, unknown> = { round: 'chase' }
    if (excludedIds.length > 0) {
      const objectIds = excludedIds
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id))
      if (objectIds.length > 0) {
        matchStage._id = { $nin: objectIds }
      }
    }

    const docs = await QuestionModel.aggregate([
      { $match: matchStage },
      { $sample: { size: 1 } },
    ])

    if (!docs.length) {
      console.warn('No chase question returned from MongoDB')
      return null
    }
    const question = docToQuestion(docs[0])
    if (!question) return null
    return question
  } catch (err) {
    console.warn('getRandomChaseQuestion failed:', err)
    return null
  }
}
