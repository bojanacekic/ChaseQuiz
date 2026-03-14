/**
 * Validation script for questions in MongoDB.
 * Reports invalid questions: correctAnswer not in options, fewer than 3 options, duplicate options.
 * Does not modify the database.
 *
 * Run from backend folder: npx tsx scripts/validateQuestions.ts
 * Ensure .env has MONGO_URI set.
 */

import 'dotenv/config'
import mongoose from 'mongoose'
import { Question as QuestionModel } from '../src/models/Question.js'

interface ValidationIssue {
  questionId: string
  round?: string
  issues: string[]
}

async function validateQuestions(): Promise<void> {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/chasequiz'
  await mongoose.connect(uri)
  console.log('Connected to MongoDB\n')

  const docs = await QuestionModel.find({}).lean()
  const invalid: ValidationIssue[] = []
  const withDuplicates: ValidationIssue[] = []

  for (const doc of docs) {
    const id = (doc._id as mongoose.Types.ObjectId).toString()
    const options = doc.options as string[] | undefined
    const correctAnswer = doc.correctAnswer as string | undefined
    const round = doc.round as string | undefined
    const issues: string[] = []

    if (!options || !Array.isArray(options)) {
      issues.push('missing or invalid options array')
    } else {
      if (options.length < 3) {
        issues.push(`fewer than 3 options (has ${options.length})`)
      }
      if (correctAnswer == null || correctAnswer === '') {
        issues.push('missing correctAnswer')
      } else if (!options.includes(correctAnswer)) {
        issues.push('correctAnswer not found in options')
      }
      const uniqueOptions = new Set(options)
      if (uniqueOptions.size < options.length) {
        withDuplicates.push({ questionId: id, round, issues: ['duplicate options in array'] })
      }
    }

    if (issues.length > 0) {
      invalid.push({ questionId: id, round, issues })
    }
  }

  console.log('--- Question validation report ---')
  console.log(`Total questions: ${docs.length}`)
  console.log(`Invalid (excluded from gameplay): ${invalid.length}`)
  console.log(`With duplicate options (warning only): ${withDuplicates.length}\n`)

  if (invalid.length > 0) {
    console.log('Invalid questions:')
    for (const { questionId, round, issues } of invalid) {
      console.log(`  ${questionId} (round: ${round ?? '?'}) – ${issues.join('; ')}`)
    }
    console.log('')
  }

  if (withDuplicates.length > 0 && withDuplicates.length <= 20) {
    console.log('Questions with duplicate options (still usable if correctAnswer in options):')
    for (const { questionId, round } of withDuplicates) {
      console.log(`  ${questionId} (round: ${round ?? '?'})`)
    }
  } else if (withDuplicates.length > 20) {
    console.log(`Questions with duplicate options: ${withDuplicates.length} (first 20 shown)`)
    for (const { questionId, round } of withDuplicates.slice(0, 20)) {
      console.log(`  ${questionId} (round: ${round ?? '?'})`)
    }
  }

  await mongoose.disconnect()
  console.log('\nDone.')
}

validateQuestions().catch((err) => {
  console.error(err)
  process.exit(1)
})
