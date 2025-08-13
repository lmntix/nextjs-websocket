import type { Server as NetServer } from "http"
import { Server as ServerIO } from "socket.io"
import { getDatabaseListener } from "@/lib/db/listener"
import type {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData
} from "@/lib/types/socket"

export function initializeSocket(server: NetServer) {
  console.log("Initializing Socket.io server...")

  const io = new ServerIO<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(server, {
    path: "/api/socket", // Updated path to match the new API route structure
    addTrailingSlash: false,
    cors: {
      origin:
        process.env.NODE_ENV === "production"
          ? false
          : ["http://localhost:3000"],
      methods: ["GET", "POST"]
    }
  })

  const dbListener = getDatabaseListener()
  dbListener.setSocketServer(io)

  // Start listening to database changes
  dbListener.startListening().catch((error) => {
    console.error("Failed to start database listener:", error)
  })

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id)

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id)
    })
  })

  process.on("SIGTERM", async () => {
    console.log("SIGTERM received, shutting down gracefully")
    await dbListener.stopListening()
    process.exit(0)
  })

  process.on("SIGINT", async () => {
    console.log("SIGINT received, shutting down gracefully")
    await dbListener.stopListening()
    process.exit(0)
  })

  return io
}
