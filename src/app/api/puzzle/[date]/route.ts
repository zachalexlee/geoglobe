import { NextRequest, NextResponse } from 'next/server'
import { getPuzzleByDate } from '@/lib/puzzle-generator'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  try {
    const { date } = await params
    // Validate format: YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      )
    }

    const puzzle = await getPuzzleByDate(date)

    if (!puzzle) {
      return NextResponse.json(
        { error: `No puzzle found for date ${date}` },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        id: puzzle.id,
        puzzleNumber: puzzle.puzzleNumber,
        date: puzzle.date.toISOString(),
        locations: puzzle.locations.map((loc) => ({
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
    console.error('puzzle/[date] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
