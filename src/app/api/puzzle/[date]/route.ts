import { NextRequest, NextResponse } from 'next/server'
import { getDailyCities, getPuzzleNumber } from '@/lib/daily-cities'

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

    // Prevent future puzzle lookups (anti-cheat)
    const requestedDate = new Date(date + 'T00:00:00Z')
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)
    if (requestedDate > today) {
      return NextResponse.json(
        { error: 'Cannot view future puzzles' },
        { status: 403 }
      )
    }

    const cities = getDailyCities(date)
    const puzzleNumber = getPuzzleNumber(date)

    return NextResponse.json(
      {
        id: `daily-${date}`,
        puzzleNumber,
        date: new Date(date).toISOString(),
        locations: cities.map((city, i) => ({
          id: `city-${date}-${i}`,
          order: i + 1,
          name: city.name,
          country: city.country,
          description: `Locate ${city.name} on the globe`,
          imageUrl: null,
          category: null,
          eventDate: null,
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
