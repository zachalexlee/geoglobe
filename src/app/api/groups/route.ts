import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

async function uniqueCode(): Promise<string> {
  let code = generateCode()
  let attempts = 0
  while (attempts < 10) {
    const existing = await prisma.group.findUnique({ where: { code } })
    if (!existing) return code
    code = generateCode()
    attempts++
  }
  // Fallback: append timestamp chars
  return generateCode() + Date.now().toString(36).slice(-2).toUpperCase()
}

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Get user's groups
    const userGroupMembers = await prisma.groupMember.findMany({
      where: { userId },
      select: { groupId: true },
    })
    const userGroupIds = userGroupMembers.map((m) => m.groupId)

    // Fetch both public groups and user's groups
    const groups = await prisma.group.findMany({
      where: {
        OR: [
          { isPublic: true },
          { id: { in: userGroupIds } },
        ],
      },
      include: {
        _count: { select: { members: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    const result = groups.map((g) => ({
      id: g.id,
      name: g.name,
      code: g.code,
      isPublic: g.isPublic,
      memberCount: g._count.members,
      createdAt: g.createdAt,
      isJoined: userGroupIds.includes(g.id),
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error('groups GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const body = await req.json()
    const { name, isPublic } = body

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Group name is required' }, { status: 400 })
    }

    if (name.trim().length > 50) {
      return NextResponse.json({ error: 'Group name must be 50 characters or less' }, { status: 400 })
    }

    const code = await uniqueCode()

    const group = await prisma.group.create({
      data: {
        name: name.trim(),
        code,
        isPublic: Boolean(isPublic),
        createdById: userId,
        members: {
          create: {
            userId,
            role: 'admin',
          },
        },
      },
      include: {
        _count: { select: { members: true } },
      },
    })

    return NextResponse.json({
      id: group.id,
      name: group.name,
      code: group.code,
      isPublic: group.isPublic,
      memberCount: group._count.members,
      createdAt: group.createdAt,
      isJoined: true,
    }, { status: 201 })
  } catch (error) {
    console.error('groups POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
