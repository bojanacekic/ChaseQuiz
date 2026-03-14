import { useState, useEffect } from 'react'
import StartPage from './pages/StartPage'
import Lobby from './components/Lobby'
import CashBuilderScreen from './components/CashBuilderScreen'
import OfferSelectionScreen from './components/OfferSelectionScreen'
import ChaseRoundScreen from './components/ChaseRoundScreen'
import RoundResultScreen from './components/RoundResultScreen'
import FinishedScreen from './components/FinishedScreen'
import { socket } from './socket'
import type { RoomState } from './types/room'

import './socket'

function renderGameView(
  room: RoomState,
  error: string | null,
  onClearError: () => void,
  onReset: () => void,
  isAutoStarting: boolean
) {
  switch (room.phase) {
    case 'lobby':
      return <Lobby room={room} error={error} onClearError={onClearError} onAutoStart={isAutoStarting} />
    case 'cash_builder':
      return <CashBuilderScreen room={room} error={error} onClearError={onClearError} />
    case 'offer_selection':
      return <OfferSelectionScreen room={room} error={error} onClearError={onClearError} />
    case 'chase_round':
      return <ChaseRoundScreen room={room} error={error} onClearError={onClearError} />
    case 'round_result':
      return <RoundResultScreen room={room} onPlayAgain={onReset} />
    case 'finished':
      return <FinishedScreen onPlayAgain={onReset} />
    default:
      return <Lobby room={room} error={error} onClearError={onClearError} />
  }
}

function App() {
  const [room, setRoom] = useState<RoomState | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isAutoStarting, setIsAutoStarting] = useState(false)

  const clearError = () => setError(null)

  const handleReset = () => {
    socket.emit('leave_room')
    setRoom(null)
    setError(null)
    setIsAutoStarting(false)
  }

  useEffect(() => {
    const handleRoomCreated = (payload: { room: RoomState }) => {
      setError(null)
      setRoom(payload.room)
      if (isAutoStarting) {
        socket.emit('start_game')
      }
    }

    const handleRoomJoined = (payload: { room: RoomState }) => {
      setError(null)
      setRoom(payload.room)
    }

    const handleLeftRoom = () => {
      setRoom(null)
      setIsAutoStarting(false)
    }

    const handleRoomState = (payload: { room: RoomState }) => {
      setRoom((prev) => {
        if (!prev || prev.code !== payload.room.code) return prev
        if (payload.room.phase !== 'lobby') setIsAutoStarting(false)
        return payload.room
      })
    }

    socket.on('room_created', handleRoomCreated)
    socket.on('room_joined', handleRoomJoined)
    socket.on('room_state', handleRoomState)
    socket.on('left_room', handleLeftRoom)
    socket.on('create_room_error', (p: { message: string }) => {
      setError(p.message)
      setIsAutoStarting(false)
    })
    socket.on('join_room_error', (p: { message: string }) => setError(p.message))
    socket.on('start_game_error', (p: { message: string }) => {
      setError(p.message)
      setIsAutoStarting(false)
    })
    socket.on('submit_answer_error', (p: { message: string }) => setError(p.message))
    socket.on('select_offer_error', (p: { message: string }) => setError(p.message))
    socket.on('submit_chase_answer_error', (p: { message: string }) => setError(p.message))

    return () => {
      socket.off('room_created', handleRoomCreated)
      socket.off('room_joined', handleRoomJoined)
      socket.off('room_state', handleRoomState)
      socket.off('left_room', handleLeftRoom)
      socket.off('create_room_error')
      socket.off('join_room_error')
      socket.off('start_game_error')
      socket.off('submit_answer_error')
      socket.off('select_offer_error')
      socket.off('submit_chase_answer_error')
    }
  }, [isAutoStarting])

  return (
    <div className="min-h-screen bg-slate-900">
      {room ? (
        renderGameView(room, error, clearError, handleReset, isAutoStarting)
      ) : (
        <StartPage
          error={error}
          clearError={clearError}
          onStart={() => setIsAutoStarting(true)}
        />
      )}
    </div>
  )
}

export default App
