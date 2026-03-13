import { useState, useEffect } from 'react'
import HomePage from './pages/HomePage'
import Lobby from './components/Lobby'
import CashBuilderScreen from './components/CashBuilderScreen'
import OfferSelectionScreen from './components/OfferSelectionScreen'
import ChaseRoundScreen from './components/ChaseRoundScreen'
import RoundResultScreen from './components/RoundResultScreen'
import FinishedScreen from './components/FinishedScreen'
import { socket } from './socket'
import type { RoomState } from './types/room'

import './socket'

function renderRoomView(room: RoomState, error: string | null, onClearError: () => void) {
  switch (room.phase) {
    case 'lobby':
      return <Lobby room={room} error={error} onClearError={onClearError} />
    case 'cash_builder':
      return <CashBuilderScreen room={room} error={error} onClearError={onClearError} />
    case 'offer_selection':
      return <OfferSelectionScreen room={room} error={error} onClearError={onClearError} />
    case 'chase_round':
      return <ChaseRoundScreen room={room} />
    case 'round_result':
      return <RoundResultScreen />
    case 'finished':
      return <FinishedScreen />
    default:
      return <Lobby room={room} error={error} onClearError={onClearError} />
  }
}

function App() {
  const [room, setRoom] = useState<RoomState | null>(null)
  const [error, setError] = useState<string | null>(null)

  const clearError = () => setError(null)

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

    const handleStartGameError = (payload: { message: string }) => {
      setError(payload.message)
    }

    const handleSubmitAnswerError = (payload: { message: string }) => {
      setError(payload.message)
    }

    const handleSelectOfferError = (payload: { message: string }) => {
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
    socket.on('start_game_error', handleStartGameError)
    socket.on('submit_answer_error', handleSubmitAnswerError)
    socket.on('select_offer_error', handleSelectOfferError)

    return () => {
      socket.off('room_created', handleRoomCreated)
      socket.off('room_joined', handleRoomJoined)
      socket.off('room_state')
      socket.off('left_room', handleLeftRoom)
      socket.off('create_room_error', handleCreateRoomError)
      socket.off('join_room_error', handleJoinRoomError)
      socket.off('start_game_error', handleStartGameError)
      socket.off('submit_answer_error', handleSubmitAnswerError)
      socket.off('select_offer_error', handleSelectOfferError)
    }
  }, [room?.code])

  return (
    <div className="min-h-screen bg-slate-900">
      {room ? (
        renderRoomView(room, error, clearError)
      ) : (
        <HomePage error={error} clearError={clearError} />
      )}
    </div>
  )
}

export default App
