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

  /** Answer button state: default | pending (selected, waiting) | correct | wrong.
   * When resolved: correct answer is ALWAYS green; if player selected wrong, that option is red. */
  function getAnswerButtonState(index: number): 'default' | 'pending' | 'correct' | 'wrong' {
    if (!duel) return 'default'
    if (duel.resolved && question != null) {
      const correctIndex = question.correctAnswer
      const isCorrectOption = index === correctIndex
      const isPlayerWrongChoice = duel.playerAnswer === index && duel.playerWasCorrect === false
      if (isCorrectOption) return 'correct'
      if (isPlayerWrongChoice) return 'wrong'
      return 'default'
    }
    if (duel.playerAnswered && duel.playerAnswer === index) return 'pending'
    return 'default'
  }

  const buttonStateClasses: Record<string, string> = {
    default:
      'bg-slate-700 hover:bg-slate-600 border-slate-600 text-white',
    pending:
      'bg-slate-500/80 border-slate-400 text-slate-200 cursor-default',
    correct:
      'bg-emerald-600/90 border-emerald-500 text-white cursor-default',
    wrong:
      'bg-red-600/90 border-red-500 text-white cursor-default',
  }

  return (
    <div className="min-h-screen flex justify-center items-center px-6 py-8">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 max-w-7xl w-full">
        {/* Left: chase board card */}
        <div className="flex-shrink-0 flex flex-col items-center lg:items-start lg:w-[320px]">
          <h1 className="text-2xl font-bold text-amber-400 mb-6 lg:hidden">
            The Chase
          </h1>
          <ChaseBoard
            boardSize={chase.boardSize}
            playerPosition={chase.playerPosition}
            chaserPosition={chase.chaserPosition}
          />
        </div>

        {/* Right: question card */}
        <div className="flex-1 flex flex-col min-w-0 max-w-xl">
          <h1 className="text-2xl lg:text-3xl font-bold text-amber-400 mb-1 hidden lg:block">
            The Chase
          </h1>
          <p className="text-slate-400 mb-6 hidden lg:block">Chase round</p>

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
                  const state = getAnswerButtonState(index)
                  const disabled = !canAnswer || state !== 'default'
                  return (
                    <button
                      key={index}
                      onClick={() => handleSubmitAnswer(index)}
                      disabled={disabled}
                      className={`w-full py-3 px-4 rounded-lg border text-left transition-all duration-200 ${buttonStateClasses[state]} ${disabled ? 'opacity-100' : ''} ${!canAnswer && state === 'default' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span className={`font-mono mr-2 ${state === 'default' && canAnswer ? 'text-amber-400' : state === 'pending' ? 'text-slate-300' : 'text-white'}`}>
                        [{label}]
                      </span>
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
                    <p className="text-sky-400">Player answered</p>
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
                        <p className="text-emerald-400">
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
        </div>
      </div>
    </div>
  )
}

export default ChaseRoundScreen
