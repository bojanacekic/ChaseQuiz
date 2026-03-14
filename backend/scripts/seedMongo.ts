/**
 * Seed the questions collection with sample data.
 * Run with: npm run seed (from backend folder) or docker compose exec backend npm run seed
 * Uses MONGO_URI from environment (e.g. mongodb://mongodb:27017/chasequiz in Docker).
 */
import 'dotenv/config'
import mongoose from 'mongoose'
import { readFileSync } from 'fs'
import { join } from 'path'
import { Question } from '../src/models/Question.js'

const uri = process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017/chasequiz'

async function seed(): Promise<void> {
  await mongoose.connect(uri)
  console.log('Connected to MongoDB')

  const path = join(process.cwd(), 'scripts', 'seedQuestions.json')
  const raw = readFileSync(path, 'utf-8')
  const items = JSON.parse(raw) as Array<{
    text: string
    options: string[]
    correctAnswer: string
    category: string
    difficulty: string
    round: string
  }>

  const valid: typeof items = []
  for (const q of items) {
    if (!q.text || !Array.isArray(q.options) || q.options.length < 3) {
      console.warn('Skipping invalid question (missing text or < 3 options):', q.text?.slice(0, 30))
      continue
    }
    if (!q.options.includes(q.correctAnswer)) {
      console.warn('Skipping invalid question (correctAnswer not in options):', q.text?.slice(0, 30))
      continue
    }
    if (q.round !== 'cash_builder' && q.round !== 'chase') {
      console.warn('Skipping invalid question (round must be cash_builder or chase):', q.text?.slice(0, 30))
      continue
    }
    valid.push(q)
  }

  if (valid.length === 0) {
    console.error('No valid questions to insert')
    process.exit(1)
  }

  const existing = await Question.countDocuments()
  if (existing > 0) {
    console.log(`Collection already has ${existing} documents. Inserting ${valid.length} more (no delete).`)
  }

  await Question.insertMany(valid)
  console.log(`Inserted ${valid.length} questions.`)

  const total = await Question.countDocuments()
  const cashBuilder = await Question.countDocuments({ round: 'cash_builder' })
  const chase = await Question.countDocuments({ round: 'chase' })
  console.log('Mongo questions total:', total)
  console.log('Cash builder questions:', cashBuilder)
  console.log('Chase questions:', chase)

  await mongoose.disconnect()
  console.log('Done.')
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
