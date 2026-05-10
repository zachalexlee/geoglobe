// ── Server-Sent Events (SSE) pub/sub for Versus matches ─────────────────────
//
// In-memory event bus for notifying connected SSE clients about match events.
// This works on a single Railway instance. For multi-instance deployments,
// replace with Redis pub/sub.

export interface MatchEvent {
  type: 'match-ready' | 'opponent-scored' | 'match-complete'
  [key: string]: unknown
}

type Listener = (event: MatchEvent) => void

// Map of matchId → Set of listener callbacks
const listeners = new Map<string, Set<Listener>>()

/**
 * Subscribe to events for a specific match.
 * Returns an unsubscribe function.
 */
export function subscribeToMatch(matchId: string, listener: Listener): () => void {
  if (!listeners.has(matchId)) {
    listeners.set(matchId, new Set())
  }
  listeners.get(matchId)!.add(listener)

  return () => {
    const set = listeners.get(matchId)
    if (set) {
      set.delete(listener)
      if (set.size === 0) {
        listeners.delete(matchId)
      }
    }
  }
}

/**
 * Emit an event to all subscribers of a match.
 */
export function emitMatchEvent(matchId: string, event: MatchEvent): void {
  const set = listeners.get(matchId)
  if (set) {
    set.forEach((listener) => {
      try {
        listener(event)
      } catch {
        // Don't let one broken listener kill others
      }
    })
  }
}

/**
 * Get the count of active listeners for a match (useful for debugging).
 */
export function getListenerCount(matchId: string): number {
  return listeners.get(matchId)?.size ?? 0
}
