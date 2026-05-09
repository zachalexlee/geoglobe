import { prisma } from './prisma'
import { haversineDistance } from './game-engine'

// Re-export for convenience
export { haversineDistance }

/**
 * Check if a puzzle exists for today's date (UTC midnight boundary).
 */
export async function hasTodaysPuzzle(): Promise<boolean> {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)

  const count = await prisma.dailyPuzzle.count({
    where: { date: { gte: todayStart, lt: todayEnd } },
  })
  return count > 0
}

/**
 * Return today's puzzle with ordered locations.
 * First checks for a puzzle matching today's exact date.
 * If none exists, cycles through available puzzles based on day-of-year.
 */
export async function getTodaysPuzzle() {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)

  // Try exact date match first
  const exactMatch = await prisma.dailyPuzzle.findFirst({
    where: { date: { gte: todayStart, lt: todayEnd } },
    include: { locations: { orderBy: { order: 'asc' } } },
  })
  if (exactMatch) return exactMatch

  // Fallback: cycle through available puzzles by day-of-year
  const totalPuzzles = await prisma.dailyPuzzle.count()
  if (totalPuzzles === 0) return null

  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const dayOfYear = Math.floor((todayStart.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000))
  const puzzleIndex = (dayOfYear % totalPuzzles) + 1

  return prisma.dailyPuzzle.findFirst({
    where: { puzzleNumber: puzzleIndex },
    include: { locations: { orderBy: { order: 'asc' } } },
  })
}

/**
 * Return a puzzle by date string YYYY-MM-DD, or null if not found.
 */
export async function getPuzzleByDate(dateStr: string) {
  // Parse the date string as a UTC date then find within that calendar day (local server time)
  const [year, month, day] = dateStr.split('-').map(Number)
  if (!year || !month || !day) return null

  const dayStart = new Date(year, month - 1, day)
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)

  return prisma.dailyPuzzle.findFirst({
    where: { date: { gte: dayStart, lt: dayEnd } },
    include: { locations: { orderBy: { order: 'asc' } } },
  })
}

/**
 * Return a puzzle by its puzzle number, or null if not found.
 */
export async function getPuzzleByNumber(num: number) {
  return prisma.dailyPuzzle.findUnique({
    where: { puzzleNumber: num },
    include: { locations: { orderBy: { order: 'asc' } } },
  })
}

/**
 * Return just the ID of today's active puzzle (uses the same cycling logic as getTodaysPuzzle).
 * Useful for leaderboard queries and other lookups that only need the puzzle ID.
 */
export async function getTodaysPuzzleId(): Promise<string | null> {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)

  // Try exact date match first
  const exactMatch = await prisma.dailyPuzzle.findFirst({
    where: { date: { gte: todayStart, lt: todayEnd } },
    select: { id: true },
  })
  if (exactMatch) return exactMatch.id

  // Fallback: cycle through available puzzles by day-of-year
  const totalPuzzles = await prisma.dailyPuzzle.count()
  if (totalPuzzles === 0) return null

  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const dayOfYear = Math.floor((todayStart.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000))
  const puzzleIndex = (dayOfYear % totalPuzzles) + 1

  const puzzle = await prisma.dailyPuzzle.findFirst({
    where: { puzzleNumber: puzzleIndex },
    select: { id: true },
  })
  return puzzle?.id ?? null
}
