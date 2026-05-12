import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { code } = await params

  const room = await prisma.multiplayerRoom.findUnique({
    where: { code },
  })

  if (!room) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 })
  }

  // Don't expose location coordinates to players until game is finished
  const locations = room.status === 'finished'
    ? room.locations
    : (room.locations as Array<Record<string, unknown>>).map((loc) => ({
        name: loc.name,
        country: loc.country,
      }))

  return NextResponse.json({
    id: room.id,
    code: room.code,
    hostId: room.hostId,
    status: room.status,
    maxPlayers: room.maxPlayers,
    locations,
    playerScores: room.playerScores,
    createdAt: room.createdAt,
  })
}
