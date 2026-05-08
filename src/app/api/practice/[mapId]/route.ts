import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/practice/[mapId] — return full practice map with all locations
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ mapId: string }> }
) {
  try {
    const { mapId } = await params

    const map = await prisma.practiceMap.findUnique({
      where: { id: mapId },
    })

    if (!map) {
      return NextResponse.json({ error: 'Practice map not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: map.id,
      name: map.name,
      description: map.description,
      category: map.category,
      difficulty: map.difficulty,
      locations: map.locations,
      isOfficial: map.isOfficial,
      playCount: map.playCount,
    })
  } catch (error) {
    console.error('practice/[mapId] GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/practice/[mapId] — increment playCount by 1
export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ mapId: string }> }
) {
  try {
    const { mapId } = await params

    const map = await prisma.practiceMap.update({
      where: { id: mapId },
      data: { playCount: { increment: 1 } },
    })

    return NextResponse.json({ playCount: map.playCount })
  } catch (error) {
    console.error('practice/[mapId] PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
