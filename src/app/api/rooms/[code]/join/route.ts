import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { emitRoomEvent } from '@/lib/room-events'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { code } = await params
  const userId = session.user.id

  const room = await prisma.multiplayerRoom.findUnique({
    where: { code },
  })

  if (!room) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 })
  }

  if (room.status !== 'waiting') {
    return NextResponse.json({ error: 'Game already started' }, { status: 400 })
  }

  const playerScores = room.playerScores as Record<string, number[]>

  if (Object.keys(playerScores).length >= room.maxPlayers) {
    return NextResponse.json({ error: 'Room is full' }, { status: 400 })
  }

  if (playerScores[userId]) {
    return NextResponse.json({ message: 'Already in room' })
  }

  playerScores[userId] = []

  await prisma.multiplayerRoom.update({
    where: { code },
    data: { playerScores },
  })

  // Emit SSE event
  emitRoomEvent(code, {
    type: 'player-joined',
    playerId: userId,
    playerCount: Object.keys(playerScores).length,
  })

  return NextResponse.json({ message: 'Joined', playerCount: Object.keys(playerScores).length })
}
