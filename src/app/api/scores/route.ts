import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { validateScoreSubmission } from '@/lib/anti-cheat'

interface ScoreBody {
  puzzleId: string
  totalScore: number
  distances: number[]
  roundScores: number[]
  timeTaken?: number
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: ScoreBody = await req.json()
    const { puzzleId, totalScore, distances, roundScores, timeTaken } = body

    if (
      !puzzleId ||
      typeof totalScore !== 'number' ||
      !Array.isArray(distances) ||
      !Array.isArray(roundScores)
    ) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    // Anti-cheat: validate that the submitted scores are consistent with the
    // distances using the canonical server-side scoring formula.
    const validation = validateScoreSubmission({ puzzleId, totalScore, distances, roundScores, timeTaken })
    if (!validation.valid) {
      return NextResponse.json({ error: 'Invalid score submission', reason: validation.reason }, { status: 422 })
    }

    const userId = session.user.id

    // Upsert the score (one per user per puzzle)
    const score = await prisma.score.upsert({
      where: { userId_puzzleId: { userId, puzzleId } },
      create: {
        userId,
        puzzleId,
        totalScore,
        distances,
        roundScores,
        timeTaken: timeTaken ?? null,
      },
      update: {
        totalScore,
        distances,
        roundScores,
        timeTaken: timeTaken ?? null,
      },
    })

    // Update XP: +totalScore/10 rounded
    const xpGain = Math.round(totalScore / 10)

    // Streak logic: check if user already has a score for yesterday's puzzle
    // to determine if streak should be incremented or reset
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { streak: true, longestStreak: true, xp: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user has played yesterday (any puzzle dated yesterday)
    const now = new Date()
    const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
    const yesterdayEnd = new Date(yesterdayStart.getTime() + 24 * 60 * 60 * 1000)

    const yesterdayScore = await prisma.score.findFirst({
      where: {
        userId,
        puzzle: {
          date: { gte: yesterdayStart, lt: yesterdayEnd },
        },
      },
    })

    // Check if user already had a score for today (streak already counted)
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)

    const existingTodayScores = await prisma.score.count({
      where: {
        userId,
        puzzle: {
          date: { gte: todayStart, lt: todayEnd },
        },
      },
    })

    // Only update streak on first submission today
    const isFirstSubmissionToday = existingTodayScores <= 1 // the upsert may have just created it

    let newStreak = user.streak
    if (isFirstSubmissionToday) {
      if (yesterdayScore) {
        newStreak = user.streak + 1
      } else if (user.streak === 0) {
        // Starting a new streak
        newStreak = 1
      } else {
        // Broke the streak – reset to 1
        newStreak = 1
      }
    }

    const newLongestStreak = Math.max(user.longestStreak, newStreak)

    await prisma.user.update({
      where: { id: userId },
      data: {
        xp: { increment: xpGain },
        streak: newStreak,
        longestStreak: newLongestStreak,
      },
    })

    return NextResponse.json({
      scoreId: score.id,
      totalScore,
      xpGain,
      newStreak,
    })
  } catch (error) {
    console.error('scores POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
