import { useState, useEffect } from 'react'
import type { RoomState } from '../types/room'
import { socket } from '../socket'

interface OfferSelectionScreenProps {
  room: RoomState
  error: string | null
  onClearError: () => void
}

function OfferSelectionScreen({ room, error, onClearError }: OfferSelectionScreenProps) {
  const [selecting, setSelecting] = useState(false)
  const offer = room.offerSelection
  const earned = room.cashBuilder?.earnedAmount ?? 0
  const isActivePlayer = room.activePlayerId
    ? room.players.some(
        (p) => p.id === room.activePlayerId && p.socketId === socket.id
      )
    : false
  const hasSelected = offer?.selectedOffer !== null

  useEffect(() => {
    if (error) setSelecting(false)
  }, [error])

  const formatEuro = (value: number) =>
    value >= 0 ? `${value.toLocaleString()}€` : `-${Math.abs(value).toLocaleString()}€`

  const handleSelectOffer = (offerValue: number) => {
    if (!isActivePlayer || hasSelected || selecting) return
    onClearError()
    setSelecting(true)
    socket.emit('select_offer', { offerValue })
  }

  if (!offer) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <p className="text-slate-400">Loading offers...</p>
      </div>
    )
  }

  const canSelect = isActivePlayer && !hasSelected && !selecting

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

        {error && (
          <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 text-sm">
            {error}
          </div>
        )}

        {hasSelected ? (
          <p className="text-amber-400 text-center">Offer selected – starting chase round...</p>
        ) : (
          <div className="space-y-3">
            <button
              onClick={() => handleSelectOffer(offer.higherOffer)}
              disabled={!canSelect}
              className="w-full rounded-lg bg-slate-800 border border-slate-600 p-4 flex justify-between items-center hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span className="text-slate-400">Higher offer</span>
              <span className="text-xl font-bold text-white">
                {formatEuro(offer.higherOffer)}
              </span>
            </button>
            <button
              onClick={() => handleSelectOffer(offer.middleOffer)}
              disabled={!canSelect}
              className="w-full rounded-lg bg-amber-500/20 border border-amber-500/50 p-4 flex justify-between items-center hover:bg-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span className="text-amber-400">Middle offer (bank)</span>
              <span className="text-xl font-bold text-amber-400">
                {formatEuro(offer.middleOffer)}
              </span>
            </button>
            <button
              onClick={() => handleSelectOffer(offer.lowerOffer)}
              disabled={!canSelect}
              className="w-full rounded-lg bg-slate-800 border border-slate-600 p-4 flex justify-between items-center hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span className="text-slate-400">Lower offer</span>
              <span className="text-xl font-bold text-white">
                {formatEuro(offer.lowerOffer)}
              </span>
            </button>
          </div>
        )}

        {!isActivePlayer && !hasSelected && (
          <p className="text-slate-500 text-sm text-center">
            Waiting for player to choose...
          </p>
        )}
      </div>
    </div>
  )
}

export default OfferSelectionScreen
