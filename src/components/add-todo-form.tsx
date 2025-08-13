"use client"

import { Plus } from "lucide-react"
import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface AddTodoFormProps {
  onAdd: (data: { title: string; description?: string }) => void
}

export function AddTodoForm({ onAdd }: AddTodoFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isExpanded, setIsExpanded] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    onAdd({
      title: title.trim(),
      description: description.trim() || undefined
    })

    setTitle("")
    setDescription("")
    setIsExpanded(false)
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Add New Todo</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            onFocus={() => setIsExpanded(true)}
            className="font-medium"
          />

          {isExpanded && (
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description (optional)"
              rows={2}
            />
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={!title.trim()} className="flex-1">
              <Plus className="mr-2 h-4 w-4" />
              Add Todo
            </Button>
            {isExpanded && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsExpanded(false)
                  setDescription("")
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
