import { haversineDistance } from './game-engine'

// haversineDistance is imported so it can be used for server-side distance
// re-validation if coordinates are ever submitted alongside guesses.
// Currently the validation relies on the client-supplied distances, cross-checked
// against the deterministic scoring formula — see validateScoreSubmission below.
void haversineDistance // suppress "unused import" lint warnings

export interface ScoreSubmission {
  puzzleId: string
  totalScore: number
  distances: number[]
  roundScores: number[]
  timeTaken?: number
}

export interface ValidationResult {
  valid: boolean
  reason?: string
}

/**
 * Validate that the submitted scores match what would be calculated from the
 * distances using the canonical GeoGlobe scoring formula.
 *
 * Scoring formula (mirrors the client-side implementation):
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
      // 20,040 km is the maximum possible great-circle distance on Earth
      return { valid: false, reason: `Invalid distance at round ${i + 1}` }
    }

    // Canonical scoring formula – must be kept in sync with the client
    const expectedScore =
      dist <= 50
        ? 1000
        : dist >= 5000
          ? 0
          : Math.max(0, Math.round(1000 - ((dist - 50) / 4950) * 1000))

    // Allow ±5 points tolerance for floating-point rounding differences
    const tolerance = 5
    if (Math.abs(score - expectedScore) > tolerance) {
      return {
        valid: false,
        reason: `Score mismatch at round ${i + 1}: got ${score}, expected ~${expectedScore}`,
      }
    }
  }

  // Check total score adds up correctly
  const computedTotal = submission.roundScores.reduce((a, b) => a + b, 0)
  if (Math.abs(computedTotal - submission.totalScore) > 10) {
    return { valid: false, reason: 'Total score does not match round scores' }
  }

  // Reject impossibly fast completions (< 30 seconds for 5 rounds is humanly impossible)
  if (submission.timeTaken !== undefined && submission.timeTaken < 30) {
    return { valid: false, reason: 'Completion time too fast' }
  }

  return { valid: true }
}
