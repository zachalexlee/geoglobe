'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useGameState } from '@/hooks/useGameState'
import LocationCard from '@/components/game/LocationCard'
import ScoreDisplay from '@/components/game/ScoreDisplay'
import MapStylePicker from '@/components/globe/MapStylePicker'
import { DEFAULT_MAP_STYLE, type Pin, type ArcData, type MapStyle } from '@/lib/globe-config'
import type { GameLocationFull as GameLocation } from '@/hooks/useGameState'
import { WORLD_CITIES } from '@/lib/cities'

const GlobeView = dynamic(() => import('@/components/globe/GlobeView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-white/60 text-sm animate-pulse">Loading globe…</div>
    </div>
  ),
})

// ── Deterministic PRNG (same as daily-cities.ts) ─────────────────────────────

function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function stringSeed(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash + char) | 0
  }
  return Math.abs(hash)
}

function getTimeAttackCities(dateStr: string) {
  const seedStr = `time-attack-${dateStr}`
  const seed = stringSeed(seedStr)
  const rng = mulberry32(seed)
  const pool = [...WORLD_CITIES]
  const picked = []

  for (let i = 0; i < 5; i++) {
    const idx = Math.floor(rng() * pool.length)
    picked.push(pool[idx])
    pool.splice(idx, 1)
  }

  return picked
}

function todayDateStr(): string {
  return new Date().toISOString().split('T')[0]
}

// ── Time Attack constants ────────────────────────────────────────────────────

const TOTAL_TIME = 60 // seconds
const TIME_BONUS_MULTIPLIER = 1.5 // max time bonus multiplier

// ── Main Component ───────────────────────────────────────────────────────────

export default function TimeAttackPage() {
  const [phase, setPhase] = useState<'intro' | 'playing' | 'finished'>('intro')
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME)
  const [mapStyle, setMapStyle] = useState<MapStyle>(DEFAULT_MAP_STYLE)
  const [submitted, setSubmitted] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)

  const dateStr = todayDateStr()
  const puzzleId = `time-attack-${dateStr}`

  const {
    state,
    initGame,
    placePendingGuess,
    confirmGuess,
    nextRound,
    resetPendingGuess,
  } = useGameState()

  // ── Generate cities for today ──────────────────────────────────────────────
  const cities = useMemo(() => getTimeAttackCities(dateStr), [dateStr])

  const startGame = useCallback(() => {
    const locations: GameLocation[] = cities.map((city, i) => ({
      id: `ta-${dateStr}-${i}`,
      order: i,
      latitude: city.latitude,
      longitude: city.longitude,
      name: city.name,
      country: city.country,
      description: `Locate ${city.name} on the globe`,
    }))

    initGame({
      id: puzzleId,
      puzzleNumber: 0,
      date: new Date(dateStr).toISOString(),
      locations,
    })

    setPhase('playing')
    startTimeRef.current = Date.now()
    setTimeLeft(TOTAL_TIME)

    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
      const remaining = Math.max(0, TOTAL_TIME - elapsed)
      setTimeLeft(remaining)

      if (remaining <= 0) {
        clearInterval(timerRef.current!)
        timerRef.current = null
        setPhase('finished')
      }
    }, 100)
  }, [cities, dateStr, initGame, puzzleId])

  // Auto-end when all rounds complete
  useEffect(() => {
    if (state.phase === 'final-result' && phase === 'playing') {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      setPhase('finished')
    }
  }, [state.phase, phase])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  // Auto-advance from round-result after a brief delay in time attack
  useEffect(() => {
    if (phase === 'playing' && state.phase === 'round-result') {
      const t = setTimeout(() => nextRound(), 1500)
      return () => clearTimeout(t)
    }
  }, [phase, state.phase, nextRound])

  // ── Calculate final score with time bonus ─────────────────────────────────
  const elapsedSeconds = TOTAL_TIME - timeLeft
  const timeBonus = phase === 'finished'
    ? 1 + (TIME_BONUS_MULTIPLIER - 1) * (timeLeft / TOTAL_TIME)
    : 1
  const finalScore = phase === 'finished'
    ? Math.round(state.totalScore * timeBonus)
    : state.totalScore

  // ── Submit score ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase === 'finished' && !submitted && state.roundResults.length > 0) {
      setSubmitted(true)
      const distances = state.roundResults.map((r) => r.distanceKm)
      const roundScores = state.roundResults.map((r) => r.score)
      fetch('/api/time-attack/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          puzzleId,
          totalScore: finalScore,
          distances,
          roundScores,
          timeTaken: elapsedSeconds,
        }),
      }).catch(console.error)
    }
  }, [phase, submitted, state.roundResults, puzzleId, finalScore, elapsedSeconds])

  // ── Globe click handler ────────────────────────────────────────────────────
  const handleGlobeClick = useCallback(
    ({ lat, lng }: { lat: number; lng: number }) => {
      if (state.phase === 'playing' && phase === 'playing') {
        placePendingGuess(lat, lng)
      }
    },
    [state.phase, phase, placePendingGuess]
  )

  // ── Pins ───────────────────────────────────────────────────────────────────
  const pins = useMemo<Pin[]>(() => {
    const result: Pin[] = []
    state.roundResults.forEach((r) => {
      result.push({
        id: `guess-${r.location.id}`,
        lat: r.guess.lat,
        lng: r.guess.lng,
        color: r.color,
        label: `${Math.round(r.distanceKm).toLocaleString()} km`,
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
    if (state.pendingGuess) {
      result.push({
        id: 'pending',
        lat: state.pendingGuess.lat,
        lng: state.pendingGuess.lng,
        color: '#818cf8',
        label: 'Your pin',
        isGuess: true,
      })
    }
    return result
  }, [state.roundResults, state.pendingGuess])

  // ── Arcs ───────────────────────────────────────────────────────────────────
  const arcs = useMemo<ArcData[]>(
    () =>
      state.roundResults.map((r) => ({
        startLat: r.guess.lat,
        startLng: r.guess.lng,
        endLat: r.location.latitude,
        endLng: r.location.longitude,
        color: r.color,
      })),
    [state.roundResults]
  )

  const currentLocation = state.locations[state.currentRound] ?? null

  // ── Intro Screen ───────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4">
        <div className="max-w-md mx-auto text-center space-y-6">
          <div className="text-6xl">⏱️</div>
          <h1 className="text-4xl font-extrabold text-white">Time Attack</h1>
          <p className="text-white/60 text-lg leading-relaxed">
            5 cities. 60 seconds. Guess as fast and as accurately as you can!
          </p>
          <div className="bg-zinc-900 border border-white/10 rounded-xl p-4 space-y-2 text-left">
            <p className="text-zinc-400 text-sm">
              <span className="text-white font-semibold">⚡ Speed bonus:</span> Finish faster for a higher multiplier
            </p>
            <p className="text-zinc-400 text-sm">
              <span className="text-white font-semibold">🎯 Score:</span> Proximity score × time bonus
            </p>
            <p className="text-zinc-400 text-sm">
              <span className="text-white font-semibold">🔄 Daily reset:</span> Same cities for everyone each day
            </p>
          </div>
          <button
            onClick={startGame}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-white font-bold text-lg transition-all shadow-lg shadow-amber-900/40"
          >
            ⏱️ Start Time Attack
          </button>
        </div>
      </div>
    )
  }

  // ── Finished Screen ────────────────────────────────────────────────────────
  if (phase === 'finished') {
    const roundsCompleted = state.roundResults.length

    return (
      <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto space-y-6">
          <div className="text-center">
            <p className="text-white/40 text-sm uppercase tracking-widest mb-1">Time Attack</p>
            <h1 className="text-white text-4xl font-extrabold">
              {roundsCompleted === 5 ? '⚡ Complete!' : '⏱️ Time\'s Up!'}
            </h1>
          </div>

          <div className="bg-white/5 rounded-2xl border border-white/10 p-6 text-center">
            <p className="text-white/50 text-xs uppercase tracking-widest mb-1">Final Score</p>
            <div className="text-white text-6xl font-extrabold tabular-nums">
              {finalScore.toLocaleString()}
            </div>
            <p className="text-white/30 text-sm mt-1">
              Base: {state.totalScore} × {timeBonus.toFixed(2)} time bonus
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-zinc-900 border border-white/10 rounded-xl p-3 text-center">
              <p className="text-zinc-500 text-xs">Rounds</p>
              <p className="text-white font-bold text-lg">{roundsCompleted}/5</p>
            </div>
            <div className="bg-zinc-900 border border-white/10 rounded-xl p-3 text-center">
              <p className="text-zinc-500 text-xs">Time Used</p>
              <p className="text-white font-bold text-lg">{elapsedSeconds}s</p>
            </div>
            <div className="bg-zinc-900 border border-white/10 rounded-xl p-3 text-center">
              <p className="text-zinc-500 text-xs">Bonus</p>
              <p className="text-amber-400 font-bold text-lg">×{timeBonus.toFixed(2)}</p>
            </div>
          </div>

          {/* Round breakdown */}
          <div className="bg-zinc-900 border border-white/10 rounded-xl p-4 space-y-2">
            {state.roundResults.map((r, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">{r.location.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500 text-xs">
                    {Math.round(r.distanceKm).toLocaleString()} km
                  </span>
                  <span className="font-bold" style={{ color: r.color }}>
                    +{r.score}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setPhase('intro')
                setTimeLeft(TOTAL_TIME)
                setSubmitted(false)
              }}
              className="flex-1 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white font-bold transition-colors"
            >
              ▶ Play Again
            </button>
            <a
              href="/"
              className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-center transition-colors"
            >
              ← Home
            </a>
          </div>
        </div>
      </div>
    )
  }

  // ── Playing Screen ─────────────────────────────────────────────────────────
  return (
    <div className="relative w-full h-[calc(100vh-3.5rem)]">
      {/* Timer overlay */}
      <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50">
        <div className={[
          'flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-md',
          timeLeft <= 10
            ? 'bg-red-900/80 border-red-500/50 animate-pulse'
            : 'bg-black/70 border-white/10',
        ].join(' ')}>
          <span className="text-lg">⏱️</span>
          <span className={[
            'text-2xl font-extrabold tabular-nums',
            timeLeft <= 10 ? 'text-red-400' : 'text-white',
          ].join(' ')}>
            {timeLeft}s
          </span>
        </div>
      </div>

      {/* Round dots + score */}
      <div className="fixed top-16 right-4 z-50 flex items-center gap-3">
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => {
            const completed = i < state.roundResults.length
            const current = i === state.currentRound && state.phase !== 'final-result'
            return (
              <span
                key={i}
                className="text-sm"
                style={{
                  color: completed ? '#22c55e' : current ? '#ffffff' : 'rgba(255,255,255,0.25)',
                }}
              >
                {completed ? '●' : current ? '◉' : '○'}
              </span>
            )
          })}
        </div>
        <span className="text-white font-bold tabular-nums">{state.totalScore} pts</span>
      </div>

      {/* Globe */}
      <GlobeView
        pins={pins}
        arcs={arcs}
        onGlobeClick={handleGlobeClick}
        disabled={state.phase !== 'playing'}
        mapStyle={mapStyle}
      />

      <MapStylePicker selected={mapStyle} onChange={setMapStyle} />

      {/* Location clue card */}
      {currentLocation && state.phase === 'playing' && (
        <LocationCard
          location={currentLocation}
          roundNumber={state.currentRound + 1}
          totalRounds={5}
        />
      )}

      {/* Pending guess action bar */}
      {state.pendingGuess && state.phase === 'playing' && phase === 'playing' && (
        <div className="fixed bottom-6 inset-x-0 z-40 flex justify-center gap-3 px-4">
          <button
            onClick={resetPendingGuess}
            className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium border border-white/10 transition-colors"
          >
            ✕ Reset
          </button>
          <button
            onClick={confirmGuess}
            className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white text-sm font-bold transition-colors shadow-lg"
          >
            ✓ Confirm
          </button>
        </div>
      )}

      {/* Round result (brief flash — auto-dismissed) */}
      {state.phase === 'round-result' && state.roundResults.length > 0 && (
        <ScoreDisplay
          distanceKm={state.roundResults[state.roundResults.length - 1].distanceKm}
          score={state.roundResults[state.roundResults.length - 1].score}
          color={state.roundResults[state.roundResults.length - 1].color}
        />
      )}
    </div>
  )
}
