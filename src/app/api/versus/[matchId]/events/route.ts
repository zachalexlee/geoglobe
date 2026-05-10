import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { subscribeToMatch, type MatchEvent } from '@/lib/versus-events'

// ── SSE endpoint for real-time match events ─────────────────────────────────────
// Clients connect here to receive 'match-ready', 'opponent-scored', 'match-complete'
// events without polling.

export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { matchId } = await params
  const userId = session.user.id

  // Verify the user is a participant in this match
  const match = await prisma.versusMatch.findUnique({
    where: { id: matchId },
    select: { player1Id: true, player2Id: true },
  })

  if (!match) {
    return new Response('Match not found', { status: 404 })
  }
  if (match.player1Id !== userId && match.player2Id !== userId) {
    return new Response('Forbidden', { status: 403 })
  }

  // Create a readable stream for SSE
  const encoder = new TextEncoder()
  let unsubscribe: (() => void) | null = null
  let heartbeatInterval: ReturnType<typeof setInterval> | null = null

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection event
      controller.enqueue(
        encoder.encode(`event: connected\ndata: ${JSON.stringify({ matchId })}\n\n`)
      )

      // Subscribe to match events
      unsubscribe = subscribeToMatch(matchId, (event: MatchEvent) => {
        try {
          const data = JSON.stringify(event)
          controller.enqueue(encoder.encode(`event: ${event.type}\ndata: ${data}\n\n`))
        } catch {
          // Stream may be closed
        }
      })

      // Heartbeat every 15s to keep the connection alive through proxies
      heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`:heartbeat\n\n`))
        } catch {
          // Stream closed
          if (heartbeatInterval) clearInterval(heartbeatInterval)
          if (unsubscribe) unsubscribe()
        }
      }, 15000)
    },
    cancel() {
      // Client disconnected
      if (heartbeatInterval) clearInterval(heartbeatInterval)
      if (unsubscribe) unsubscribe()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable Nginx buffering (Railway uses Nginx)
    },
  })
}
