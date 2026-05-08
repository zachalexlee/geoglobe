'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'
import {
  haversineDistance,
  calculateScore,
  proximityColor,
  type GameLocation,
  type RoundResult,
} from '@/lib/game-engine'
import type { Pin, ArcData } from '@/lib/globe-config'
import LocationCard from '@/components/game/LocationCard'
import ScoreDisplay from '@/components/game/ScoreDisplay'

const GlobeView = dynamic(() => import('@/components/globe/GlobeView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-white/60 text-sm animate-pulse">Loading globe…</div>
    </div>
  ),
})

const TOTAL_ROUNDS = 5
const ROUND_TIME = 25 // seconds

interface Player {
  id: string
  username: string
  avatar?: string | null
  elo: number
}

interface VersusGameProps {
  matchId: string
  locations: GameLocation[]
  currentUserId: string
  player1: Player
  player2: Player
  onGameComplete: (scores: number[], distances: number[], timeTaken: number) => void
}

export default function VersusGame({
  matchId,
  locations,
  currentUserId,
  player1,
  player2,
  onGameComplete,
}: VersusGameProps) {
  const [currentRound, setCurrentRound] = useState(0)
  const [phase, setPhase] = useState<'playing' | 'round-result' | 'submitting' | 'done'>('playing')
  const [pendingGuess, setPendingGuess] = useState<{ lat: number; lng: number } | null>(null)
  const [roundResults, setRoundResults] = useState<RoundResult[]>([])
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME)
  const [opponentScores, setOpponentScores] = useState<number[] | null>(null)
  const [gameStartTime] = useState(() => Date.now())

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const submittedRef = useRef(false)

  // Determine if we're player1 or player2
  const isPlayer1 = currentUserId === player1.id
  const opponent = isPlayer1 ? player2 : player1

  // ── Timer per round ────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'playing') return

    setTimeLeft(ROUND_TIME)
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!)
          // Auto-confirm or skip: place a random off-center guess if no pending
          return 0
        }
        return t - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [phase, currentRound])

  // When timer hits 0, auto-confirm (with a random guess if none placed)
  useEffect(() => {
    if (timeLeft === 0 && phase === 'playing') {
      const guess = pendingGuess ?? { lat: 0, lng: 0 }
      confirmGuessWithCoords(guess)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft])

  // ── Poll opponent's scores ─────────────────────────────────────────────────
  useEffect(() => {
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/versus/${matchId}`)
        if (!res.ok) return
        const data = await res.json()
        const scores = isPlayer1 ? data.p2Scores : data.p1Scores
        if (scores) setOpponentScores(scores)
      } catch {
        // ignore
      }
    }, 3000)

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [matchId, isPlayer1])

  // ── Globe click ────────────────────────────────────────────────────────────
  const handleGlobeClick = useCallback(
    ({ lat, lng }: { lat: number; lng: number }) => {
      if (phase === 'playing') {
        setPendingGuess({ lat, lng })
      }
    },
    [phase]
  )

  // ── Confirm guess ──────────────────────────────────────────────────────────
  function confirmGuessWithCoords(guess: { lat: number; lng: number }) {
    if (timerRef.current) clearInterval(timerRef.current)

    const location = locations[currentRound]
    if (!location) return

    const distanceKm = haversineDistance(guess.lat, guess.lng, location.latitude, location.longitude)
    const score = calculateScore(distanceKm)
    const color = proximityColor(distanceKm)

    const result: RoundResult = {
      location,
      guess,
      distanceKm,
      score,
      color,
    }

    setRoundResults((prev) => [...prev, result])
    setPendingGuess(null)
    setPhase('round-result')
  }

  function handleConfirmGuess() {
    if (!pendingGuess || phase !== 'playing') return
    confirmGuessWithCoords(pendingGuess)
  }

  // ── Next round ─────────────────────────────────────────────────────────────
  function handleNextRound() {
    const nextRound = currentRound + 1
    if (nextRound >= TOTAL_ROUNDS) {
      // Done — submit scores
      if (!submittedRef.current) {
        submittedRef.current = true
        if (pollRef.current) clearInterval(pollRef.current)
        const scores = [...roundResults].map((r) => r.score)
        // append last result score if needed
        const distances = roundResults.map((r) => r.distanceKm)
        const timeTaken = Math.round((Date.now() - gameStartTime) / 1000)
        setPhase('done')
        onGameComplete(scores, distances, timeTaken)
      }
    } else {
      setCurrentRound(nextRound)
      setPhase('playing')
    }
  }

  // ── Pins & arcs ────────────────────────────────────────────────────────────
  const pins = useMemo<Pin[]>(() => {
    const result: Pin[] = []
    roundResults.forEach((r) => {
      result.push({
        id: `guess-${r.location.id}`,
        lat: r.guess.lat,
        lng: r.guess.lng,
        color: r.color,
        label: `Your guess: ${Math.round(r.distanceKm).toLocaleString()} km`,
        isGuess: true,
      })
      result.push({
        id: `correct-${r.location.id}`,
        lat: r.location.latitude,
        lng: r.location.longitude,
        color: '#ffffff',
        label: r.location.name,
        isCorrect: true,
      })
    })
    if (pendingGuess) {
      result.push({
        id: 'pending',
        lat: pendingGuess.lat,
        lng: pendingGuess.lng,
        color: '#818cf8',
        label: 'Your pin (unconfirmed)',
        isGuess: true,
      })
    }
    return result
  }, [roundResults, pendingGuess])

  const arcs = useMemo<ArcData[]>(() => {
    return roundResults.map((r) => ({
      startLat: r.guess.lat,
      startLng: r.guess.lng,
      endLat: r.location.latitude,
      endLng: r.location.longitude,
      color: r.color,
    }))
  }, [roundResults])

  const currentLocation = locations[currentRound] ?? null
  const lastResult = roundResults[roundResults.length - 1] ?? null
  const myTotalScore = roundResults.reduce((a, b) => a + b.score, 0)
  const opponentTotal = opponentScores ? opponentScores.reduce((a, b) => a + b, 0) : null

  const timerColor =
    timeLeft > 10 ? 'text-white' : timeLeft > 5 ? 'text-amber-400' : 'text-red-400'

  if (phase === 'done') {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-white text-center space-y-3">
          <div className="animate-spin text-4xl">⏳</div>
          <p className="text-lg font-bold">Scores submitted!</p>
          <p className="text-white/50 text-sm">Waiting for results…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Versus header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-black/80 backdrop-blur-md border-b border-white/10 flex items-center px-4 gap-3">
        {/* Player scores */}
        <div className="flex-1 flex items-center gap-2">
          <span className="text-white/60 text-xs font-medium truncate max-w-[80px]">
            {isPlayer1 ? player1.username : player2.username}
          </span>
          <span className="text-white font-bold tabular-nums">
            {myTotalScore.toLocaleString()}
          </span>
        </div>

        {/* Center: round dots + timer */}
        <div className="flex flex-col items-center">
          <div className="flex gap-1.5">
            {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
              <span
                key={i}
                className="text-base leading-none"
                style={{
                  color:
                    i < currentRound
                      ? '#22c55e'
                      : i === currentRound
                      ? '#ffffff'
                      : 'rgba(255,255,255,0.2)',
                }}
              >
                {i < currentRound ? '●' : i === currentRound ? '◉' : '○'}
              </span>
            ))}
          </div>
          {phase === 'playing' && (
            <span className={`text-xs font-mono font-bold tabular-nums ${timerColor}`}>
              {timeLeft}s
            </span>
          )}
        </div>

        {/* Opponent score */}
        <div className="flex-1 flex items-center justify-end gap-2">
          {opponentTotal !== null && (
            <span className="text-indigo-400 font-bold tabular-nums">
              {opponentTotal.toLocaleString()}
            </span>
          )}
          <span className="text-white/60 text-xs font-medium truncate max-w-[80px] text-right">
            {opponent.username}
          </span>
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold">
            ⚔️
          </div>
        </div>
      </header>

      {/* Globe */}
      <GlobeView
        pins={pins}
        arcs={arcs}
        onGlobeClick={handleGlobeClick}
        disabled={phase !== 'playing'}
      />

      {/* Location clue */}
      {currentLocation && phase === 'playing' && (
        <LocationCard
          location={currentLocation}
          roundNumber={currentRound + 1}
          totalRounds={TOTAL_ROUNDS}
        />
      )}

      {/* Pending guess controls */}
      {pendingGuess && phase === 'playing' && (
        <div className="fixed bottom-6 inset-x-0 z-40 flex justify-center gap-3 px-4">
          <button
            onClick={() => setPendingGuess(null)}
            className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium border border-white/10 transition-colors"
          >
            ✕ Reset pin
          </button>
          <button
            onClick={handleConfirmGuess}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-sm font-bold transition-colors shadow-lg"
          >
            ✓ Confirm guess
          </button>
        </div>
      )}

      {/* No guess placed — timer running low */}
      {!pendingGuess && phase === 'playing' && timeLeft <= 5 && (
        <div className="fixed bottom-6 inset-x-0 z-40 flex justify-center px-4">
          <div className="px-5 py-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-medium animate-pulse">
            Click on the globe to place your pin!
          </div>
        </div>
      )}

      {/* Round result overlay */}
      {phase === 'round-result' && lastResult && (
        <ScoreDisplay
          distanceKm={lastResult.distanceKm}
          score={lastResult.score}
          color={lastResult.color}
          onDismiss={handleNextRound}
        />
      )}
    </div>
  )
}
