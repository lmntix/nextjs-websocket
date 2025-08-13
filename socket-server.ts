import dotenv from "dotenv"

dotenv.config({ path: ".env" })

import { createServer } from "node:http"
import { Server } from "socket.io"
import { db } from "./src/lib/db"
import { DatabaseListener } from "./src/lib/db/listener"
import { todos } from "./src/lib/db/schema"
import type {
  ClientToServerEvents,
  ServerToClientEvents
} from "./src/lib/types/socket"

console.log("🔍 Available environment variables:")
console.log(
  "DATABASE_URL:",
  process.env.DATABASE_URL ? "✅ Found" : "❌ Missing"
)
console.log(
  "POSTGRES_URL:",
  process.env.POSTGRES_URL ? "✅ Found" : "❌ Missing"
)
console.log("NODE_ENV:", process.env.NODE_ENV)

const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL

if (!databaseUrl) {
  console.error(
    "❌ No database URL found. Checked DATABASE_URL and POSTGRES_URL"
  )
  console.error(
    "Available env vars:",
    Object.keys(process.env).filter(
      (key) => key.includes("DATABASE") || key.includes("POSTGRES")
    )
  )
  process.exit(1)
}

console.log("✅ Database URL found:")

async function testDatabaseConnection() {
  try {
    await db.select().from(todos).limit(1)
    console.log("✅ Database connected successfully")
    return true
  } catch (error) {
    console.error("❌ Database connection failed:", error)
    return false
  }
}

const httpServer = createServer()
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.NEXT_PUBLIC_APP_URL
        : "http://localhost:3000",
    methods: ["GET", "POST"]
  }
})

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id)

  socket.on("getTodos", async () => {
    try {
      const allTodos = await db.select().from(todos).orderBy(todos.createdAt)
      socket.emit("todosLoaded", allTodos)
    } catch (error) {
      console.error("Error fetching todos:", error)
    }
  })

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id)
  })
})

const PORT = process.env.SOCKET_PORT || 3001

testDatabaseConnection().then((connected) => {
  if (!connected) {
    console.error("❌ Cannot start server without database connection")
    process.exit(1)
  }

  httpServer.listen(PORT, () => {
    console.log(`✅ Socket.io server running on port ${PORT}`)

    const dbListener = new DatabaseListener()

    // Set the Socket.io server for broadcasting
    dbListener.setSocketServer(io)

    // Start listening for database changes
    dbListener.startListening().catch(console.error)

    // Graceful shutdown
    process.on("SIGTERM", () => {
      console.log("Shutting down Socket.io server...")
      dbListener.stopListening()
      httpServer.close()
    })
  })
})
