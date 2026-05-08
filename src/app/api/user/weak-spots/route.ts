import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { analyzeWeakSpots, getRecommendations } from '@/lib/weak-spots'

// GET /api/user/weak-spots
// Returns weak-spot analysis + recommended practice maps for the authenticated user.
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Run weak-spot analysis (last 30 games)
    const weakSpots = await analyzeWeakSpots(userId, prisma)

    // Fetch all practice maps to rank them
    const allMaps = await prisma.practiceMap.findMany({
      orderBy: [{ isOfficial: 'desc' }, { playCount: 'desc' }],
    })

    // Serialise maps to the shape the client expects
    const serialisedMaps = allMaps.map((m: {
      id: string
      name: string
      description: string | null
      category: string
      difficulty: string
      locations: unknown
      isOfficial: boolean
      playCount: number
    }) => ({
      id: m.id,
      name: m.name,
      description: m.description,
      category: m.category,
      difficulty: m.difficulty,
      locationCount: Array.isArray(m.locations) ? (m.locations as unknown[]).length : 0,
      playCount: m.playCount,
      isOfficial: m.isOfficial,
    }))

    // Get personalised recommendations (sorted by weak-spot relevance)
    const recommendedMaps = getRecommendations(
      { weakCategories: weakSpots.weakCategories, weakRegions: weakSpots.weakRegions },
      serialisedMaps
    )

    return NextResponse.json({
      weakCategories: weakSpots.weakCategories,
      weakRegions: weakSpots.weakRegions,
      avgScore: weakSpots.avgScore,
      totalGames: weakSpots.totalGames,
      categoryStats: weakSpots.categoryStats,
      regionStats: weakSpots.regionStats,
      recommendedMaps,
    })
  } catch (error) {
    console.error('weak-spots GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
