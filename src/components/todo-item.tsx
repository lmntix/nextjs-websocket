"use client"

import { Check, Edit3, Trash2, X } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { Todo } from "@/lib/db/schema"

interface TodoItemProps {
  todo: Todo
  onUpdate: (
    id: number,
    data: { title?: string; description?: string; completed?: boolean }
  ) => void
  onDelete: (id: number) => void
}

export function TodoItem({ todo, onUpdate, onDelete }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(todo.title)
  const [editDescription, setEditDescription] = useState(todo.description || "")

  const handleSave = () => {
    onUpdate(todo.id, {
      title: editTitle,
      description: editDescription || undefined
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditTitle(todo.title)
    setEditDescription(todo.description || "")
    setIsEditing(false)
  }

  const handleToggleComplete = () => {
    onUpdate(todo.id, { completed: !todo.completed })
  }

  return (
    <Card
      className={`transition-all duration-200 ${todo.completed ? "opacity-60" : ""}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={todo.completed}
            onCheckedChange={handleToggleComplete}
            className="mt-1"
          />

          <div className="min-w-0 flex-1">
            {isEditing ? (
              <div className="space-y-3">
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Todo title"
                  className="font-medium"
                />
                <Textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Description (optional)"
                  rows={2}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSave}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancel}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <h3
                  className={`font-medium leading-tight ${todo.completed ? "text-muted-foreground line-through" : ""}`}
                >
                  {todo.title}
                </h3>
                {todo.description && (
                  <p
                    className={`text-muted-foreground text-sm ${todo.completed ? "line-through" : ""}`}
                  >
                    {todo.description}
                  </p>
                )}
                <p className="text-muted-foreground text-xs">
                  Created {new Date(todo.createdAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          {!isEditing && (
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(true)}
                className="h-8 w-8 p-0"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(todo.id)}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
