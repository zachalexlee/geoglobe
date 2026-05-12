import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { WORLD_CITIES } from '@/lib/cities'

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Pick 5 random cities
    const pool = [...WORLD_CITIES]
    const cities = []
    for (let i = 0; i < 5; i++) {
      const idx = Math.floor(Math.random() * pool.length)
      cities.push({
        name: pool[idx].name,
        country: pool[idx].country,
        lat: pool[idx].latitude,
        lng: pool[idx].longitude,
      })
      pool.splice(idx, 1)
    }

    // Generate unique code (retry if collision)
    let code = generateCode()
    let attempts = 0
    while (attempts < 5) {
      const existing = await prisma.challenge.findUnique({ where: { code } })
      if (!existing) break
      code = generateCode()
      attempts++
    }

    const challenge = await prisma.challenge.create({
      data: {
        code,
        createdById: userId,
        locations: cities,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    })

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin
    const challengeUrl = `${baseUrl}/challenge/${challenge.code}`

    return NextResponse.json({
      code: challenge.code,
      url: challengeUrl,
      locations: cities.length,
    }, { status: 201 })
  } catch (error) {
    console.error('challenge POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
