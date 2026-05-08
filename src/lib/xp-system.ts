// ── XP / Level / Streak Utilities ─────────────────────────────────────────────

/**
 * XP required to complete a single level (exponential curve).
 * Level 1 = 100 XP, Level 2 = 150 XP, Level 3 = 225 XP, …
 */
export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1))
}

/**
 * Total XP required to *reach* the given level (i.e. sum of all previous tiers).
 */
export function totalXpForLevel(level: number): number {
  let total = 0
  for (let i = 1; i < level; i++) total += xpForLevel(i)
  return total
}

/**
 * Calculate what level a player is at given their total accumulated XP.
 */
export function levelFromXp(totalXp: number): number {
  let level = 1
  let xpNeeded = 0
  while (xpNeeded + xpForLevel(level) <= totalXp) {
    xpNeeded += xpForLevel(level)
    level++
  }
  return level
}

/**
 * How much XP is earned from a game score (score ÷ 10, rounded).
 */
export function scoreToXp(totalScore: number): number {
  return Math.round(totalScore / 10)
}

/** XP progress within the current level (0 … xpForLevel(level) - 1). */
export function xpInCurrentLevel(totalXp: number): number {
  const level = levelFromXp(totalXp)
  return totalXp - totalXpForLevel(level)
}

/** XP needed to finish the current level (denominator of the progress bar). */
export function xpToNextLevel(totalXp: number): number {
  const level = levelFromXp(totalXp)
  return xpForLevel(level)
}

export interface XpGain {
  xpEarned: number
  oldLevel: number
  newLevel: number
  leveledUp: boolean
}

/**
 * Award XP and update streak in the database after a completed game.
 *
 * Streak logic:
 *  - If the user has a score for *yesterday's puzzle* → increment streak.
 *  - Otherwise → reset streak to 1 (they played today but broke continuity).
 *  - Longest streak is updated if the new streak exceeds it.
 *  - Level is recalculated from the new total XP.
 */
export async function awardXpAndStreak(
  userId: string,
  totalScore: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prisma: any
): Promise<XpGain> {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new Error(`User ${userId} not found`)

  const xpEarned = scoreToXp(totalScore)
  const oldLevel = user.level
  const newTotalXp = user.xp + xpEarned
  const newLevel = levelFromXp(newTotalXp)

  // ── Streak calculation ─────────────────────────────────────────────────────
  const now = new Date()
  const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
  const yesterdayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)

  // Only count a streak increment once per day (don't inflate on re-submissions)
  const existingTodayScores = await prisma.score.count({
    where: {
      userId,
      puzzle: { date: { gte: todayStart, lt: todayEnd } },
    },
  })

  let newStreak = user.streak
  if (existingTodayScores <= 1) {
    // This is the first submission today
    const yesterdayScore = await prisma.score.findFirst({
      where: {
        userId,
        puzzle: { date: { gte: yesterdayStart, lt: yesterdayEnd } },
      },
    })
    newStreak = yesterdayScore ? user.streak + 1 : 1
  }

  const newLongestStreak = Math.max(user.longestStreak, newStreak)

  await prisma.user.update({
    where: { id: userId },
    data: {
      xp: newTotalXp,
      level: newLevel,
      streak: newStreak,
      longestStreak: newLongestStreak,
    },
  })

  return { xpEarned, oldLevel, newLevel, leveledUp: newLevel > oldLevel }
}
