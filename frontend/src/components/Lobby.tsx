import type { RoomState } from '../types/room'
import { socket } from '../socket'

interface LobbyProps {
  room: RoomState
  error: string | null
  onClearError: () => void
  onAutoStart?: boolean
}

function Lobby({ room, error, onClearError, onAutoStart }: LobbyProps) {
  const isHost = room.players.some((p) => p.socketId === socket.id && p.isHost)

  if (onAutoStart) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <h1 className="text-3xl font-bold text-amber-400 mb-4">ChaseQuiz</h1>
        <p className="text-slate-400 animate-pulse">Starting game...</p>
      </div>
    )
  }

  const handleLeave = () => {
    socket.emit('leave_room')
  }

  const handleStartGame = () => {
    onClearError()
    socket.emit('start_game')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold text-amber-400 mb-2">ChaseQuiz</h1>
      <p className="text-slate-400 mb-8">Waiting for players...</p>

      {error && (
        <div className="w-full max-w-md mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="w-full max-w-md space-y-6">
        <div className="rounded-lg bg-slate-800 border border-slate-600 p-4">
          <p className="text-sm text-slate-400 mb-1">Room Code</p>
          <p className="text-2xl font-mono font-bold text-amber-400 tracking-widest">
            {room.code}
          </p>
        </div>

        <div className="rounded-lg bg-slate-800 border border-slate-600 p-4">
          <p className="text-sm text-slate-400 mb-3">Players ({room.players.length})</p>
          <ul className="space-y-2">
            {room.players.map((player) => (
              <li
                key={player.id}
                className="flex items-center justify-between py-2 px-3 rounded bg-slate-700/50"
              >
                <span className="text-white">{player.nickname}</span>
                {player.isHost && (
                  <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-medium">
                    Host
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {isHost && (
          <button
            onClick={handleStartGame}
            disabled={room.players.length < 1}
            className="w-full py-3 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:bg-slate-600 disabled:cursor-not-allowed text-slate-900 font-semibold transition-colors"
          >
            Start Game
          </button>
        )}

        <button
          onClick={handleLeave}
          className="w-full py-3 px-4 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-semibold border border-slate-600 transition-colors"
        >
          Leave Room
        </button>
      </div>
    </div>
  )
}

export default Lobby
