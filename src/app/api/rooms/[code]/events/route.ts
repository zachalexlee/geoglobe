import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { subscribeToRoom, type RoomEvent } from '@/lib/room-events'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { code } = await params

  const room = await prisma.multiplayerRoom.findUnique({
    where: { code },
    select: { playerScores: true },
  })

  if (!room) {
    return new Response('Room not found', { status: 404 })
  }

  const playerScores = room.playerScores as Record<string, number[]>
  if (!playerScores[session.user.id]) {
    return new Response('Not a participant', { status: 403 })
  }

  const encoder = new TextEncoder()
  let unsubscribe: (() => void) | null = null
  let heartbeatInterval: ReturnType<typeof setInterval> | null = null

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(
        encoder.encode(`event: connected\ndata: ${JSON.stringify({ code })}\n\n`)
      )

      unsubscribe = subscribeToRoom(code, (event: RoomEvent) => {
        try {
          const data = JSON.stringify(event)
          controller.enqueue(encoder.encode(`event: ${event.type}\ndata: ${data}\n\n`))
        } catch {
          // Stream may be closed
        }
      })

      heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`:heartbeat\n\n`))
        } catch {
          if (heartbeatInterval) clearInterval(heartbeatInterval)
          if (unsubscribe) unsubscribe()
        }
      }, 15000)
    },
    cancel() {
      if (heartbeatInterval) clearInterval(heartbeatInterval)
      if (unsubscribe) unsubscribe()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
