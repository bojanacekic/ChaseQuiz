import type { RoomState } from '../types/room'

interface OfferSelectionScreenProps {
  room: RoomState
}

function OfferSelectionScreen({ room }: OfferSelectionScreenProps) {
  const offer = room.offerSelection
  const earned = room.cashBuilder?.earnedAmount ?? 0

  if (!offer) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <p className="text-slate-400">Loading offers...</p>
      </div>
    )
  }

  const formatEuro = (value: number) =>
    value >= 0 ? `${value.toLocaleString()}€` : `-${Math.abs(value).toLocaleString()}€`

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold text-amber-400 mb-2">Offer Selection</h1>
      <p className="text-slate-400 mb-8">Choose your offer</p>

      <div className="w-full max-w-md space-y-6">
        <div className="rounded-lg bg-slate-800 border border-slate-600 p-4 text-center">
          <p className="text-sm text-slate-400 mb-1">You earned</p>
          <p className="text-2xl font-bold text-amber-400">
            {formatEuro(earned)}
          </p>
        </div>

        <div className="space-y-3">
          <div className="rounded-lg bg-slate-800 border border-slate-600 p-4 flex justify-between items-center">
            <span className="text-slate-400">Higher offer</span>
            <span className="text-xl font-bold text-white">
              {formatEuro(offer.higherOffer)}
            </span>
          </div>
          <div className="rounded-lg bg-amber-500/20 border border-amber-500/50 p-4 flex justify-between items-center">
            <span className="text-amber-400">Middle offer (bank)</span>
            <span className="text-xl font-bold text-amber-400">
              {formatEuro(offer.middleOffer)}
            </span>
          </div>
          <div className="rounded-lg bg-slate-800 border border-slate-600 p-4 flex justify-between items-center">
            <span className="text-slate-400">Lower offer</span>
            <span className="text-xl font-bold text-white">
              {formatEuro(offer.lowerOffer)}
            </span>
          </div>
        </div>

        <p className="text-slate-500 text-sm text-center">
          Choose your offer (coming soon)
        </p>
      </div>
    </div>
  )
}

export default OfferSelectionScreen
