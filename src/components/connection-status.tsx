"use client"

import { AlertCircle, Loader2, Wifi, WifiOff } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface ConnectionStatusProps {
  isConnected: boolean
  isLoading: boolean
  error: string | null
  onReconnect: () => void
}

export function ConnectionStatus({
  isConnected,
  isLoading,
  error,
  onReconnect
}: ConnectionStatusProps) {
  if (isLoading) {
    return (
      <Badge variant="secondary" className="gap-1">
        <Loader2 className="h-3 w-3 animate-spin" />
        Connecting...
      </Badge>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </Badge>
        <Button size="sm" variant="outline" onClick={onReconnect}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <Badge variant={isConnected ? "default" : "destructive"} className="gap-1">
      {isConnected ? (
        <>
          <Wifi className="h-3 w-3" />
          Connected
        </>
      ) : (
        <>
          <WifiOff className="h-3 w-3" />
          Disconnected
        </>
      )}
    </Badge>
  )
}
