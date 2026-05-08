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
 * Return today's puzzle with ordered locations, or null if none exists.
 */
export async function getTodaysPuzzle() {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)

  return prisma.dailyPuzzle.findFirst({
    where: { date: { gte: todayStart, lt: todayEnd } },
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
