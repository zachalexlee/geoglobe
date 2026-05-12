import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { emitRoomEvent } from '@/lib/room-events'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { code } = await params
  const userId = session.user.id
  const body = await req.json()
  const { round, lat, lng } = body as { round: number; lat: number; lng: number }

  if (typeof round !== 'number' || typeof lat !== 'number' || typeof lng !== 'number') {
    return NextResponse.json({ error: 'Invalid body: need round, lat, lng' }, { status: 400 })
  }

  const room = await prisma.multiplayerRoom.findUnique({
    where: { code },
  })

  if (!room) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 })
  }

  if (room.status !== 'playing') {
    return NextResponse.json({ error: 'Game is not in progress' }, { status: 400 })
  }

  const playerScores = room.playerScores as Record<string, number[]>
  if (!playerScores[userId]) {
    return NextResponse.json({ error: 'Not in this room' }, { status: 403 })
  }

  // Calculate score based on distance
  const locations = room.locations as Array<{ name: string; country: string; latitude: number; longitude: number }>
  const target = locations[round]
  if (!target) {
    return NextResponse.json({ error: 'Invalid round' }, { status: 400 })
  }

  const distanceKm = haversineDistance(lat, lng, target.latitude, target.longitude)
  const score = calculateRoomScore(distanceKm)

  playerScores[userId] = playerScores[userId] || []
  playerScores[userId][round] = score

  // Check if game is finished (all players submitted all 5 rounds)
  const allDone = Object.values(playerScores).every((scores) => scores.length === 5 && scores.every((s) => s !== undefined))
  const newStatus = allDone ? 'finished' : 'playing'

  await prisma.multiplayerRoom.update({
    where: { code },
    data: {
      playerScores,
      status: newStatus,
    },
  })

  emitRoomEvent(code, {
    type: allDone ? 'game-finished' : 'score-updated',
    playerId: userId,
    round,
    score,
    distanceKm,
    playerScores,
  })

  return NextResponse.json({ score, distanceKm, totalScores: playerScores })
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}

function calculateRoomScore(distanceKm: number): number {
  // 100 pts for exact, 0 pts for >= 20,000 km
  if (distanceKm <= 0) return 100
  if (distanceKm >= 20000) return 0
  return Math.round(100 * Math.max(0, 1 - distanceKm / 20000) ** 2 * 100) / 100
}
