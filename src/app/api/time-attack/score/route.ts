import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface TimeAttackScoreBody {
  puzzleId: string
  totalScore: number
  distances: number[]
  roundScores: number[]
  timeTaken: number
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: TimeAttackScoreBody = await req.json()
    const { puzzleId, totalScore, distances, roundScores, timeTaken } = body

    if (!puzzleId || !puzzleId.startsWith('time-attack-')) {
      return NextResponse.json({ error: 'Invalid puzzle ID' }, { status: 400 })
    }

    if (!Array.isArray(distances) || !Array.isArray(roundScores)) {
      return NextResponse.json({ error: 'Invalid score data' }, { status: 400 })
    }

    const userId = session.user.id

    // Upsert — keep the best score for this day's time attack
    const existing = await prisma.score.findUnique({
      where: { userId_puzzleId: { userId, puzzleId } },
    })

    if (existing && existing.totalScore >= totalScore) {
      return NextResponse.json({
        message: 'Existing score is higher, not updated',
        totalScore: existing.totalScore,
      })
    }

    const score = await prisma.score.upsert({
      where: { userId_puzzleId: { userId, puzzleId } },
      create: {
        userId,
        puzzleId,
        totalScore,
        distances,
        roundScores,
        timeTaken,
      },
      update: {
        totalScore,
        distances,
        roundScores,
        timeTaken,
      },
    })

    return NextResponse.json({
      scoreId: score.id,
      totalScore: score.totalScore,
    })
  } catch (error) {
    console.error('time-attack score POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
