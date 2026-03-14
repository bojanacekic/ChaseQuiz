import mongoose from 'mongoose'

const questionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length === 3,
        message: 'options must contain exactly 3 strings',
      },
    },
    correctAnswer: {
      type: String,
      required: true,
      validate: {
        validator: function (this: { options: string[] }, v: string) {
          return this.options && this.options.includes(v)
        },
        message: 'correctAnswer must be one of the options',
      },
    },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
    category: { type: String, required: true },
    round: { type: String, enum: ['cash_builder', 'chase'], required: true },
  },
  { timestamps: true }
)

export const Question = mongoose.model('Question', questionSchema)
