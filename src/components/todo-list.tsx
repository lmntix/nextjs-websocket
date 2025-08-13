"use client"

import { CheckCircle2, Circle, Edit2, Trash2 } from "lucide-react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import type { Todo } from "@/lib/db/schema"

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
  todos = [],
  onUpdate,
  onDelete,
  isLoading = false
}: TodoListProps) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")

  const completedCount = todos.filter((todo) => todo.completed).length
  const totalCount = todos.length
  const progressPercentage =
    totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  const handleEdit = (todo: Todo) => {
    setEditingId(todo.id)
    setEditTitle(todo.title)
    setEditDescription(todo.description || "")
  }

  const handleSave = (id: number) => {
    onUpdate(id, { title: editTitle, description: editDescription })
    setEditingId(null)
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditTitle("")
    setEditDescription("")
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-lg border bg-card p-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="h-2 w-20" />
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>Task</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-4" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-48" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  if (todos.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <Circle className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground text-sm">
          No todos yet. Add one above to get started!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-lg border bg-card p-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span className="font-medium text-sm">Your Todos</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {completedCount}/{totalCount}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Progress value={progressPercentage} className="h-2 w-20" />
          <span className="font-medium text-muted-foreground text-xs">
            {Math.round(progressPercentage)}%
          </span>
        </div>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-8" />
              <TableHead className="font-medium">Task</TableHead>
              <TableHead className="font-medium">Description</TableHead>
              <TableHead className="w-20 text-center font-medium">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {todos.map((todo) => (
              <TableRow key={todo.id} className="group">
                <TableCell className="p-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() =>
                      onUpdate(todo.id, { completed: !todo.completed })
                    }
                  >
                    {todo.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </TableCell>
                <TableCell className="p-2">
                  {editingId === todo.id ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full border-none bg-transparent p-0 text-sm outline-none focus:ring-0"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSave(todo.id)
                        if (e.key === "Escape") handleCancel()
                      }}
                    />
                  ) : (
                    <span
                      className={`text-sm ${todo.completed ? "text-muted-foreground line-through" : ""}`}
                    >
                      {todo.title}
                    </span>
                  )}
                </TableCell>
                <TableCell className="p-2">
                  {editingId === todo.id ? (
                    <input
                      type="text"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full border-none bg-transparent p-0 text-muted-foreground text-sm outline-none focus:ring-0"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSave(todo.id)
                        if (e.key === "Escape") handleCancel()
                      }}
                      placeholder="Add description..."
                    />
                  ) : (
                    <span className="text-muted-foreground text-sm">
                      {todo.description || ""}
                    </span>
                  )}
                </TableCell>
                <TableCell className="p-2">
                  <div className="flex items-center justify-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    {editingId === todo.id ? (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-primary hover:text-primary"
                          onClick={() => handleSave(todo.id)}
                        >
                          <CheckCircle2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                          onClick={handleCancel}
                        >
                          <Circle className="h-3 w-3" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                          onClick={() => handleEdit(todo)}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => onDelete(todo.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
