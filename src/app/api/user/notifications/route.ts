import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/user/notifications — get notification preferences
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        notifyEmail: true,
        notifyPush: true,
        timezone: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('notifications GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/user/notifications — update notification preferences
export async function PUT(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { notifyEmail, notifyPush, timezone } = body

    const data: Record<string, unknown> = {}
    if (typeof notifyEmail === 'boolean') data.notifyEmail = notifyEmail
    if (typeof notifyPush === 'boolean') data.notifyPush = notifyPush
    if (typeof timezone === 'string' && timezone.length > 0) data.timezone = timezone

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data,
      select: {
        notifyEmail: true,
        notifyPush: true,
        timezone: true,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('notifications PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
