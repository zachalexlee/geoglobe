// ── Badge Definitions & Award Logic ────────────────────────────────────────────

export interface BadgeCondition {
  type:
    | 'games_played'
    | 'perfect_round'
    | 'perfect_game'
    | 'streak'
    | 'level'
    | 'distance_km'
  value: number
}

export interface BadgeDefinition {
  name: string
  description: string
  icon: string
  condition: BadgeCondition
}

/** Canonical list of all badges in the game. */
export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    name: 'First Steps',
    description: 'Complete your first daily puzzle',
    icon: '🌍',
    condition: { type: 'games_played', value: 1 },
  },
  {
    name: 'Globe Trotter',
    description: 'Complete 10 daily puzzles',
    icon: '✈️',
    condition: { type: 'games_played', value: 10 },
  },
  {
    name: 'World Explorer',
    description: 'Complete 50 daily puzzles',
    icon: '🗺️',
    condition: { type: 'games_played', value: 50 },
  },
  {
    name: 'Perfect Round',
    description: 'Score 100 on a single location',
    icon: '🎯',
    condition: { type: 'perfect_round', value: 1 },
  },
  {
    name: 'Flawless',
    description: 'Score 500 on a daily puzzle (perfect game)',
    icon: '💎',
    condition: { type: 'perfect_game', value: 500 },
  },
  {
    name: 'On a Roll',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    condition: { type: 'streak', value: 7 },
  },
  {
    name: 'Unstoppable',
    description: 'Maintain a 30-day streak',
    icon: '⚡',
    condition: { type: 'streak', value: 30 },
  },
  {
    name: 'Geographer',
    description: 'Reach level 10',
    icon: '📐',
    condition: { type: 'level', value: 10 },
  },
  {
    name: 'Cartographer',
    description: 'Reach level 25',
    icon: '🗾',
    condition: { type: 'level', value: 25 },
  },
  {
    name: 'Close Call',
    description: 'Guess within 50 km',
    icon: '📍',
    condition: { type: 'distance_km', value: 50 },
  },
]

export interface GameResult {
  totalScore: number
  roundScores: number[]
  /** Distances in km for each round */
  distances: number[]
  streak: number
  level: number
  gamesPlayed: number
}

/**
 * Check which badges the user has just unlocked after a game and persist them.
 *
 * Returns the names of newly earned badges (already-held badges are skipped).
 */
export async function checkAndAwardBadges(
  userId: string,
  gameResult: GameResult,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prisma: any
): Promise<string[]> {
  const { totalScore, roundScores, distances, streak, level, gamesPlayed } = gameResult

  // Fetch all badge records and which ones the user already has
  const [allBadges, existingUserBadges] = await Promise.all([
    prisma.badge.findMany(),
    prisma.userBadge.findMany({ where: { userId }, select: { badgeId: true } }),
  ])

  const earnedBadgeIds = new Set<string>(existingUserBadges.map((ub: { badgeId: string }) => ub.badgeId))

  const bestDistance = distances.length > 0 ? Math.min(...distances) : Infinity

  const newlyEarned: string[] = []

  for (const badgeRecord of allBadges) {
    // Skip already-owned badges
    if (earnedBadgeIds.has(badgeRecord.id)) continue

    const condition = badgeRecord.condition as BadgeCondition
    let qualifies = false

    switch (condition.type) {
      case 'games_played':
        qualifies = gamesPlayed >= condition.value
        break
      case 'perfect_round':
        qualifies = roundScores.some((s) => s >= 100)
        break
      case 'perfect_game':
        qualifies = totalScore >= condition.value
        break
      case 'streak':
        qualifies = streak >= condition.value
        break
      case 'level':
        qualifies = level >= condition.value
        break
      case 'distance_km':
        qualifies = bestDistance <= condition.value
        break
    }

    if (qualifies) {
      await prisma.userBadge.create({
        data: { userId, badgeId: badgeRecord.id },
      })
      newlyEarned.push(badgeRecord.name)
    }
  }

  return newlyEarned
}

/**
 * Seed badge definitions into the database (idempotent – uses upsert).
 * Call this from a seed script or a one-time admin endpoint.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function seedBadges(prisma: any): Promise<void> {
  for (const def of BADGE_DEFINITIONS) {
    await prisma.badge.upsert({
      where: { name: def.name },
      update: {
        description: def.description,
        icon: def.icon,
        condition: def.condition,
      },
      create: {
        name: def.name,
        description: def.description,
        icon: def.icon,
        condition: def.condition,
      },
    })
  }
}
