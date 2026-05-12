import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { todayDateStr } from '@/lib/daily-cities'

export const dynamic = 'force-dynamic'

export async function GET() {
  // Ensure today's daily tournament exists
  await ensureDailyTournament()

  const tournaments = await prisma.tournament.findMany({
    where: {
      status: 'active',
    },
    orderBy: { startDate: 'desc' },
    include: {
      _count: { select: { entries: true } },
    },
  })

  return NextResponse.json(tournaments)
}

async function ensureDailyTournament() {
  const today = todayDateStr()
  const name = `Daily Challenge — ${today}`

  const existing = await prisma.tournament.findFirst({
    where: {
      type: 'daily',
      name,
    },
  })

  if (!existing) {
    const startDate = new Date(today + 'T00:00:00Z')
    const endDate = new Date(today + 'T23:59:59Z')

    await prisma.tournament.create({
      data: {
        name,
        type: 'daily',
        startDate,
        endDate,
        status: 'active',
        prizes: [
          { rank: 1, description: '🥇 Gold Medal + 100 XP' },
          { rank: 2, description: '🥈 Silver Medal + 50 XP' },
          { rank: 3, description: '🥉 Bronze Medal + 25 XP' },
        ],
      },
    })
  }

  // Auto-close expired tournaments
  await prisma.tournament.updateMany({
    where: {
      status: 'active',
      endDate: { lt: new Date() },
    },
    data: { status: 'finished' },
  })
}
