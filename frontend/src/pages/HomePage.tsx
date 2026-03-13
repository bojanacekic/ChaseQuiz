import { useState } from 'react'

function HomePage() {
  const [nickname, setNickname] = useState('')
  const [roomCode, setRoomCode] = useState('')

  const handleCreateRoom = () => {
    // Placeholder - game logic to be added later
    console.log('Create room:', nickname)
  }

  const handleJoinRoom = () => {
    // Placeholder - game logic to be added later
    console.log('Join room:', nickname, roomCode)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold text-amber-400 mb-12">ChaseQuiz</h1>

      <div className="w-full max-w-md space-y-8">
        <div className="space-y-2">
          <label htmlFor="nickname" className="block text-sm font-medium text-slate-300">
            Nickname
          </label>
          <input
            id="nickname"
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Enter your nickname"
            className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>

        <div className="space-y-3">
          <button
            onClick={handleCreateRoom}
            disabled={!nickname.trim()}
            className="w-full py-3 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:bg-slate-600 disabled:cursor-not-allowed text-slate-900 font-semibold transition-colors"
          >
            Create Room
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-slate-900 text-slate-500">or</span>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="roomCode" className="block text-sm font-medium text-slate-300">
            Room Code
          </label>
          <input
            id="roomCode"
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            placeholder="Enter room code"
            className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>

        <div className="space-y-3">
          <button
            onClick={handleJoinRoom}
            disabled={!nickname.trim() || !roomCode.trim()}
            className="w-full py-3 px-4 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold border border-slate-600 transition-colors"
          >
            Join Room
          </button>
        </div>
      </div>
    </div>
  )
}

export default HomePage
