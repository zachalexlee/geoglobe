import { getDailyCities } from './daily-cities'

/**
 * Derive a continent/region name from a lat/lng coordinate.
 * Boundaries are approximate — good enough for practice recommendations.
 */
export function latLngToRegion(lat: number, lng: number): string {
  if (lat > 35 && lng > -30 && lng < 60) return 'Europe'
  if (lat > -35 && lat < 37 && lng > -20 && lng < 55) return 'Africa'
  if (lat > 0 && lng > 25 && lng < 180) return 'Asia'
  if (lat > 15 && lng > -170 && lng < -50) return 'North America'
  if (lat < 15 && lat > -60 && lng > -90 && lng < -30) return 'South America'
  if (lat < -10 && lng > 110 && lng < 180) return 'Oceania'
  return 'Other'
}

// ── Types ──────────────────────────────────────────────────────────────────────

export interface WeakSpotResult {
  /** Categories ordered from weakest → strongest (only those with ≥ 1 data point) */
  weakCategories: string[]
  /** Regions ordered from weakest → strongest (only those with ≥ 1 data point) */
  weakRegions: string[]
  /** Average score across all fetched games (0–500 scale, 5 rounds × 100) */
  avgScore: number
  /** Total number of scored games */
  totalGames: number
  /** Per-category stats: { [category]: { avg: number; count: number } } */
  categoryStats: Record<string, { avg: number; count: number }>
  /** Per-region stats: { [region]: { avg: number; count: number } } */
  regionStats: Record<string, { avg: number; count: number }>
}

// ── Core analytics ─────────────────────────────────────────────────────────────

/**
 * Analyse a user's last 30 puzzle scores to surface weak categories and regions.
 *
 * The Score model stores `roundScores` (Json array) and `distances` (Json array).
 * The puzzleId is in "daily-YYYY-MM-DD" format, so we reconstruct locations
 * from the deterministic city generator rather than a DB relation.
 *
 * Strategy:
 *  1. Fetch the 30 most-recent scores.
 *  2. For each score, derive the puzzle date from puzzleId and get cities.
 *  3. Pair round scores with the corresponding location.
 *  4. Accumulate per-category and per-region averages.
 *  5. Return sorted weak-spot lists + raw stats.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function analyzeWeakSpots(userId: string, prisma: any): Promise<WeakSpotResult> {
  // Fetch the 30 most-recent scores
  const scores = await prisma.score.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 30,
  })

  const totalGames: number = scores.length
  let totalScoreSum = 0

  // Accumulator: { sum, count } per category / region
  const categoryAcc: Record<string, { sum: number; count: number }> = {}
  const regionAcc: Record<string, { sum: number; count: number }> = {}

  for (const score of scores) {
    totalScoreSum += score.totalScore

    const roundScores: number[] = Array.isArray(score.roundScores)
      ? (score.roundScores as number[])
      : []

    // Derive locations from the deterministic city generator using puzzleId
    // puzzleId format: "daily-YYYY-MM-DD"
    const dateMatch = (score.puzzleId as string).match(/^daily-(\d{4}-\d{2}-\d{2})$/)
    if (!dateMatch) continue // skip non-daily scores (e.g. practice)
    const cities = getDailyCities(dateMatch[1])

    // Pair each round score with its city
    for (let i = 0; i < cities.length; i++) {
      const city = cities[i]
      const roundScore = roundScores[i] ?? 0

      // ── Category accumulator (use region as category since cities don't have categories) ──
      const region = latLngToRegion(city.latitude, city.longitude)

      // ── Region accumulator ───────────────────────────────────────────────
      if (!regionAcc[region]) regionAcc[region] = { sum: 0, count: 0 }
      regionAcc[region].sum += roundScore
      regionAcc[region].count += 1

      // ── Country as a category proxy ──────────────────────────────────────
      const cat = city.country.toLowerCase()
      if (!categoryAcc[cat]) categoryAcc[cat] = { sum: 0, count: 0 }
      categoryAcc[cat].sum += roundScore
      categoryAcc[cat].count += 1
    }
  }

  // Build average maps
  const categoryStats: Record<string, { avg: number; count: number }> = {}
  for (const [cat, { sum, count }] of Object.entries(categoryAcc)) {
    categoryStats[cat] = { avg: count > 0 ? Math.round(sum / count) : 0, count }
  }

  const regionStats: Record<string, { avg: number; count: number }> = {}
  for (const [region, { sum, count }] of Object.entries(regionAcc)) {
    regionStats[region] = { avg: count > 0 ? Math.round(sum / count) : 0, count }
  }

  // Sort weakest first (lowest average first)
  const weakCategories = Object.entries(categoryStats)
    .sort((a, b) => a[1].avg - b[1].avg)
    .map(([cat]) => cat)

  const weakRegions = Object.entries(regionStats)
    .sort((a, b) => a[1].avg - b[1].avg)
    .map(([region]) => region)

  const avgScore = totalGames > 0 ? Math.round(totalScoreSum / totalGames) : 0

  return { weakCategories, weakRegions, avgScore, totalGames, categoryStats, regionStats }
}

// ── Recommendation engine ──────────────────────────────────────────────────────

/**
 * Score each available practice map by how well it targets the user's weak areas,
 * then return them sorted best-match first.
 *
 * Scoring heuristic (higher = better match for the user's weak spots):
 *  - Map category matches a weak category: +3 points per position (weakest = highest bonus)
 *  - Map name/description mentions a weak region: +2 points per position
 *  - Official maps get a small +0.5 tiebreaker boost
 */
export function getRecommendations(
  weakSpots: { weakCategories: string[]; weakRegions: string[] },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  availableMaps: any[]
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): any[] {
  const { weakCategories, weakRegions } = weakSpots

  const scored = availableMaps.map((map) => {
    let score = 0

    // Category match — weakest category (index 0) earns most points
    const catIdx = weakCategories.findIndex(
      (wc) => wc.toLowerCase() === (map.category ?? '').toLowerCase()
    )
    if (catIdx !== -1) {
      // weakCategories[0] is weakest → give bonus = (length - index) * 3
      score += (weakCategories.length - catIdx) * 3
    }

    // Region match — check map name + description for region keywords
    const mapText = `${map.name ?? ''} ${map.description ?? ''}`.toLowerCase()
    weakRegions.forEach((region, idx) => {
      if (mapText.includes(region.toLowerCase())) {
        score += (weakRegions.length - idx) * 2
      }
    })

    // Tiebreaker: official maps float up slightly
    if (map.isOfficial) score += 0.5

    return { map, score }
  })

  return scored.sort((a, b) => b.score - a.score).map(({ map }) => map)
}
