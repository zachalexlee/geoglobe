import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params

    if (!code || code.length !== 6) {
      return NextResponse.json({ error: 'Invalid challenge code' }, { status: 400 })
    }

    const challenge = await prisma.challenge.findUnique({
      where: { code },
    })

    if (!challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 })
    }

    // Check expiry
    if (challenge.expiresAt && new Date() > challenge.expiresAt) {
      return NextResponse.json({ error: 'Challenge has expired' }, { status: 410 })
    }

    return NextResponse.json({
      code: challenge.code,
      locations: challenge.locations,
      createdAt: challenge.createdAt.toISOString(),
      createdById: challenge.createdById,
    })
  } catch (error) {
    console.error('challenge GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
