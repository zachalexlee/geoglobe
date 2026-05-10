import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { haversineDistance, calculateScore, proximityColor } from '@/lib/game-engine'
import { getDailyCities, todayDateStr } from '@/lib/daily-cities'
import { storeGuess, hasGuessForRound } from '@/lib/guess-store'

interface GuessBody {
  puzzleId: string
  round: number      // 0-4
  guessLat: number
  guessLng: number
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: GuessBody = await req.json()
    const { puzzleId, round, guessLat, guessLng } = body

    // Validate input
    if (
      !puzzleId ||
      typeof round !== 'number' ||
      round < 0 ||
      round > 4 ||
      typeof guessLat !== 'number' ||
      typeof guessLng !== 'number' ||
      guessLat < -90 ||
      guessLat > 90 ||
      guessLng < -180 ||
      guessLng > 180
    ) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const userId = session.user.id

    // Prevent duplicate guesses for the same round
    if (hasGuessForRound(userId, puzzleId, round)) {
      return NextResponse.json(
        { error: 'Guess already submitted for this round' },
        { status: 409 }
      )
    }

    // Extract the date from the puzzleId (format: "daily-YYYY-MM-DD")
    const dateStr = puzzleId.startsWith('daily-') 
      ? puzzleId.slice(6) 
      : todayDateStr()

    // Get today's cities and find the one for this round
    const cities = getDailyCities(dateStr)
    const city = cities[round]

    if (!city) {
      return NextResponse.json({ error: 'Invalid round number' }, { status: 400 })
    }

    // Compute distance and score SERVER-SIDE
    const distance = haversineDistance(
      guessLat,
      guessLng,
      city.latitude,
      city.longitude
    )
    const score = calculateScore(distance)
    const color = proximityColor(distance)

    // Store the validated guess server-side
    storeGuess(userId, puzzleId, {
      round,
      guessLat,
      guessLng,
      actualLat: city.latitude,
      actualLng: city.longitude,
      distance,
      score,
      timestamp: Date.now(),
    })

    // Return the result — revealing the actual location only AFTER the guess
    return NextResponse.json({
      distance: Math.round(distance * 100) / 100,
      score,
      color,
      actualLat: city.latitude,
      actualLng: city.longitude,
      locationName: city.name,
      locationCountry: city.country,
    })
  } catch (error) {
    console.error('guess POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
