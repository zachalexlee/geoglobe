import { getDailyCities, todayDateStr, getPuzzleNumber } from '@/lib/daily-cities'
import PlayClient from './PlayClient'

export const dynamic = 'force-dynamic'

export default async function PlayPage() {
  const dateStr = todayDateStr()
  const cities = getDailyCities(dateStr)
  const puzzleNumber = getPuzzleNumber(dateStr)

  // SECURITY: Only send city names to the client — NO coordinates.
  // The lat/lng are only revealed after each guess via /api/guess.
  const puzzleData = {
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
  }

  return <PlayClient puzzle={puzzleData} />
}
