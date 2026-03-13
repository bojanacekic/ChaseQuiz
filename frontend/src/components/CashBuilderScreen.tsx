import type { RoomState } from '../types/room'
import { socket } from '../socket'

interface CashBuilderScreenProps {
  room: RoomState
  error: string | null
  onClearError: () => void
}

function CashBuilderScreen({ room, error, onClearError }: CashBuilderScreenProps) {
  const cb = room.cashBuilder
  const isActivePlayer = room.activePlayerId
    ? room.players.some(
        (p) => p.id === room.activePlayerId && p.socketId === socket.id
      )
    : false
  const question = cb?.currentQuestion
  const canAnswer = isActivePlayer && cb && cb.timeLeft > 0

  const handleSubmitAnswer = (optionIndex: number) => {
    onClearError()
    socket.emit('submit_answer', { optionIndex })
  }

  if (!cb) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <p className="text-slate-400">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold text-amber-400 mb-2">Cash Builder</h1>
      <p className="text-slate-400 mb-8">Answer correctly to build your prize fund</p>

      <div className="w-full max-w-lg space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-slate-800 border border-slate-600 p-4">
            <p className="text-sm text-slate-400">Correct</p>
            <p className="text-2xl font-bold text-green-400">{cb.correctAnswers}</p>
          </div>
          <div className="rounded-lg bg-slate-800 border border-slate-600 p-4">
            <p className="text-sm text-slate-400">Earned</p>
            <p className="text-2xl font-bold text-amber-400">
              £{cb.earnedAmount.toLocaleString()}
            </p>
          </div>
        </div>

        <div
          className={`rounded-lg border p-4 ${
            cb.timeLeft > 10
              ? 'bg-slate-800/50 border-slate-700'
              : cb.timeLeft > 0
                ? 'bg-amber-500/10 border-amber-500/50'
                : 'bg-slate-800/50 border-slate-700'
          }`}
        >
          <p className="text-sm text-slate-400">Time left</p>
          <p
            className={`text-2xl font-bold font-mono ${
              cb.timeLeft > 10 ? 'text-white' : cb.timeLeft > 0 ? 'text-amber-400' : 'text-slate-500'
            }`}
          >
            {cb.timeLeft}s
          </p>
          {cb.timeLeft <= 0 && (
            <p className="text-sm text-slate-400 mt-1">Time&#39;s up!</p>
          )}
        </div>

        {question ? (
          <>
            <div className="rounded-lg bg-slate-800 border border-slate-600 p-4">
              <p className="text-xs text-slate-500 mb-1">
                {question.category} • {question.difficulty}
              </p>
              <p className="text-white text-lg">{question.text}</p>
            </div>

            {canAnswer ? (
              <div className="space-y-3">
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <div className="grid gap-3">
                  {question.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleSubmitAnswer(index)}
                      className="w-full py-3 px-4 rounded-lg bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white text-left transition-colors"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ) : cb.timeLeft <= 0 ? (
              <p className="text-amber-400 text-center font-medium">Round over – check your offers</p>
            ) : (
              <p className="text-slate-400 text-center">Waiting for player to answer...</p>
            )}
          </>
        ) : (
          <p className="text-slate-400 text-center">Loading next question...</p>
        )}

        <div className="rounded-lg bg-slate-800/50 border border-slate-700 p-3">
          <p className="text-sm text-slate-400">
            Room: <span className="font-mono text-amber-400">{room.code}</span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default CashBuilderScreen
