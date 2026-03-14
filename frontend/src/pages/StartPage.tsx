import { useState } from 'react'
import { socket } from '../socket'

interface StartPageProps {
  error: string | null
  clearError: () => void
  onStart: () => void
}

function StartPage({ error, clearError, onStart }: StartPageProps) {
  const [nickname, setNickname] = useState('')

  const handleStartGame = () => {
    clearError()
    const trimmed = nickname.trim()
    if (!trimmed) return
    socket.emit('create_room', { nickname: trimmed })
    onStart()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-5xl font-bold text-amber-400 mb-3">ChaseQuiz</h1>
      <p className="text-slate-400 mb-10 text-lg">Test your knowledge against the Chaser</p>

      {error && (
        <div className="w-full max-w-sm mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2">
          <label htmlFor="nickname" className="block text-sm font-medium text-slate-300">
            Your name
          </label>
          <input
            id="nickname"
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Enter your name"
            className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-lg"
          />
        </div>

        <button
          onClick={handleStartGame}
          disabled={!nickname.trim()}
          className="w-full py-4 px-6 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:bg-slate-600 disabled:cursor-not-allowed text-slate-900 font-bold text-lg transition-colors"
        >
          Start Game
        </button>
      </div>
    </div>
  )
}

export default StartPage
