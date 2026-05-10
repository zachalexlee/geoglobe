import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getTodaysPuzzle } from '@/lib/puzzle-generator'
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
      // Load today's puzzle for locations
      const puzzle = await getTodaysPuzzle()
      const locations = puzzle
        ? puzzle.locations.slice(0, 5).map((loc: any) => ({
            id: loc.id,
            order: loc.order,
            latitude: loc.latitude,
            longitude: loc.longitude,
            name: loc.name,
            country: loc.country,
            description: loc.description,
            imageUrl: loc.imageUrl ?? null,
            category: loc.category ?? null,
          }))
        : []

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
