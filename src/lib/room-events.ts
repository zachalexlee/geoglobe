// ── Server-Sent Events (SSE) pub/sub for Multiplayer Rooms ───────────────────
//
// In-memory event bus for notifying connected SSE clients about room events.

export interface RoomEvent {
  type: 'player-joined' | 'game-started' | 'score-updated' | 'game-finished'
  [key: string]: unknown
}

type Listener = (event: RoomEvent) => void

// Map of roomCode → Set of listener callbacks
const listeners = new Map<string, Set<Listener>>()

/**
 * Subscribe to events for a specific room.
 * Returns an unsubscribe function.
 */
export function subscribeToRoom(roomCode: string, listener: Listener): () => void {
  if (!listeners.has(roomCode)) {
    listeners.set(roomCode, new Set())
  }
  listeners.get(roomCode)!.add(listener)

  return () => {
    const set = listeners.get(roomCode)
    if (set) {
      set.delete(listener)
      if (set.size === 0) {
        listeners.delete(roomCode)
      }
    }
  }
}

/**
 * Emit an event to all subscribers of a room.
 */
export function emitRoomEvent(roomCode: string, event: RoomEvent): void {
  const set = listeners.get(roomCode)
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
