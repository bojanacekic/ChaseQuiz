import type { Question } from '../types/game.js'

export const CASH_BUILDER_QUESTIONS: Question[] = [
  {
    id: 'cb-1',
    text: 'What is the capital of France?',
    options: ['London', 'Berlin', 'Paris', 'Madrid'],
    correctAnswer: 2,
    category: 'Geography',
    difficulty: 'easy',
  },
  {
    id: 'cb-2',
    text: 'Which planet is known as the Red Planet?',
    options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
    correctAnswer: 1,
    category: 'Science',
    difficulty: 'easy',
  },
  {
    id: 'cb-3',
    text: 'What is 7 × 8?',
    options: ['54', '56', '58', '60'],
    correctAnswer: 1,
    category: 'Math',
    difficulty: 'easy',
  },
  {
    id: 'cb-4',
    text: 'Who wrote Romeo and Juliet?',
    options: ['Charles Dickens', 'Jane Austen', 'William Shakespeare', 'Mark Twain'],
    correctAnswer: 2,
    category: 'Literature',
    difficulty: 'easy',
  },
  {
    id: 'cb-5',
    text: 'What is the chemical symbol for gold?',
    options: ['Go', 'Gd', 'Au', 'Ag'],
    correctAnswer: 2,
    category: 'Science',
    difficulty: 'easy',
  },
]

export const CHASE_ROUND_QUESTIONS: Question[] = [
  {
    id: 'chase-1',
    text: 'In which year did World War II end?',
    options: ['1943', '1944', '1945', '1946'],
    correctAnswer: 2,
    category: 'History',
    difficulty: 'medium',
  },
  {
    id: 'chase-2',
    text: 'What is the largest ocean on Earth?',
    options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'],
    correctAnswer: 3,
    category: 'Geography',
    difficulty: 'easy',
  },
  {
    id: 'chase-3',
    text: 'Which element has the atomic number 1?',
    options: ['Helium', 'Hydrogen', 'Lithium', 'Carbon'],
    correctAnswer: 1,
    category: 'Science',
    difficulty: 'medium',
  },
  {
    id: 'chase-4',
    text: 'Who painted the Mona Lisa?',
    options: ['Michelangelo', 'Leonardo da Vinci', 'Raphael', 'Donatello'],
    correctAnswer: 1,
    category: 'Art',
    difficulty: 'easy',
  },
  {
    id: 'chase-5',
    text: 'What is the square root of 144?',
    options: ['10', '11', '12', '13'],
    correctAnswer: 2,
    category: 'Math',
    difficulty: 'easy',
  },
]

const CASH_PER_CORRECT = 1000

export function getCashBuilderQuestion(excludeIds: string[]): Question | null {
  const available = CASH_BUILDER_QUESTIONS.filter((q) => !excludeIds.includes(q.id))
  if (available.length === 0) return null
  const q = available[Math.floor(Math.random() * available.length)]
  return { ...q }
}

export function getChaseRoundQuestion(excludeIds: string[]): Question | null {
  const available = CHASE_ROUND_QUESTIONS.filter((q) => !excludeIds.includes(q.id))
  if (available.length === 0) return null
  const q = available[Math.floor(Math.random() * available.length)]
  return { ...q }
}

export function getEarnedAmount(correctAnswers: number): number {
  return correctAnswers * CASH_PER_CORRECT
}
