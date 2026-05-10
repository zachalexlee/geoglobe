'use client'

import { useEffect, useRef, useCallback } from 'react'

export interface VersusEvent {
  type: 'match-ready' | 'opponent-scored' | 'match-complete'
  [key: string]: unknown
}

interface UseVersusEventsOptions {
  matchId: string | null
  onMatchReady?: () => void
  onOpponentScored?: (playerId: string) => void
  onMatchComplete?: (winnerId: string | null, eloChange: number | null) => void
  enabled?: boolean
}

/**
 * Hook that connects to the SSE endpoint for real-time Versus match events.
 * Falls back to polling if SSE connection fails.
 */
export function useVersusEvents({
  matchId,
  onMatchReady,
  onOpponentScored,
  onMatchComplete,
  enabled = true,
}: UseVersusEventsOptions) {
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5

  const cleanup = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!matchId || !enabled) {
      cleanup()
      return
    }

    function connect() {
      // Close any existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }

      const es = new EventSource(`/api/versus/${matchId}/events`)
      eventSourceRef.current = es

      es.addEventListener('connected', () => {
        // Reset reconnect counter on successful connection
        reconnectAttempts.current = 0
      })

      es.addEventListener('match-ready', (_e) => {
        onMatchReady?.()
      })

      es.addEventListener('opponent-scored', (e) => {
        try {
          const data = JSON.parse(e.data)
          onOpponentScored?.(data.playerId)
        } catch {
          // ignore parse errors
        }
      })

      es.addEventListener('match-complete', (e) => {
        try {
          const data = JSON.parse(e.data)
          onMatchComplete?.(data.winnerId ?? null, data.eloChange ?? null)
        } catch {
          // ignore parse errors
        }
      })

      es.onerror = () => {
        es.close()
        eventSourceRef.current = null

        // Reconnect with exponential backoff
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000)
          reconnectAttempts.current++
          reconnectTimeoutRef.current = setTimeout(connect, delay)
        }
        // After max attempts, the component can fall back to polling
      }
    }

    connect()

    return cleanup
  }, [matchId, enabled, onMatchReady, onOpponentScored, onMatchComplete, cleanup])

  return {
    disconnect: cleanup,
  }
}
