import ChaseBoard from './ChaseBoard'
import type { RoomState } from '../types/room'
import { socket } from '../socket'

interface ChaseRoundScreenProps {
  room: RoomState
  error: string | null
  onClearError: () => void
}

function ChaseRoundScreen({ room, error, onClearError }: ChaseRoundScreenProps) {
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
  const duel = chase.duelState
  const isActivePlayer = room.activePlayerId
    ? room.players.some(
        (p) => p.id === room.activePlayerId && p.socketId === socket.id
      )
    : false
  const canAnswer =
    isActivePlayer &&
    question &&
    duel &&
    !duel.playerAnswered &&
    !duel.resolved &&
    (!duel.countdownEndsAt || Date.now() < duel.countdownEndsAt)

  const handleSubmitAnswer = (optionIndex: number) => {
    onClearError()
    socket.emit('submit_chase_answer', { optionIndex })
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row p-6 gap-8">
      {/* Left column: chase board */}
      <div className="flex-shrink-0 flex flex-col items-center md:items-start">
        <h1 className="text-2xl font-bold text-amber-400 mb-4 md:hidden">
          The Chase
        </h1>
        <ChaseBoard
          boardSize={chase.boardSize}
          playerPosition={chase.playerPosition}
          chaserPosition={chase.chaserPosition}
        />
      </div>

      {/* Right column: question and answers */}
      <div className="flex-1 flex flex-col min-w-0 max-w-xl">
        <h1 className="text-2xl md:text-3xl font-bold text-amber-400 mb-1 hidden md:block">
          The Chase
        </h1>
        <p className="text-slate-400 mb-6 hidden md:block">Chase round</p>

        <div className="rounded-lg bg-slate-800 border border-slate-600 p-4 mb-6">
          <p className="text-sm text-slate-400 mb-1">Bank</p>
          <p className="text-2xl font-bold text-amber-400">
            {formatEuro(chase.bankValue)}
          </p>
        </div>

        {question ? (
          <div className="rounded-lg bg-slate-800 border border-slate-600 p-4 flex flex-col">
            <p className="text-xs text-slate-500 mb-1">
              {question.category} • {question.difficulty}
            </p>
            <p className="text-white text-lg mb-4">{question.text}</p>
            {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
            <div className="grid gap-2 mb-4">
              {question.options.map((option, index) => {
                const label = ['A', 'B', 'C'][index] ?? String(index + 1)
                return (
                  <button
                    key={index}
                    onClick={() => handleSubmitAnswer(index)}
                    disabled={!canAnswer}
                    className="w-full py-3 px-4 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-600 text-white text-left transition-colors"
                  >
                    <span className="font-mono text-amber-400 mr-2">[{label}]</span>
                    {option}
                  </button>
                )
              })}
            </div>

            {/* Countdown and duel status BELOW answers */}
            {duel && (
              <div className="mt-2 pt-4 border-t border-slate-600 space-y-1 text-sm">
                {duel.countdownStarted && duel.countdownTimeLeft > 0 && (
                  <p className="text-amber-400 font-medium">
                    Time left to respond: {duel.countdownTimeLeft}
                  </p>
                )}
                {duel.playerAnswered && (
                  <p className="text-green-400">Player answered</p>
                )}
                {duel.chaserAnswered && (
                  <p className="text-red-400">Chaser answered</p>
                )}
                {duel.countdownStarted && duel.countdownStartedBy && (
                  <p className="text-slate-300">
                    Countdown started by {duel.countdownStartedBy}
                  </p>
                )}
                {duel.resolved && (
                  <div className="space-y-1 pt-2">
                    {duel.playerMoved && (
                      <p className="text-green-400">
                        Player correct – moves to {chase.playerPosition}
                      </p>
                    )}
                    {!duel.playerMoved && duel.playerAnswered && (
                      <p className="text-slate-400">Player incorrect</p>
                    )}
                    {duel.chaserMoved && (
                      <p className="text-red-400">
                        Chaser correct – moves to {chase.chaserPosition}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <p className="text-slate-400 text-center py-8">
            Loading question...
          </p>
        )}

        <div className="mt-6 rounded-lg bg-slate-800/50 border border-slate-700 p-3">
          <p className="text-sm text-slate-400">
            Room: <span className="font-mono text-amber-400">{room.code}</span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ChaseRoundScreen
