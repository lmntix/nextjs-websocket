import postgres from "postgres"
import type { Server as ServerIO } from "socket.io"
import type { Todo } from "@/lib/db/schema"
import type {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData
} from "@/lib/types/socket"

interface DatabaseNotification {
  operation: "INSERT" | "UPDATE" | "DELETE"
  record: Todo
}

export class DatabaseListener {
  private sql: postgres.Sql
  private io: ServerIO<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  > | null = null
  private isListening = false

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL2 environment variable is required")
    }

    // Create a separate connection for listening to notifications
    this.sql = postgres(process.env.DATABASE_URL, {
      max: 1, // Only need one connection for listening
      idle_timeout: 0, // Keep connection alive
      connect_timeout: 30
    })
  }

  setSocketServer(
    io: ServerIO<
      ClientToServerEvents,
      ServerToClientEvents,
      InterServerEvents,
      SocketData
    >
  ) {
    this.io = io
  }

  async startListening() {
    if (this.isListening) {
      console.log("Database listener already running")
      return
    }

    try {
      console.log("Starting database listener...")

      // Listen for todo_changes notifications
      await this.sql.listen("todo_changes", (payload) => {
        this.handleDatabaseNotification(payload)
      })

      this.isListening = true
      console.log("Database listener started successfully")
    } catch (error) {
      console.error("Failed to start database listener:", error)
      throw error
    }
  }

  private handleDatabaseNotification(payload: string) {
    if (!this.io) {
      console.warn("Socket.io server not available for broadcasting")
      return
    }

    try {
      const notification: DatabaseNotification = JSON.parse(payload)
      const { operation, record } = notification

      console.log(`Database notification: ${operation} on todo ${record.id}`)

      // Broadcast the change to all connected clients
      switch (operation) {
        case "INSERT":
          this.io.emit("todoAdded", record)
          break
        case "UPDATE":
          this.io.emit("todoUpdated", record)
          break
        case "DELETE":
          this.io.emit("todoDeleted", record.id)
          break
        default:
          console.warn(`Unknown database operation: ${operation}`)
      }
    } catch (error) {
      console.error("Error parsing database notification:", error)
    }
  }

  async stopListening() {
    if (!this.isListening) {
      return
    }

    try {
      await this.sql.unlisten("todo_changes")
      await this.sql.end()
      this.isListening = false
      console.log("Database listener stopped")
    } catch (error) {
      console.error("Error stopping database listener:", error)
    }
  }
}

// Singleton instance
let databaseListener: DatabaseListener | null = null

export function getDatabaseListener(): DatabaseListener {
  if (!databaseListener) {
    databaseListener = new DatabaseListener()
  }
  return databaseListener
}
