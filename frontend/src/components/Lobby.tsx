import type { RoomState } from '../types/room'
import { socket } from '../socket'

interface LobbyProps {
  room: RoomState
}

function Lobby({ room }: LobbyProps) {
  const handleLeave = () => {
    socket.emit('leave_room')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold text-amber-400 mb-2">ChaseQuiz</h1>
      <p className="text-slate-400 mb-8">Waiting for players...</p>

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
