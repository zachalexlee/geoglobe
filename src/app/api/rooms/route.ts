import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { WORLD_CITIES } from '@/lib/cities'

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

function pickRandomCities(count: number) {
  const pool = [...WORLD_CITIES]
  const picked = []
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * pool.length)
    picked.push(pool[idx])
    pool.splice(idx, 1)
  }
  return picked
}

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Generate a unique 6-char code
  let code = generateRoomCode()
  let attempts = 0
  while (attempts < 10) {
    const existing = await prisma.multiplayerRoom.findUnique({ where: { code } })
    if (!existing) break
    code = generateRoomCode()
    attempts++
  }

  const locations = pickRandomCities(5)

  const room = await prisma.multiplayerRoom.create({
    data: {
      code,
      hostId: session.user.id,
      status: 'waiting',
      maxPlayers: 8,
      locations: locations as unknown as Record<string, unknown>[],
      playerScores: { [session.user.id]: [] },
    },
  })

  return NextResponse.json({ code: room.code, id: room.id })
}
