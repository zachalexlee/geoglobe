import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const body = await req.json()
    const { code } = body

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Join code is required' }, { status: 400 })
    }

    const group = await prisma.group.findUnique({
      where: { code: code.trim().toUpperCase() },
      include: { _count: { select: { members: true } } },
    })

    if (!group) {
      return NextResponse.json({ error: 'Invalid join code' }, { status: 404 })
    }

    // Check if already a member
    const existing = await prisma.groupMember.findUnique({
      where: { userId_groupId: { userId, groupId: group.id } },
    })

    if (existing) {
      return NextResponse.json({ error: 'Already a member of this group' }, { status: 409 })
    }

    await prisma.groupMember.create({
      data: {
        userId,
        groupId: group.id,
        role: 'member',
      },
    })

    return NextResponse.json({
      id: group.id,
      name: group.name,
      code: group.code,
      isPublic: group.isPublic,
      memberCount: group._count.members + 1,
      createdAt: group.createdAt,
      isJoined: true,
    }, { status: 201 })
  } catch (error) {
    console.error('groups/join POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
