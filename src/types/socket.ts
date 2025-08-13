import type { Todo } from "@/lib/db/schema"

export interface ServerToClientEvents {
  todoAdded: (todo: Todo) => void
  todoUpdated: (todo: Todo) => void
  todoDeleted: (todoId: number) => void
  todosLoaded: (todos: Todo[]) => void
}

export interface ClientToServerEvents {
  getTodos: () => void
  addTodo: (data: { title: string; description?: string }) => void
  updateTodo: (data: {
    id: number
    title?: string
    description?: string
    completed?: boolean
  }) => void
  deleteTodo: (todoId: number) => void
}

export type InterServerEvents = {}

export type SocketData = {}
