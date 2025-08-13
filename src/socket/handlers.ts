import { eq } from "drizzle-orm"
import type { Server as ServerIO } from "socket.io"
import { db, type Todo, todos } from "@/lib/db"
import type {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData
} from "@/lib/types/socket"

export function setupSocketHandlers(
  io: ServerIO<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >
) {
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id)

    // Handle getting all todos
    socket.on("getTodos", async () => {
      try {
        const allTodos = await db.select().from(todos).orderBy(todos.createdAt)
        socket.emit("todosLoaded", allTodos)
      } catch (error) {
        console.error("Error fetching todos:", error)
      }
    })

    // Handle adding a new todo
    socket.on("addTodo", async (data) => {
      try {
        await db.insert(todos).values({
          title: data.title,
          description: data.description
        })
        // Note: Database trigger will automatically broadcast the new todo
      } catch (error) {
        console.error("Error adding todo:", error)
      }
    })

    // Handle updating a todo
    socket.on("updateTodo", async (data) => {
      try {
        const updateData: Partial<Todo> = {}
        if (data.title !== undefined) updateData.title = data.title
        if (data.description !== undefined)
          updateData.description = data.description
        if (data.completed !== undefined) updateData.completed = data.completed

        await db
          .update(todos)
          .set({ ...updateData, updatedAt: new Date() })
          .where(eq(todos.id, data.id))
        // Note: Database trigger will automatically broadcast the updated todo
      } catch (error) {
        console.error("Error updating todo:", error)
      }
    })

    // Handle deleting a todo
    socket.on("deleteTodo", async (todoId) => {
      try {
        await db.delete(todos).where(eq(todos.id, todoId))
        // Note: Database trigger will automatically broadcast the deletion
      } catch (error) {
        console.error("Error deleting todo:", error)
      }
    })

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id)
    })
  })
}
