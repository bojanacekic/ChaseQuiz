import type { RoomState } from '../types/room'

interface RoundResultScreenProps {
  room: RoomState
  onPlayAgain: () => void
}

function RoundResultScreen({ room, onPlayAgain }: RoundResultScreenProps) {
  const result = room.roundResult
  const nickname = room.players[0]?.nickname

  if (!result) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <p className="text-slate-400">Loading result...</p>
      </div>
    )
  }

  const formatEuro = (value: number) =>
    value >= 0 ? `${value.toLocaleString()}€` : `-${Math.abs(value).toLocaleString()}€`

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold text-amber-400 mb-8">Round Result</h1>

      <div className="w-full max-w-md space-y-8 text-center">
        {result.outcome === 'caught' ? (
          <p className="text-3xl font-bold text-red-400">Caught by the chaser</p>
        ) : (
          <p className="text-3xl font-bold text-green-400">You escaped!</p>
        )}

        {nickname && (
          <p className="text-slate-400 text-lg">{nickname}</p>
        )}

        <div className="rounded-xl bg-slate-800 border border-slate-600 p-6">
          <p className="text-sm text-slate-400 mb-2">Winnings</p>
          <p className="text-3xl font-bold text-amber-400">
            {formatEuro(result.bankValue)}
          </p>
        </div>

        <button
          onClick={onPlayAgain}
          className="w-full py-4 px-6 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-lg transition-colors"
        >
          Play Again
        </button>
      </div>
    </div>
  )
}

export default RoundResultScreen
