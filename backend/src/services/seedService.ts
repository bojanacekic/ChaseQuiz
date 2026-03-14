import { readFileSync } from 'fs'
import { join } from 'path'
import { Question } from '../models/Question.js'

type SeedQuestion = {
  text: string
  options: string[]
  correctAnswer: string
  category: string
  difficulty: string
  round: string
}

function loadSeedData(): SeedQuestion[] {
  const path = join(process.cwd(), 'scripts', 'seedQuestions.json')
  const raw = readFileSync(path, 'utf-8')
  return JSON.parse(raw) as SeedQuestion[]
}

function validateQuestion(q: SeedQuestion): boolean {
  if (!q.text || !Array.isArray(q.options) || q.options.length < 3) return false
  if (!q.options.includes(q.correctAnswer)) return false
  if (q.round !== 'cash_builder' && q.round !== 'chase') return false
  return true
}

/**
 * Ensures the questions collection has data. If empty, seeds from seedQuestions.json.
 * Skips seeding if questions already exist.
 */
export async function ensureQuestionsSeeded(): Promise<void> {
  const count = await Question.countDocuments()
  if (count > 0) {
    console.log('Questions already exist, skipping seed')
    const total = await Question.countDocuments()
    const cashBuilder = await Question.countDocuments({ round: 'cash_builder' })
    const chase = await Question.countDocuments({ round: 'chase' })
    console.log('Mongo questions total:', total)
    console.log('Cash builder questions:', cashBuilder)
    console.log('Chase questions:', chase)
    return
  }

  console.log('Questions collection is empty, seeding database...')
  const items = loadSeedData()
  const valid = items.filter((q) => {
    const ok = validateQuestion(q)
    if (!ok) {
      console.warn('Skipping invalid question:', q.text?.slice(0, 40))
    }
    return ok
  })

  if (valid.length === 0) {
    throw new Error('No valid questions to seed')
  }

  await Question.insertMany(valid)
  console.log('Inserted', valid.length, 'questions into MongoDB')

  const total = await Question.countDocuments()
  const cashBuilder = await Question.countDocuments({ round: 'cash_builder' })
  const chase = await Question.countDocuments({ round: 'chase' })
  console.log('Mongo questions total:', total)
  console.log('Cash builder questions:', cashBuilder)
  console.log('Chase questions:', chase)
}
