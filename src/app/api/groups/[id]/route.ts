import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: groupId } = await params

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        _count: { select: { members: true } },
      },
    })

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    // Members with user info
    const memberRows = await prisma.groupMember.findMany({
      where: { groupId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
            flag: true,
          },
        },
      },
      orderBy: { joinedAt: 'asc' },
    })

    const members = memberRows.map((m: any) => ({
      userId: m.userId,
      username: m.user.username,
      avatar: m.user.avatar,
      flag: m.user.flag,
      role: m.role,
    }))

    // Today's leaderboard: scores for today's puzzle, filtered to group members
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)

    const todaysPuzzle = await prisma.dailyPuzzle.findFirst({
      where: { date: { gte: todayStart, lt: todayEnd } },
      select: { id: true },
    })

    let leaderboard: { rank: number; userId: string; username: string; avatar: string | null; flag: string | null; score: number }[] = []

    if (todaysPuzzle) {
      const memberIds = memberRows.map((m: any) => m.userId)
      const scores = await prisma.score.findMany({
        where: {
          puzzleId: todaysPuzzle.id,
          userId: { in: memberIds },
        },
        orderBy: [{ totalScore: 'desc' }, { timeTaken: 'asc' }],
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
              flag: true,
            },
          },
        },
      })

      leaderboard = scores.map((s: any, idx: number) => ({
        rank: idx + 1,
        userId: s.user.id,
        username: s.user.username,
        avatar: s.user.avatar,
        flag: s.user.flag,
        score: s.totalScore,
      }))
    }

    return NextResponse.json({
      group: {
        id: group.id,
        name: group.name,
        code: group.code,
        isPublic: group.isPublic,
        memberCount: group._count.members,
        createdAt: group.createdAt,
        createdById: group.createdById,
      },
      members,
      leaderboard,
    })
  } catch (error) {
    console.error('groups/[id] GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const { id: groupId } = await params

    const membership = await prisma.groupMember.findUnique({
      where: { userId_groupId: { userId, groupId } },
    })

    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this group' }, { status: 404 })
    }

    if (membership.role === 'admin') {
      return NextResponse.json({ error: 'Admins cannot leave — delete the group instead' }, { status: 403 })
    }

    await prisma.groupMember.delete({
      where: { userId_groupId: { userId, groupId } },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('groups/[id] DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
