import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { haversineDistance, calculateScore, proximityColor } from '@/lib/game-engine'
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

    // Fetch the puzzle and get the specific location for this round
    const puzzle = await prisma.dailyPuzzle.findUnique({
      where: { id: puzzleId },
      include: { locations: { orderBy: { order: 'asc' } } },
    })

    if (!puzzle) {
      return NextResponse.json({ error: 'Puzzle not found' }, { status: 404 })
    }

    const location = puzzle.locations[round]
    if (!location) {
      return NextResponse.json({ error: 'Invalid round number' }, { status: 400 })
    }

    // Compute distance and score SERVER-SIDE
    const distance = haversineDistance(
      guessLat,
      guessLng,
      location.latitude,
      location.longitude
    )
    const score = calculateScore(distance)
    const color = proximityColor(distance)

    // Store the validated guess server-side
    storeGuess(userId, puzzleId, {
      round,
      guessLat,
      guessLng,
      actualLat: location.latitude,
      actualLng: location.longitude,
      distance,
      score,
      timestamp: Date.now(),
    })

    // Return the result — revealing the actual location only AFTER the guess
    return NextResponse.json({
      distance: Math.round(distance * 100) / 100,
      score,
      color,
      actualLat: location.latitude,
      actualLng: location.longitude,
      locationName: location.name,
      locationCountry: location.country,
    })
  } catch (error) {
    console.error('guess POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
