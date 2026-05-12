import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: {
      entries: {
        orderBy: { score: 'desc' },
        take: 50,
      },
    },
  })

  if (!tournament) {
    return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })
  }

  // Assign ranks based on ordering
  const leaderboard = tournament.entries.map((entry, idx) => ({
    ...entry,
    rank: idx + 1,
  }))

  return NextResponse.json({
    ...tournament,
    entries: leaderboard,
  })
}
