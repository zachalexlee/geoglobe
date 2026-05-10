import { haversineDistance, calculateScore } from './game-engine'

export interface ScoreSubmission {
  puzzleId: string
  totalScore: number
  distances: number[]
  roundScores: number[]
  timeTaken?: number
}

export interface GuessValidation {
  puzzleId: string
  round: number
  guessLat: number
  guessLng: number
  actualLat: number
  actualLng: number
  claimedDistance: number
}

export interface ValidationResult {
  valid: boolean
  reason?: string
}

/**
 * Validate a single guess by recomputing the haversine distance server-side
 * and comparing it to the claimed distance.
 */
export function validateGuessDistance(validation: GuessValidation): ValidationResult {
  const { guessLat, guessLng, actualLat, actualLng, claimedDistance } = validation

  // Validate coordinate ranges
  if (guessLat < -90 || guessLat > 90 || guessLng < -180 || guessLng > 180) {
    return { valid: false, reason: 'Guess coordinates out of range' }
  }
  if (actualLat < -90 || actualLat > 90 || actualLng < -180 || actualLng > 180) {
    return { valid: false, reason: 'Location coordinates out of range' }
  }

  // Server-side distance calculation
  const serverDistance = haversineDistance(guessLat, guessLng, actualLat, actualLng)

  // Allow small floating-point tolerance (0.1 km)
  const tolerance = 0.1
  if (Math.abs(serverDistance - claimedDistance) > tolerance) {
    return {
      valid: false,
      reason: `Distance mismatch: server=${serverDistance.toFixed(2)}km, claimed=${claimedDistance.toFixed(2)}km`,
    }
  }

  return { valid: true }
}

/**
 * Validate that stored server-side guesses produce the claimed total score.
 * This is the authoritative validation — scores are computed from server-stored guesses,
 * NOT from client-submitted values.
 */
export function computeTotalFromGuesses(
  guesses: { distance: number; score: number }[]
): { totalScore: number; distances: number[]; roundScores: number[] } {
  const distances = guesses.map((g) => g.distance)
  const roundScores = guesses.map((g) => g.score)
  const totalScore = roundScores.reduce((a, b) => a + b, 0)
  return { totalScore, distances, roundScores }
}

/**
 * Validate that the submitted scores are consistent with the distances
 * using the canonical server-side scoring formula.
 *
 * Scoring formula:
 *   dist <= 50 km  → 1000 pts
 *   dist >= 5000 km → 0 pts
 *   otherwise      → Math.max(0, Math.round(1000 - ((dist - 50) / 4950) * 1000))
 */
export function validateScoreSubmission(submission: ScoreSubmission): ValidationResult {
  if (submission.distances.length !== 5 || submission.roundScores.length !== 5) {
    return { valid: false, reason: 'Must have exactly 5 distances and scores' }
  }

  // Verify each round score matches the distance
  for (let i = 0; i < 5; i++) {
    const dist = submission.distances[i]
    const score = submission.roundScores[i]

    if (dist < 0 || dist > 20040) {
      return { valid: false, reason: `Invalid distance at round ${i + 1}` }
    }

    const expectedScore = calculateScore(dist)

    // Allow ±2 points tolerance for floating-point rounding differences
    const tolerance = 2
    if (Math.abs(score - expectedScore) > tolerance) {
      return {
        valid: false,
        reason: `Score mismatch at round ${i + 1}: got ${score}, expected ~${expectedScore}`,
      }
    }
  }

  // Check total score adds up correctly
  const computedTotal = submission.roundScores.reduce((a, b) => a + b, 0)
  if (Math.abs(computedTotal - submission.totalScore) > 5) {
    return { valid: false, reason: 'Total score does not match round scores' }
  }

  // Reject impossibly fast completions (< 30 seconds for 5 rounds)
  if (submission.timeTaken !== undefined && submission.timeTaken < 30) {
    return { valid: false, reason: 'Completion time too fast' }
  }

  return { valid: true }
}
