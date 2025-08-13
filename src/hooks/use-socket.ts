"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { io, type Socket } from "socket.io-client"
import type {
  ClientToServerEvents,
  ServerToClientEvents
} from "@/lib/types/socket"

type SocketInstance = Socket<ServerToClientEvents, ClientToServerEvents>

interface UseSocketReturn {
  socket: SocketInstance | null
  isConnected: boolean
  isLoading: boolean
  error: string | null
  reconnect: () => void
}

export function useSocket(): UseSocketReturn {
  const [socket, setSocket] = useState<SocketInstance | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 5

  const initializeSocket = useCallback(() => {
    setIsLoading(true)
    setError(null)

    const socketPort = process.env.NEXT_PUBLIC_SOCKET_PORT || "3001"
    const socketUrl = `http://localhost:${socketPort}`

    console.log("🔍 Socket connection details:")
    console.log("NEXT_PUBLIC_SOCKET_PORT:", process.env.NEXT_PUBLIC_SOCKET_PORT)
    console.log("Socket URL:", socketUrl)

    const socketInstance: SocketInstance = io(socketUrl, {
      transports: ["websocket"],
      upgrade: false,
      timeout: 10000,
      forceNew: true,
      autoConnect: true
    })

    socketInstance.on("connect", () => {
      console.log("✅ Connected to Socket.io server")
      setIsConnected(true)
      setIsLoading(false)
      setError(null)
      reconnectAttemptsRef.current = 0
    })

    socketInstance.on("disconnect", (reason) => {
      console.log("❌ Disconnected from server:", reason)
      setIsConnected(false)
      setIsLoading(false)

      // Only show error for unexpected disconnections
      if (reason === "io server disconnect") {
        setError("Server disconnected unexpectedly")
      }
    })

    socketInstance.on("connect_error", (err) => {
      console.error("❌ Connection error:", err)
      console.error("Trying to connect to:", socketUrl)
      setIsConnected(false)
      setIsLoading(false)
      setError(`Failed to connect to ${socketUrl}`)

      // Implement exponential backoff for reconnection
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        const delay = Math.min(1000 * 2 ** reconnectAttemptsRef.current, 30000)
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current++
          console.log(
            `🔄 Reconnection attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts}`
          )
          socketInstance.connect()
        }, delay)
      } else {
        setError("Unable to connect after multiple attempts")
      }
    })

    setSocket(socketInstance)

    return socketInstance
  }, [])

  const reconnect = useCallback(() => {
    if (socket) {
      socket.disconnect()
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    reconnectAttemptsRef.current = 0
    initializeSocket()
  }, [socket, initializeSocket])

  useEffect(() => {
    const socketInstance = initializeSocket()

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      socketInstance.disconnect()
    }
  }, [initializeSocket])

  return { socket, isConnected, isLoading, error, reconnect }
}
