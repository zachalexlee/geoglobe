import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { matchId } = await params
    const userId = session.user.id

    const match = await prisma.versusMatch.findUnique({
      where: { id: matchId },
    })

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 })
    }

    // Only the creator (player1) can cancel
    if (match.player1Id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (match.status !== 'pending') {
      return NextResponse.json({ error: 'Can only cancel pending matches' }, { status: 400 })
    }

    await prisma.versusMatch.update({
      where: { id: matchId },
      data: { status: 'cancelled' },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('versus cancel POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
