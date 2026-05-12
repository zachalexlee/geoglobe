import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/user/use-shield
 * Uses a streak shield to prevent streak reset when the user missed yesterday.
 * Requires the user to have at least 1 shield and to have actually missed yesterday.
 */
export async function POST() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { streakShields: true, streak: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.streakShields <= 0) {
      return NextResponse.json(
        { error: 'No streak shields available' },
        { status: 400 }
      )
    }

    // Check if user actually missed yesterday
    const now = new Date()
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    const yesterdayPuzzleId = `daily-${yesterdayStr}`

    const yesterdayScore = await prisma.score.findFirst({
      where: {
        userId,
        puzzleId: yesterdayPuzzleId,
      },
    })

    if (yesterdayScore) {
      return NextResponse.json(
        { error: 'You played yesterday — no shield needed' },
        { status: 400 }
      )
    }

    // User missed yesterday — use a shield to preserve streak
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        streakShields: { decrement: 1 },
      },
      select: { streakShields: true, streak: true },
    })

    return NextResponse.json({
      success: true,
      shieldsRemaining: updated.streakShields,
      streakPreserved: updated.streak,
    })
  } catch (error) {
    console.error('use-shield POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
