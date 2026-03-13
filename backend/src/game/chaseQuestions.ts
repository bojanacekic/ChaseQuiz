import type { Question } from '../types/game.js'

export const CHASE_ROUND_QUESTIONS: Question[] = [
  { id: 'chase-1', text: 'In which year did World War II end?', options: ['1943', '1944', '1945', '1946'], correctAnswer: 2, category: 'History', difficulty: 'medium' },
  { id: 'chase-2', text: 'What is the largest ocean on Earth?', options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'], correctAnswer: 3, category: 'Geography', difficulty: 'easy' },
  { id: 'chase-3', text: 'Which element has the atomic number 1?', options: ['Helium', 'Hydrogen', 'Lithium', 'Carbon'], correctAnswer: 1, category: 'Science', difficulty: 'medium' },
  { id: 'chase-4', text: 'Who painted the Mona Lisa?', options: ['Michelangelo', 'Leonardo da Vinci', 'Raphael', 'Donatello'], correctAnswer: 1, category: 'History', difficulty: 'easy' },
  { id: 'chase-5', text: 'What is the square root of 144?', options: ['10', '11', '12', '13'], correctAnswer: 2, category: 'General Knowledge', difficulty: 'easy' },
]
