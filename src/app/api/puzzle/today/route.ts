import { NextResponse } from 'next/server'
import { getTodaysPuzzle } from '@/lib/puzzle-generator'

export async function GET() {
  try {
    const puzzle = await getTodaysPuzzle()

    if (!puzzle) {
      return NextResponse.json({ error: 'No puzzle found for today' }, { status: 404 })
    }

    return NextResponse.json(
      {
        id: puzzle.id,
        puzzleNumber: puzzle.puzzleNumber,
        date: puzzle.date.toISOString(),
        locations: puzzle.locations.map((loc: any) => ({
          id: loc.id,
          order: loc.order,
          latitude: loc.latitude,
          longitude: loc.longitude,
          name: loc.name,
          country: loc.country,
          description: loc.description,
          imageUrl: loc.imageUrl ?? null,
          category: loc.category ?? null,
          eventDate: loc.eventDate ?? null,
        })),
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=300',
        },
      }
    )
  } catch (error) {
    console.error('puzzle/today error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
