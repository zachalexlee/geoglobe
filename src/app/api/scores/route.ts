import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getGuesses, clearGuesses } from '@/lib/guess-store'
import { computeTotalFromGuesses, validateScoreSubmission } from '@/lib/anti-cheat'

interface ScoreBody {
  puzzleId: string
  timeTaken?: number
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: ScoreBody = await req.json()
    const { puzzleId, timeTaken } = body

    if (!puzzleId) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const userId = session.user.id

    // ── Compute score from server-side stored guesses ────────────────────────
    const storedGuesses = getGuesses(userId, puzzleId)

    if (storedGuesses.length !== 5) {
      return NextResponse.json(
        { error: `Incomplete game: ${storedGuesses.length}/5 rounds submitted` },
        { status: 400 }
      )
    }

    // Sort by round to ensure correct order
    const sortedGuesses = [...storedGuesses].sort((a, b) => a.round - b.round)

    // Compute authoritative total from server-validated guesses
    const { totalScore, distances, roundScores } = computeTotalFromGuesses(sortedGuesses)

    // Additional validation: verify internal consistency
    const validation = validateScoreSubmission({
      puzzleId,
      totalScore,
      distances,
      roundScores,
      timeTaken,
    })
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Score validation failed', reason: validation.reason },
        { status: 422 }
      )
    }

    // ── Check for existing score (prevent XP double-counting) ────────────────
    const existingScore = await prisma.score.findUnique({
      where: { userId_puzzleId: { userId, puzzleId } },
    })

    const isFirstSubmission = !existingScore

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

    // ── XP: Only award on FIRST submission for this puzzle ────────────────────
    let xpGain = 0
    let newStreak = 0

    if (isFirstSubmission) {
      xpGain = Math.round(totalScore / 10)

      // Streak logic
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { streak: true, longestStreak: true, xp: true },
      })

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      // Check if user played yesterday
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

      if (yesterdayScore) {
        newStreak = user.streak + 1
      } else {
        // Starting a new streak (or first play)
        newStreak = 1
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
    } else {
      // Re-submission: get current streak for response but don't modify XP
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { streak: true },
      })
      newStreak = user?.streak ?? 0
    }

    // Clean up server-side guess store
    clearGuesses(userId, puzzleId)

    return NextResponse.json({
      scoreId: score.id,
      totalScore,
      xpGain,
      newStreak,
      isFirstSubmission,
    })
  } catch (error) {
    console.error('scores POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
