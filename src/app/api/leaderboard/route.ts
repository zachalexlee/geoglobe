import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { todayDateStr } from '@/lib/daily-cities'

export interface LeaderboardEntry {
  rank: number
  userId: string
  username: string
  avatar: string | null
  flag: string | null
  score: number
  streak: number
  elo: number
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') ?? 'global'
    const region = searchParams.get('region') ?? null
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 100)

    let entries: LeaderboardEntry[] = []

    if (type === 'global' || type === 'regional') {
      // Top scores for today's puzzle, optionally filtered by region
      const todaysPuzzleId = `daily-${todayDateStr()}`

      if (!todaysPuzzleId) {
        return NextResponse.json([])
      }

      const scores = await prisma.score.findMany({
        where: {
          puzzleId: todaysPuzzleId,
          ...(type === 'regional' && region
            ? { user: { region } }
            : {}),
        },
        orderBy: [
          { totalScore: 'desc' },
          { timeTaken: 'asc' },
        ],
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
              flag: true,
              streak: true,
              elo: true,
            },
          },
        },
      })

      entries = scores.map((s: any, idx: number) => ({
        rank: idx + 1,
        userId: s.user.id,
        username: s.user.username,
        avatar: s.user.avatar,
        flag: s.user.flag,
        score: s.totalScore,
        streak: s.user.streak,
        elo: s.user.elo,
      }))
    } else if (type === 'monthly') {
      // Sum of totalScore this calendar month, grouped by userId
      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)

      // Use Prisma groupBy to sum scores per user this month
      const grouped = await prisma.score.groupBy({
        by: ['userId'],
        where: {
          createdAt: { gte: monthStart, lt: monthEnd },
        },
        _sum: { totalScore: true },
        orderBy: { _sum: { totalScore: 'desc' } },
        take: limit,
      })

      // Fetch user data for matched userIds
      const userIds = grouped.map((g: any) => g.userId)
      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: {
          id: true,
          username: true,
          avatar: true,
          flag: true,
          streak: true,
          elo: true,
        },
      })

      const userMap = new Map(users.map((u: any) => [u.id, u]))

      entries = grouped
        .map((g: any, idx: number) => {
          const user = userMap.get(g.userId)
          if (!user) return null
          return {
            rank: idx + 1,
            userId: user.id,
            username: user.username,
            avatar: user.avatar,
            flag: user.flag,
            score: g._sum.totalScore ?? 0,
            streak: user.streak,
            elo: user.elo,
          }
        })
        .filter((e): e is LeaderboardEntry => e !== null)
    } else if (type === 'streaks') {
      // Top users by current streak
      const users = await prisma.user.findMany({
        where: { streak: { gt: 0 } },
        orderBy: { streak: 'desc' },
        take: limit,
        select: {
          id: true,
          username: true,
          avatar: true,
          flag: true,
          streak: true,
          elo: true,
        },
      })

      entries = users.map((u: any, idx: number) => ({
        rank: idx + 1,
        userId: u.id,
        username: u.username,
        avatar: u.avatar,
        flag: u.flag,
        score: 0, // n/a for streaks view
        streak: u.streak,
        elo: u.elo,
      }))
    } else if (type === 'elo') {
      // Top users by ELO rating
      const users = await prisma.user.findMany({
        orderBy: { elo: 'desc' },
        take: limit,
        select: {
          id: true,
          username: true,
          avatar: true,
          flag: true,
          streak: true,
          elo: true,
        },
      })

      entries = users.map((u: any, idx: number) => ({
        rank: idx + 1,
        userId: u.id,
        username: u.username,
        avatar: u.avatar,
        flag: u.flag,
        score: 0,
        streak: u.streak,
        elo: u.elo,
      }))
    } else {
      return NextResponse.json({ error: 'Invalid leaderboard type' }, { status: 400 })
    }

    return NextResponse.json(entries, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
      },
    })
  } catch (error) {
    console.error('leaderboard GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
