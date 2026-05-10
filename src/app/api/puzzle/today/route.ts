import { NextResponse } from 'next/server'
import { getDailyCities, todayDateStr, getPuzzleNumber } from '@/lib/daily-cities'

export async function GET() {
  try {
    const dateStr = todayDateStr()
    const cities = getDailyCities(dateStr)
    const puzzleNumber = getPuzzleNumber(dateStr)

    return NextResponse.json(
      {
        id: `daily-${dateStr}`,
        puzzleNumber,
        date: new Date(dateStr).toISOString(),
        locations: cities.map((city, i) => ({
          id: `city-${dateStr}-${i}`,
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
    console.error('puzzle/today error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
