import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateEloChange } from '@/lib/elo'

// ── GET: poll match state ──────────────────────────────────────────────────────

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { matchId } = await params

    const match = await prisma.versusMatch.findUnique({
      where: { id: matchId },
      include: {
        player1: { select: { id: true, username: true, avatar: true, elo: true } },
        player2: { select: { id: true, username: true, avatar: true, elo: true } },
      },
    })

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 })
    }

    // Only participants can view
    const userId = session.user.id
    if (match.player1Id !== userId && match.player2Id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({
      id: match.id,
      status: match.status,
      isRanked: match.isRanked,
      locations: match.locations,
      player1: match.player1,
      player2: match.player2Id ? match.player2 : null,
      p1Scores: match.p1Scores,
      p2Scores: match.p2Scores,
      p1Time: match.p1Time,
      p2Time: match.p2Time,
      winnerId: match.winnerId,
      eloChange: match.eloChange,
    })
  } catch (error) {
    console.error('versus GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ── PATCH: submit scores ───────────────────────────────────────────────────────

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { matchId } = await params
    const body = await req.json()
    const { scores, distances, timeTaken } = body as {
      scores: number[]
      distances: number[]
      timeTaken: number
    }

    if (!Array.isArray(scores) || !Array.isArray(distances) || typeof timeTaken !== 'number') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const userId = session.user.id

    const match = await prisma.versusMatch.findUnique({
      where: { id: matchId },
    })

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 })
    }
    if (match.status !== 'active') {
      return NextResponse.json({ error: 'Match is not active' }, { status: 400 })
    }

    const isPlayer1 = match.player1Id === userId
    const isPlayer2 = match.player2Id === userId
    if (!isPlayer1 && !isPlayer2) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update this player's scores
    const updateData: Record<string, unknown> = isPlayer1
      ? { p1Scores: scores, p1Time: timeTaken }
      : { p2Scores: scores, p2Time: timeTaken }

    let updatedMatch = await prisma.versusMatch.update({
      where: { id: matchId },
      data: updateData,
    })

    // Check if both players have now submitted
    const p1Done = updatedMatch.p1Scores !== null
    const p2Done = updatedMatch.p2Scores !== null

    if (p1Done && p2Done) {
      // Calculate totals
      const p1Scores = updatedMatch.p1Scores as number[]
      const p2Scores = updatedMatch.p2Scores as number[]
      const p1Total = p1Scores.reduce((a, b) => a + b, 0)
      const p2Total = p2Scores.reduce((a, b) => a + b, 0)

      let winnerId: string | null = null
      if (p1Total > p2Total) winnerId = match.player1Id
      else if (p2Total > p1Total) winnerId = match.player2Id
      // null = draw

      let eloChange = 0

      if (match.isRanked && winnerId && match.player2Id) {
        // Fetch elos
        const [p1, p2] = await Promise.all([
          prisma.user.findUnique({ where: { id: match.player1Id }, select: { elo: true } }),
          prisma.user.findUnique({ where: { id: match.player2Id }, select: { elo: true } }),
        ])

        if (p1 && p2) {
          const winnerElo = winnerId === match.player1Id ? p1.elo : p2.elo
          const loserElo = winnerId === match.player1Id ? p2.elo : p1.elo
          const changes = calculateEloChange(winnerElo, loserElo)
          eloChange = changes.winner

          // Update elos
          await prisma.user.update({
            where: { id: winnerId },
            data: { elo: { increment: changes.winner } },
          })
          const loserId = winnerId === match.player1Id ? match.player2Id : match.player1Id
          await prisma.user.update({
            where: { id: loserId },
            data: { elo: { increment: changes.loser } },
          })
        }
      }

      updatedMatch = await prisma.versusMatch.update({
        where: { id: matchId },
        data: { status: 'complete', winnerId, eloChange },
      })
    }

    return NextResponse.json({
      status: updatedMatch.status,
      winnerId: updatedMatch.winnerId,
      eloChange: updatedMatch.eloChange,
    })
  } catch (error) {
    console.error('versus PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
