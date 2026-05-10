import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateEloChange } from '@/lib/elo'
import { emitMatchEvent } from '@/lib/versus-events'

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

// ── PATCH: submit scores (atomic transaction with row locking) ─────────────────

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

    // Use an interactive transaction with row-level locking to prevent race conditions.
    // Both players might submit at nearly the same time — without locking, both could
    // read the match as "only one player done" and never resolve the match.
    const result = await prisma.$transaction(async (tx) => {
      // Lock the row with FOR UPDATE to serialize concurrent submissions
      const [match] = await tx.$queryRawUnsafe<Array<{
        id: string
        player1Id: string
        player2Id: string | null
        winnerId: string | null
        isRanked: boolean
        status: string
        p1Scores: unknown
        p2Scores: unknown
        p1Time: number | null
        p2Time: number | null
        eloChange: number | null
      }>>(
        `SELECT id, "player1Id", "player2Id", "winnerId", "isRanked", status, "p1Scores", "p2Scores", "p1Time", "p2Time", "eloChange"
         FROM "VersusMatch" WHERE id = $1 FOR UPDATE`,
        matchId
      )

      if (!match) {
        throw new Error('MATCH_NOT_FOUND')
      }
      if (match.status !== 'active') {
        throw new Error('MATCH_NOT_ACTIVE')
      }

      const isPlayer1 = match.player1Id === userId
      const isPlayer2 = match.player2Id === userId
      if (!isPlayer1 && !isPlayer2) {
        throw new Error('FORBIDDEN')
      }

      // Prevent double-submission
      if (isPlayer1 && match.p1Scores !== null) {
        throw new Error('ALREADY_SUBMITTED')
      }
      if (isPlayer2 && match.p2Scores !== null) {
        throw new Error('ALREADY_SUBMITTED')
      }

      // Update this player's scores
      const updateData: Record<string, unknown> = isPlayer1
        ? { p1Scores: scores, p1Time: timeTaken }
        : { p2Scores: scores, p2Time: timeTaken }

      let updatedMatch = await tx.versusMatch.update({
        where: { id: matchId },
        data: updateData,
      })

      // Check if both players have now submitted
      const p1Done = updatedMatch.p1Scores !== null
      const p2Done = updatedMatch.p2Scores !== null

      if (p1Done && p2Done) {
        // Both done — resolve the match atomically within this transaction
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
          // Fetch current elos (within the same transaction for consistency)
          const [p1, p2] = await Promise.all([
            tx.user.findUnique({ where: { id: match.player1Id }, select: { elo: true } }),
            tx.user.findUnique({ where: { id: match.player2Id }, select: { elo: true } }),
          ])

          if (p1 && p2) {
            const winnerElo = winnerId === match.player1Id ? p1.elo : p2.elo
            const loserElo = winnerId === match.player1Id ? p2.elo : p1.elo
            const changes = calculateEloChange(winnerElo, loserElo)
            eloChange = changes.winner

            // Update elos atomically
            await tx.user.update({
              where: { id: winnerId },
              data: { elo: { increment: changes.winner } },
            })
            const loserId = winnerId === match.player1Id ? match.player2Id : match.player1Id
            await tx.user.update({
              where: { id: loserId },
              data: { elo: { increment: changes.loser } },
            })
          }
        }

        updatedMatch = await tx.versusMatch.update({
          where: { id: matchId },
          data: { status: 'complete', winnerId, eloChange },
        })
      }

      return {
        status: updatedMatch.status,
        winnerId: updatedMatch.winnerId,
        eloChange: updatedMatch.eloChange,
        p1Done,
        p2Done,
      }
    }, {
      isolationLevel: 'Serializable',
      timeout: 10000,
    })

    // Emit SSE events after the transaction completes successfully
    if (result.status === 'complete') {
      emitMatchEvent(matchId, {
        type: 'match-complete',
        winnerId: result.winnerId,
        eloChange: result.eloChange,
      })
    } else {
      // Notify the opponent that this player has scored
      emitMatchEvent(matchId, {
        type: 'opponent-scored',
        playerId: userId,
      })
    }

    return NextResponse.json({
      status: result.status,
      winnerId: result.winnerId,
      eloChange: result.eloChange,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : ''

    if (message === 'MATCH_NOT_FOUND') {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 })
    }
    if (message === 'MATCH_NOT_ACTIVE') {
      return NextResponse.json({ error: 'Match is not active' }, { status: 400 })
    }
    if (message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (message === 'ALREADY_SUBMITTED') {
      return NextResponse.json({ error: 'Scores already submitted' }, { status: 409 })
    }

    console.error('versus PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
