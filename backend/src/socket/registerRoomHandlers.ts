import type { Server, Socket } from 'socket.io'
import type { CreateRoomPayload, JoinRoomPayload } from '../types/socket.js'
import * as roomService from '../game/roomService.js'
import * as roomStore from '../game/roomStore.js'
import * as timerService from '../game/timerService.js'
import * as chaseDuelTimer from '../game/chaseDuelTimer.js'

export function registerRoomHandlers(io: Server): void {
  io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id)

    socket.on('create_room', (payload: CreateRoomPayload) => {
      const nickname = payload?.nickname?.trim()
      if (!nickname) {
        socket.emit('create_room_error', { message: 'Nickname cannot be empty' })
        return
      }

      const existingRoom = roomStore.getRoomBySocketId(socket.id)
      if (existingRoom) {
        socket.emit('create_room_error', {
          message: 'You are already in a room. Leave first to create a new one.',
        })
        return
      }

      const room = roomService.createRoom(nickname, socket.id)
      socket.join(room.code)

      const roomState = roomService.serializeRoom(room)
      socket.emit('room_created', { room: roomState })
      socket.to(room.code).emit('room_state', { room: roomState })
    })

    socket.on('join_room', (payload: JoinRoomPayload) => {
      const nickname = payload?.nickname?.trim()
      const roomCode = payload?.roomCode?.trim()

      if (!nickname) {
        socket.emit('join_room_error', { message: 'Nickname cannot be empty' })
        return
      }

      if (!roomCode) {
        socket.emit('join_room_error', { message: 'Room code is required' })
        return
      }

      const existingRoom = roomStore.getRoomBySocketId(socket.id)
      if (existingRoom) {
        socket.emit('join_room_error', {
          message: 'You are already in a room. Leave first to join another.',
        })
        return
      }

      const result = roomService.joinRoom(nickname, roomCode, socket.id)

      if (!result.success) {
        socket.emit('join_room_error', { message: result.error })
        return
      }

      socket.join(result.room.code)
      const roomState = roomService.serializeRoom(result.room)
      socket.emit('room_joined', { room: roomState })
      socket.to(result.room.code).emit('room_state', { room: roomState })
    })

    socket.on('leave_room', () => {
      const room = roomStore.getRoomBySocketId(socket.id)
      if (!room) {
        socket.emit('leave_room_error', { message: 'You are not in a room' })
        return
      }

      const roomCode = room.code
      const updatedRoom = roomService.leaveRoom(socket.id)
      socket.leave(roomCode)

      if (updatedRoom) {
        const roomState = roomService.serializeRoom(updatedRoom)
        socket.to(roomCode).emit('room_state', { room: roomState })
      } else {
        timerService.stopCashBuilderTimer(roomCode)
        chaseDuelTimer.clearAll(roomCode)
      }
      socket.emit('left_room')
    })

    socket.on('get_room_state', () => {
      const room = roomStore.getRoomBySocketId(socket.id)
      if (!room) {
        socket.emit('get_room_state_error', { message: 'You are not in a room' })
        return
      }

      const roomState = roomService.serializeRoom(room)
      socket.emit('room_state', { room: roomState })
    })

    socket.on('start_game', () => {
      const result = roomService.startGame(socket.id)
      if (!result.success) {
        socket.emit('start_game_error', { message: result.error })
        return
      }

      const roomState = roomService.serializeRoom(result.room)
      io.to(result.room.code).emit('room_state', { room: roomState })
      timerService.startCashBuilderTimer(result.room.code, io)
    })

    socket.on('disconnect', () => {
      const room = roomStore.getRoomBySocketId(socket.id)
      if (room) {
        const roomCode = room.code
        const updatedRoom = roomService.leaveRoom(socket.id)
        if (updatedRoom) {
          const roomState = roomService.serializeRoom(updatedRoom)
          io.to(roomCode).emit('room_state', { room: roomState })
        } else {
          timerService.stopCashBuilderTimer(roomCode)
          chaseDuelTimer.clearAll(roomCode)
        }
      }
      console.log('Client disconnected:', socket.id)
    })
  })
}
