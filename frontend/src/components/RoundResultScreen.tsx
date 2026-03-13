import type { RoomState } from '../types/room'

interface RoundResultScreenProps {
  room: RoomState
}

function RoundResultScreen({ room }: RoundResultScreenProps) {
  const result = room.roundResult

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
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold text-amber-400 mb-8">Round Result</h1>

      <div className="w-full max-w-md space-y-6 text-center">
        {result.outcome === 'caught' ? (
          <p className="text-2xl font-bold text-red-400">Caught by the chaser</p>
        ) : (
          <p className="text-2xl font-bold text-green-400">You escaped!</p>
        )}

        <div className="rounded-lg bg-slate-800 border border-slate-600 p-4">
          <p className="text-sm text-slate-400 mb-1">Bank value</p>
          <p className="text-2xl font-bold text-amber-400">
            {formatEuro(result.bankValue)}
          </p>
        </div>
      </div>
    </div>
  )
}

export default RoundResultScreen
