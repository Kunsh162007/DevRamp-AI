import axios from 'axios'
import { io, Socket } from 'socket.io-client'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// WebSocket connection
let socket: Socket | null = null

export function connectWebSocket(userId: string) {
  if (socket?.connected) return socket

  socket = io(API_URL, {
    auth: { token: localStorage.getItem('token') },
    transports: ['websocket', 'polling'],
  })

  socket.on('connect', () => {
    console.log('✅ WebSocket connected')
    socket?.emit('join-user', userId)
  })

  socket.on('disconnect', () => {
    console.log('❌ WebSocket disconnected')
  })

  socket.on('connect_error', (error: Error) => {
    console.error('WebSocket connection error:', error)
  })

  return socket
}

export function getSocket() {
  return socket
}

export function disconnectWebSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export default api

// Made with Bob
