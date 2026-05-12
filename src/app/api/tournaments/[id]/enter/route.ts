import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const userId = session.user.id

  const tournament = await prisma.tournament.findUnique({
    where: { id },
  })

  if (!tournament) {
    return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })
  }

  if (tournament.status !== 'active') {
    return NextResponse.json({ error: 'Tournament is not active' }, { status: 400 })
  }

  // Check if already entered
  const existing = await prisma.tournamentEntry.findUnique({
    where: {
      tournamentId_userId: {
        tournamentId: id,
        userId,
      },
    },
  })

  if (existing) {
    return NextResponse.json({ error: 'Already entered', entry: existing }, { status: 409 })
  }

  // Find user's daily score for today if it's a daily tournament
  let score = 0
  if (tournament.type === 'daily') {
    const todayScore = await prisma.score.findFirst({
      where: {
        userId,
        createdAt: {
          gte: tournament.startDate,
          lte: tournament.endDate,
        },
      },
      orderBy: { totalScore: 'desc' },
    })
    score = todayScore?.totalScore ?? 0
  }

  const entry = await prisma.tournamentEntry.create({
    data: {
      tournamentId: id,
      userId,
      score,
    },
  })

  return NextResponse.json(entry)
}
