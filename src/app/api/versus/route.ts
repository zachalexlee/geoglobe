import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getDailyCities, todayDateStr } from '@/lib/daily-cities'
import { emitMatchEvent } from '@/lib/versus-events'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const isRanked = body.isRanked === true

    const userId = session.user.id

    // Find a pending match to join (not created by this user, no p2 yet)
    const pendingMatch = await prisma.versusMatch.findFirst({
      where: {
        status: 'pending',
        isRanked,
        player1Id: { not: userId },
        player2Id: { equals: null },
      },
      orderBy: { createdAt: 'asc' },
    })

    if (pendingMatch) {
      // Use the deterministic city generator for today's cities
      const dateStr = todayDateStr()
      const cities = getDailyCities(dateStr)
      const locations = cities.slice(0, 5).map((city, i) => ({
        id: `versus-${dateStr}-${i}`,
        order: i + 1,
        latitude: city.latitude,
        longitude: city.longitude,
        name: city.name,
        country: city.country,
        description: `Locate ${city.name} on the globe`,
        imageUrl: null,
        category: null,
      }))

      // Join the match
      const updated = await prisma.versusMatch.update({
        where: { id: pendingMatch.id },
        data: {
          player2Id: userId,
          status: 'active',
          locations: locations,
        },
      })

      // Emit match-ready event so player1's SSE connection gets notified
      emitMatchEvent(pendingMatch.id, {
        type: 'match-ready',
        matchId: updated.id,
      })

      return NextResponse.json({
        matchId: updated.id,
        status: 'active',
        locations,
      })
    }

    // No pending match — create one and wait for an opponent
    const newMatch = await prisma.versusMatch.create({
      data: {
        player1Id: userId,
        player2Id: null,
        isRanked,
        status: 'pending',
        locations: [],
      },
    })

    return NextResponse.json({
      matchId: newMatch.id,
      status: 'waiting',
    })
  } catch (error) {
    console.error('versus POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
