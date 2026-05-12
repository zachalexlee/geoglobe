import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/practice?category=capitals|countries|themed|custom&difficulty=easy|medium|hard
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category') ?? undefined
    const difficulty = searchParams.get('difficulty') ?? undefined

    const maps = await prisma.practiceMap.findMany({
      where: {
        ...(category ? { category } : {}),
        ...(difficulty ? { difficulty } : {}),
      },
      orderBy: [{ isOfficial: 'desc' }, { playCount: 'desc' }],
    })

    const result = maps.map((m: any) => ({
      id: m.id,
      name: m.name,
      description: m.description,
      category: m.category,
      difficulty: m.difficulty,
      locationCount: Array.isArray(m.locations) ? (m.locations as unknown[]).length : 0,
      playCount: m.playCount,
      isOfficial: m.isOfficial,
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error('practice GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/practice — create a custom practice map (auth required)
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, description, category, difficulty, locations } = body

    if (!name || !category || !difficulty || !Array.isArray(locations) || locations.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (locations.length < 5) {
      return NextResponse.json({ error: 'Minimum 5 cities required' }, { status: 400 })
    }
    if (locations.length > 20) {
      return NextResponse.json({ error: 'Maximum 20 cities allowed' }, { status: 400 })
    }

    const VALID_CATEGORIES = ['capitals', 'countries', 'themed', 'custom']
    const VALID_DIFFICULTIES = ['easy', 'medium', 'hard']

    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
    }
    if (!VALID_DIFFICULTIES.includes(difficulty)) {
      return NextResponse.json({ error: 'Invalid difficulty' }, { status: 400 })
    }

    const map = await prisma.practiceMap.create({
      data: {
        name,
        description: description ?? null,
        category,
        difficulty,
        locations,
        isOfficial: false,
        createdById: session.user.id,
      },
    })

    return NextResponse.json(
      {
        id: map.id,
        name: map.name,
        description: map.description,
        category: map.category,
        difficulty: map.difficulty,
        locationCount: (map.locations as unknown[]).length,
        playCount: map.playCount,
        isOfficial: map.isOfficial,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('practice POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
