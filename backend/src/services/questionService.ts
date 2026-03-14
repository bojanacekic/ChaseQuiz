import mongoose from 'mongoose'
import type { Question } from '../types/game.js'
import { Question as QuestionModel } from '../models/Question.js'

/** Fisher-Yates shuffle indices */
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/** Shuffle options and update correctAnswer index (expects 3 options) */
function shuffleQuestionOptions(question: Question): Question {
  const indices = [0, 1, 2].slice(0, question.options.length)
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
 * Convert a MongoDB document to the game Question format.
 * DB stores correctAnswer as text; game expects correctAnswer as option index.
 */
function docToQuestion(doc: {
  _id: { toString: () => string }
  text: string
  options: string[]
  correctAnswer: string
  category: string
  difficulty: string
}): Question {
  const correctIndex = doc.options.indexOf(doc.correctAnswer)
  const q: Question = {
    id: doc._id.toString(),
    text: doc.text,
    options: doc.options,
    correctAnswer: correctIndex >= 0 ? correctIndex : 0,
    category: doc.category,
    difficulty: doc.difficulty,
  }
  return shuffleQuestionOptions(q)
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
    return docToQuestion(docs[0])
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
    return docToQuestion(docs[0])
  } catch (err) {
    console.warn('getRandomChaseQuestion failed:', err)
    return null
  }
}
