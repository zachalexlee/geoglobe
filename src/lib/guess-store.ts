/**
 * Server-side in-memory store for validated guesses.
 *
 * Each guess is stored after the /api/guess endpoint computes the distance
 * and score server-side. The /api/scores endpoint reads from this store
 * to compute the final total score, ensuring clients cannot fabricate scores.
 *
 * In production, consider replacing with Redis or a DB table for persistence
 * across server restarts and multi-instance deployments.
 */

export interface StoredGuess {
  round: number
  guessLat: number
  guessLng: number
  actualLat: number
  actualLng: number
  distance: number
  score: number
  timestamp: number
}

// Key format: `${userId}:${puzzleId}`
const guessStore = new Map<string, StoredGuess[]>()

// Auto-cleanup: remove entries older than 24 hours every hour
const EXPIRY_MS = 24 * 60 * 60 * 1000

function cleanupExpiredEntries() {
  const now = Date.now()
  for (const [key, guesses] of guessStore.entries()) {
    if (guesses.length > 0 && now - guesses[0].timestamp > EXPIRY_MS) {
      guessStore.delete(key)
    }
  }
}

// Run cleanup periodically (only on server)
if (typeof globalThis !== 'undefined') {
  const globalForStore = globalThis as unknown as { _guessStoreCleanup?: ReturnType<typeof setInterval> }
  if (!globalForStore._guessStoreCleanup) {
    globalForStore._guessStoreCleanup = setInterval(cleanupExpiredEntries, 60 * 60 * 1000)
  }
}

function makeKey(userId: string, puzzleId: string): string {
  return `${userId}:${puzzleId}`
}

export function storeGuess(userId: string, puzzleId: string, guess: StoredGuess): void {
  const key = makeKey(userId, puzzleId)
  const existing = guessStore.get(key) ?? []

  // Prevent duplicate round submissions
  const alreadyHasRound = existing.some((g) => g.round === guess.round)
  if (alreadyHasRound) return

  existing.push(guess)
  guessStore.set(key, existing)
}

export function getGuesses(userId: string, puzzleId: string): StoredGuess[] {
  return guessStore.get(makeKey(userId, puzzleId)) ?? []
}

export function hasGuessForRound(userId: string, puzzleId: string, round: number): boolean {
  const guesses = getGuesses(userId, puzzleId)
  return guesses.some((g) => g.round === round)
}

export function clearGuesses(userId: string, puzzleId: string): void {
  guessStore.delete(makeKey(userId, puzzleId))
}
