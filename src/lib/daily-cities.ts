import { WORLD_CITIES, type City } from './cities'

/**
 * Deterministic seeded PRNG (mulberry32).
 * Given the same seed, always produces the same sequence.
 */
function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Convert a date string (YYYY-MM-DD) to a numeric seed.
 * Same date → same seed → same 5 cities every time.
 */
function dateSeed(dateStr: string): number {
  let hash = 0
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i)
    hash = ((hash << 5) - hash + char) | 0
  }
  return Math.abs(hash)
}

/**
 * Pick 5 unique random cities for a given date.
 * Deterministic: same date always returns the same 5 cities.
 */
export function getDailyCities(dateStr: string): City[] {
  const seed = dateSeed(dateStr)
  const rng = mulberry32(seed)
  const pool = [...WORLD_CITIES]
  const picked: City[] = []

  for (let i = 0; i < 5; i++) {
    const idx = Math.floor(rng() * pool.length)
    picked.push(pool[idx])
    pool.splice(idx, 1) // remove to avoid duplicates
  }

  return picked
}

/**
 * Get today's date string in YYYY-MM-DD (UTC).
 */
export function todayDateStr(): string {
  const now = new Date()
  return now.toISOString().split('T')[0]
}

/**
 * Get the puzzle number based on days since epoch start.
 * This gives us a monotonically increasing puzzle number.
 */
export function getPuzzleNumber(dateStr: string): number {
  const epoch = new Date('2025-01-01').getTime()
  const target = new Date(dateStr).getTime()
  return Math.floor((target - epoch) / (24 * 60 * 60 * 1000)) + 1
}
