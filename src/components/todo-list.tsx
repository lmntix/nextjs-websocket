"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { Todo } from "@/lib/db/schema"
import { TodoItem } from "./todo-item"

interface TodoListProps {
  todos: Todo[]
  onUpdate: (
    id: number,
    data: { title?: string; description?: string; completed?: boolean }
  ) => void
  onDelete: (id: number) => void
  isLoading?: boolean
}

export function TodoList({
  todos,
  onUpdate,
  onDelete,
  isLoading = false
}: TodoListProps) {
  const completedCount = todos.filter((todo) => todo.completed).length
  const totalCount = todos.length

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-5 w-20" />
            </div>
          </CardHeader>
        </Card>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Skeleton className="mt-1 h-4 w-4" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (todos.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">
            No todos yet. Add one above to get started!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Your Todos</CardTitle>
            <Badge variant="secondary">
              {completedCount} of {totalCount} completed
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="space-y-3">
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  )
}
