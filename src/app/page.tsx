"use client"

import { useEffect, useState } from "react"
import { AddTodoForm } from "@/components/add-todo-form"
import { ConnectionStatus } from "@/components/connection-status"
import { TodoList } from "@/components/todo-list"
import { useToast } from "@/hooks/use-toast"
import type { Todo } from "@/lib/db/schema"
import { useSocket } from "@/lib/hooks/use-socket"

export default function HomePage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [isLoadingTodos, setIsLoadingTodos] = useState(true)
  const { socket, isConnected, isLoading, error, reconnect } = useSocket()
  const { toast } = useToast()

  useEffect(() => {
    if (!socket) return

    // Request initial todos when connected
    if (isConnected) {
      socket.emit("getTodos")
    }

    // Listen for todo events
    socket.on("todosLoaded", (loadedTodos) => {
      setTodos(loadedTodos)
      setIsLoadingTodos(false)
    })

    socket.on("todoAdded", (newTodo) => {
      setTodos((prev) => [...prev, newTodo])
      toast({
        title: "Todo added",
        description: `"${newTodo.title}" has been added to your list.`
      })
    })

    socket.on("todoUpdated", (updatedTodo) => {
      setTodos((prev) =>
        prev.map((todo) => (todo.id === updatedTodo.id ? updatedTodo : todo))
      )
      toast({
        title: "Todo updated",
        description: `"${updatedTodo.title}" has been updated.`
      })
    })

    socket.on("todoDeleted", (deletedId) => {
      setTodos((prev) => {
        const deletedTodo = prev.find((todo) => todo.id === deletedId)
        if (deletedTodo) {
          toast({
            title: "Todo deleted",
            description: `"${deletedTodo.title}" has been removed from your list.`
          })
        }
        return prev.filter((todo) => todo.id !== deletedId)
      })
    })

    return () => {
      socket.off("todosLoaded")
      socket.off("todoAdded")
      socket.off("todoUpdated")
      socket.off("todoDeleted")
    }
  }, [socket, isConnected, toast])

  // Reset loading state when connection is lost
  useEffect(() => {
    if (!isConnected && !isLoading) {
      setIsLoadingTodos(true)
    }
  }, [isConnected, isLoading])

  const handleAddTodo = (data: { title: string; description?: string }) => {
    if (socket && isConnected) {
      socket.emit("addTodo", data)
    } else {
      toast({
        title: "Connection error",
        description: "Unable to add todo. Please check your connection.",
        variant: "destructive"
      })
    }
  }

  const handleUpdateTodo = (
    id: number,
    data: { title?: string; description?: string; completed?: boolean }
  ) => {
    if (socket && isConnected) {
      // Optimistic update
      setTodos((prev) =>
        prev.map((todo) => (todo.id === id ? { ...todo, ...data } : todo))
      )
      socket.emit("updateTodo", { id, ...data })
    } else {
      toast({
        title: "Connection error",
        description: "Unable to update todo. Please check your connection.",
        variant: "destructive"
      })
    }
  }

  const handleDeleteTodo = (id: number) => {
    if (socket && isConnected) {
      socket.emit("deleteTodo", id)
    } else {
      toast({
        title: "Connection error",
        description: "Unable to delete todo. Please check your connection.",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-2 text-center">
            <h1 className="font-bold text-3xl tracking-tight">
              Real-time Todos
            </h1>
            <p className="text-muted-foreground">
              Manage your tasks with live updates across all devices
            </p>
            <ConnectionStatus
              isConnected={isConnected}
              isLoading={isLoading}
              error={error}
              onReconnect={reconnect}
            />
          </div>

          {/* Add Todo Form */}
          <AddTodoForm onAdd={handleAddTodo} />

          {/* Todo List */}
          <TodoList
            todos={todos}
            onUpdate={handleUpdateTodo}
            onDelete={handleDeleteTodo}
            isLoading={isLoadingTodos && isLoading}
          />
        </div>
      </div>
    </div>
  )
}
