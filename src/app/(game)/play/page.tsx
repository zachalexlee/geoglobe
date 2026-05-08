import { getTodaysPuzzle } from '@/lib/puzzle-generator'
import PlayClient from './PlayClient'

export const dynamic = 'force-dynamic'

export default async function PlayPage() {
  const puzzle = await getTodaysPuzzle()

  if (!puzzle) {
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <p className="text-white/50 text-sm">No puzzle available today. Check back tomorrow!</p>
      </div>
    )
  }

  const puzzleData = {
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
  }

  return <PlayClient puzzle={puzzleData} />
}
