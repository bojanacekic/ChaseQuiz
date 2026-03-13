import { useState, useEffect } from 'react'
import HomePage from './pages/HomePage'
import Lobby from './components/Lobby'
import { socket } from './socket'
import type { RoomState } from './types/room'

import './socket'

function App() {
  const [room, setRoom] = useState<RoomState | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleRoomCreated = (payload: { room: RoomState }) => {
      setError(null)
      setRoom(payload.room)
    }

    const handleRoomJoined = (payload: { room: RoomState }) => {
      setError(null)
      setRoom(payload.room)
    }

    const handleLeftRoom = () => {
      setRoom(null)
    }

    const handleCreateRoomError = (payload: { message: string }) => {
      setError(payload.message)
    }

    const handleJoinRoomError = (payload: { message: string }) => {
      setError(payload.message)
    }

    socket.on('room_created', handleRoomCreated)
    socket.on('room_joined', handleRoomJoined)
    socket.on('room_state', (payload) => {
      setRoom((prev) => (prev?.code === payload.room.code ? payload.room : prev))
    })
    socket.on('left_room', handleLeftRoom)
    socket.on('create_room_error', handleCreateRoomError)
    socket.on('join_room_error', handleJoinRoomError)

    return () => {
      socket.off('room_created', handleRoomCreated)
      socket.off('room_joined', handleRoomJoined)
      socket.off('room_state')
      socket.off('left_room', handleLeftRoom)
      socket.off('create_room_error', handleCreateRoomError)
      socket.off('join_room_error', handleJoinRoomError)
    }
  }, [room?.code])

  return (
    <div className="min-h-screen bg-slate-900">
      {room ? (
        <Lobby room={room} />
      ) : (
        <HomePage error={error} clearError={() => setError(null)} />
      )}
    </div>
  )
}

export default App
