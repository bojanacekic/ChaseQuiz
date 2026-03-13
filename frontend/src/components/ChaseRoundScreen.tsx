import type { RoomState } from '../types/room'

interface ChaseRoundScreenProps {
  room: RoomState
}

function ChaseRoundScreen({ room }: ChaseRoundScreenProps) {
  const chase = room.chaseRound

  if (!chase) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <p className="text-slate-400">Loading chase round...</p>
      </div>
    )
  }

  const formatEuro = (value: number) =>
    value >= 0 ? `${value.toLocaleString()}€` : `-${Math.abs(value).toLocaleString()}€`

  const question = chase.currentQuestion

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold text-amber-400 mb-2">The Chase</h1>
      <p className="text-slate-400 mb-8">Chase round started</p>

      <div className="w-full max-w-lg space-y-6">
        <div className="rounded-lg bg-slate-800 border border-slate-600 p-4 text-center">
          <p className="text-sm text-slate-400 mb-1">Bank value</p>
          <p className="text-2xl font-bold text-amber-400">
            {formatEuro(chase.bankValue)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-slate-800 border border-slate-600 p-4">
            <p className="text-sm text-slate-400">Board size</p>
            <p className="text-xl font-bold text-white">{chase.boardSize}</p>
          </div>
          <div className="rounded-lg bg-slate-800 border border-slate-600 p-4">
            <p className="text-sm text-slate-400">Your position</p>
            <p className="text-xl font-bold text-green-400">{chase.playerPosition}</p>
          </div>
          <div className="rounded-lg bg-slate-800 border border-slate-600 p-4">
            <p className="text-sm text-slate-400">Chaser position</p>
            <p className="text-xl font-bold text-red-400">{chase.chaserPosition}</p>
          </div>
        </div>

        {question ? (
          <div className="rounded-lg bg-slate-800 border border-slate-600 p-4">
            <p className="text-xs text-slate-500 mb-1">
              {question.category} • {question.difficulty}
            </p>
            <p className="text-white text-lg mb-4">{question.text}</p>
            <div className="grid gap-2">
              {question.options.map((option, index) => (
                <div
                  key={index}
                  className="py-2 px-3 rounded bg-slate-700/50 text-slate-300"
                >
                  {option}
                </div>
              ))}
            </div>
            <p className="text-slate-500 text-sm mt-3">Answer logic coming soon</p>
          </div>
        ) : (
          <p className="text-slate-400 text-center">Loading question...</p>
        )}
      </div>
    </div>
  )
}

export default ChaseRoundScreen
