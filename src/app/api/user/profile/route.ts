import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { levelFromXp, xpInCurrentLevel, xpToNextLevel } from '@/lib/xp-system'

export interface BadgeInfo {
  id: string
  name: string
  description: string
  icon: string
  earnedAt: string
}

export interface RecentScore {
  id: string
  puzzleId: string
  totalScore: number
  roundScores: number[]
  timeTaken: number | null
  createdAt: string
}

export interface ProfileResponse {
  username: string
  avatar: string | null
  flag: string | null
  xp: number
  level: number
  /** XP earned within the current level */
  xpCurrentLevel: number
  /** XP required to complete the current level */
  xpToNextLevel: number
  streak: number
  longestStreak: number
  elo: number
  isPremium: boolean
  badges: BadgeInfo[]
  recentScores: RecentScore[]
  gamesPlayed: number
}

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        scores: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            puzzleId: true,
            totalScore: true,
            roundScores: true,
            timeTaken: true,
            createdAt: true,
          },
        },
        // UserBadge join includes the Badge record
        // Prisma won't let us use "userBadges" unless we add the relation to User –
        // instead query UserBadge directly below
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Fetch earned badges separately (UserBadge doesn't hang off User in the schema)
    const userBadges = await prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { earnedAt: 'asc' },
    })

    const gamesPlayed = await prisma.score.count({ where: { userId } })

    const level = levelFromXp(user.xp)
    const xpCurrent = xpInCurrentLevel(user.xp)
    const xpNext = xpToNextLevel(user.xp)

    const badges: BadgeInfo[] = userBadges.map(
      (ub: { badge: { id: string; name: string; description: string; icon: string }; earnedAt: Date }) => ({
        id: ub.badge.id,
        name: ub.badge.name,
        description: ub.badge.description,
        icon: ub.badge.icon,
        earnedAt: ub.earnedAt.toISOString(),
      })
    )

    const recentScores: RecentScore[] = user.scores.map(
      (s: { id: string; puzzleId: string; totalScore: number; roundScores: unknown; timeTaken: number | null; createdAt: Date }) => ({
        id: s.id,
        puzzleId: s.puzzleId,
        totalScore: s.totalScore,
        roundScores: s.roundScores as number[],
        timeTaken: s.timeTaken,
        createdAt: s.createdAt.toISOString(),
      })
    )

    const response: ProfileResponse = {
      username: user.username,
      avatar: user.avatar,
      flag: user.flag,
      xp: user.xp,
      level,
      xpCurrentLevel: xpCurrent,
      xpToNextLevel: xpNext,
      streak: user.streak,
      longestStreak: user.longestStreak,
      elo: user.elo,
      isPremium: user.isPremium,
      badges,
      recentScores,
      gamesPlayed,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('profile GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
