// ── Haversine distance formula ────────────────────────────────────────────────
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371 // Earth radius km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// Score: 100 for within 50 km, 0 for 5000 km+, linear between
export function calculateScore(distanceKm: number): number {
  if (distanceKm <= 50) return 100
  if (distanceKm >= 5000) return 0
  return Math.max(0, Math.round(100 - ((distanceKm - 50) / 4950) * 100))
}

// Color feedback (Globle-style heat)
export function proximityColor(distanceKm: number): string {
  if (distanceKm <= 100) return '#22c55e'  // green
  if (distanceKm <= 500) return '#84cc16'  // lime
  if (distanceKm <= 1500) return '#eab308' // yellow
  if (distanceKm <= 3000) return '#f97316' // orange
  return '#ef4444'                          // red
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type GameLocation = {
  id: string
  order: number
  latitude: number
  longitude: number
  name: string
  country: string
  description: string
  imageUrl?: string | null
  category?: string | null
}

export type RoundResult = {
  location: GameLocation
  guess: { lat: number; lng: number }
  distanceKm: number
  score: number
  color: string
}

export type GamePhase = 'playing' | 'round-result' | 'final-result'

export type GameState = {
  puzzleId: string
  puzzleNumber: number
  date: string
  locations: GameLocation[]
  currentRound: number       // 0-4
  phase: GamePhase
  pendingGuess: { lat: number; lng: number } | null
  confirmedGuess: { lat: number; lng: number } | null
  roundResults: RoundResult[]
  totalScore: number
}
