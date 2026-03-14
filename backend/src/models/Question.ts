import mongoose from 'mongoose'

const questionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    options: { type: [String], required: true },
    correctAnswer: { type: String, required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
    category: { type: String, required: true },
    round: { type: String, enum: ['cash_builder', 'chase'], required: true },
  },
  { timestamps: true }
)

export const Question = mongoose.model('Question', questionSchema)
