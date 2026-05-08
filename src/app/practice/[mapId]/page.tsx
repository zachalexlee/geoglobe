'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useGameState } from '@/hooks/useGameState'
import LocationCard from '@/components/game/LocationCard'
import ScoreDisplay from '@/components/game/ScoreDisplay'
import type { Pin, ArcData } from '@/lib/globe-config'
import type { GameLocation } from '@/lib/game-engine'

const GlobeView = dynamic(() => import('@/components/globe/GlobeView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-white/60 text-sm animate-pulse">Loading globe…</div>
    </div>
  ),
})

interface PracticeMapData {
  id: string
  name: string
  description: string | null
  category: string
  difficulty: string
  locations: GameLocation[]
  isOfficial: boolean
  playCount: number
}

// ── Practice-specific finished screen ─────────────────────────────────────────

interface FinishedScreenProps {
  mapName: string
  totalScore: number
  maxScore: number
  onPlayAgain: () => void
}

function FinishedScreen({ mapName, totalScore, maxScore, onPlayAgain }: FinishedScreenProps) {
  const pct = Math.round((totalScore / maxScore) * 100)

  const emoji =
    pct >= 90
      ? '🏆 Incredible!'
      : pct >= 70
      ? '🎉 Great round!'
      : pct >= 50
      ? '👏 Not bad!'
      : '🗺️ Keep exploring!'

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto space-y-6">
        {/* Title */}
        <div className="text-center">
          <p className="text-white/40 text-sm uppercase tracking-widest mb-1">Practice — {mapName}</p>
          <h1 className="text-white text-4xl font-extrabold">{emoji}</h1>
        </div>

        {/* Score card */}
        <div className="bg-white/5 rounded-2xl border border-white/10 p-6 text-center">
          <p className="text-white/50 text-xs uppercase tracking-widest mb-1">Final Score</p>
          <div className="text-white text-6xl font-extrabold tabular-nums">
            {totalScore.toLocaleString()}
          </div>
          <p className="text-white/30 text-sm mt-1">out of {maxScore.toLocaleString()}</p>

          {/* Score bar */}
          <div className="mt-4 h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${pct}%`,
                background: 'linear-gradient(to right, #6366f1, #22c55e)',
              }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onPlayAgain}
            className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold transition-colors"
          >
            ▶ Play Again
          </button>
          <a
            href="/practice"
            className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-center transition-colors"
          >
            ← All Maps
          </a>
        </div>
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function PracticeMapPage() {
  const params = useParams()
  const mapId = params?.mapId as string

  const [mapData, setMapData] = useState<PracticeMapData | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [playKey, setPlayKey] = useState(0) // bump to restart

  const {
    state,
    initGame,
    placePendingGuess,
    confirmGuess,
    nextRound,
    resetPendingGuess,
  } = useGameState()

  // ── Fetch map on mount ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapId) return
    async function loadMap() {
      try {
        const res = await fetch(`/api/practice/${mapId}`)
        if (!res.ok) throw new Error('Map not found')
        const data = await res.json()
        setMapData(data)
      } catch (err) {
        console.error('Failed to load practice map:', err)
        setLoadError('Failed to load practice map.')
      }
    }
    loadMap()
  }, [mapId])

  // ── Init game when map is loaded or play-key changes ──────────────────────
  useEffect(() => {
    if (!mapData) return
    // Assign synthetic IDs & order to each location from the JSON blob
    type RawLoc = { name: string; country: string; lat: number; lng: number; description?: string }
    const rawLocs = mapData.locations as unknown as RawLoc[]
    const locations: GameLocation[] = rawLocs.map((loc, i) => ({
      id: `${mapData.id}-loc-${i}`,
      order: i,
      latitude: loc.lat,
      longitude: loc.lng,
      name: loc.name,
      country: loc.country,
      description: loc.description ?? '',
    }))

    initGame({
      id: mapData.id,
      puzzleNumber: 0,
      date: new Date().toISOString(),
      locations,
    })
  }, [mapData, playKey, initGame])

  // ── Increment play count once when game starts ───────────────────────────
  useEffect(() => {
    if (!mapId || !mapData) return
    fetch(`/api/practice/${mapId}`, { method: 'PATCH' }).catch(() => {})
  }, [mapId, playKey]) // run on each new play

  // ── Globe click handler ──────────────────────────────────────────────────
  const handleGlobeClick = useCallback(
    ({ lat, lng }: { lat: number; lng: number }) => {
      if (state.phase === 'playing') {
        placePendingGuess(lat, lng)
      }
    },
    [state.phase, placePendingGuess]
  )

  // ── Pins ─────────────────────────────────────────────────────────────────
  const pins = useMemo<Pin[]>(() => {
    const result: Pin[] = []

    state.roundResults.forEach((r) => {
      result.push({
        id: `guess-${r.location.id}`,
        lat: r.guess.lat,
        lng: r.guess.lng,
        color: r.color,
        label: `Your guess: ${Math.round(r.distanceKm).toLocaleString()} km away`,
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
        label: 'Your pin (unconfirmed)',
        isGuess: true,
      })
    }

    return result
  }, [state.roundResults, state.pendingGuess])

  // ── Arcs ─────────────────────────────────────────────────────────────────
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
  const lastResult = state.roundResults[state.roundResults.length - 1] ?? null
  const totalRounds = state.locations.length || 10

  // ── Error state ───────────────────────────────────────────────────────────
  if (loadError) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-white/60 text-lg">{loadError}</p>
          <a href="/practice" className="text-indigo-400 hover:text-indigo-300 underline text-sm">
            Back to Practice
          </a>
        </div>
      </div>
    )
  }

  // ── Loading state ─────────────────────────────────────────────────────────
  if (!mapData || !state.puzzleId) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <p className="text-white/50 text-sm animate-pulse">Loading practice map…</p>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      {/* Practice header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-black/80 backdrop-blur-md border-b border-white/10 flex items-center px-4">
        {/* Left: back + title */}
        <div className="flex-1 flex items-center gap-3 min-w-0">
          <a
            href="/practice"
            className="text-white/50 hover:text-white transition-colors text-sm leading-none shrink-0"
          >
            ←
          </a>
          <div className="min-w-0">
            <span className="text-white font-bold text-base truncate block">
              {mapData.name}
            </span>
            <span className="text-white/30 text-xs">
              Practice · {totalRounds} location{totalRounds !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Center: round dots */}
        <div className="flex gap-2 items-center">
          {Array.from({ length: totalRounds }).map((_, i) => {
            const isCompleted = i < state.currentRound
            const isCurrent = i === state.currentRound
            return (
              <span
                key={i}
                className="text-lg leading-none"
                style={{
                  color: isCompleted
                    ? '#22c55e'
                    : isCurrent
                    ? '#ffffff'
                    : 'rgba(255,255,255,0.25)',
                }}
              >
                {isCompleted ? '●' : isCurrent ? '◉' : '○'}
              </span>
            )
          })}
        </div>

        {/* Right: score */}
        <div className="flex-1 flex justify-end">
          <div className="text-right">
            <span className="text-white font-bold text-lg tabular-nums">
              {state.totalScore.toLocaleString()}
            </span>
            <span className="text-white/40 text-xs ml-1">pts</span>
          </div>
        </div>
      </header>

      {/* Globe */}
      <GlobeView
        pins={pins}
        arcs={arcs}
        onGlobeClick={handleGlobeClick}
        disabled={state.phase !== 'playing'}
      />

      {/* Location clue card */}
      {currentLocation && state.phase !== 'final-result' && (
        <LocationCard
          location={currentLocation}
          roundNumber={state.currentRound + 1}
          totalRounds={totalRounds}
        />
      )}

      {/* Pending guess action bar */}
      {state.pendingGuess && state.phase === 'playing' && (
        <div className="fixed bottom-6 inset-x-0 z-40 flex justify-center gap-3 px-4">
          <button
            onClick={resetPendingGuess}
            className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium border border-white/10 transition-colors"
          >
            ✕ Reset pin
          </button>
          <button
            onClick={confirmGuess}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-sm font-bold transition-colors shadow-lg"
          >
            ✓ Confirm guess
          </button>
        </div>
      )}

      {/* Round result overlay */}
      {state.phase === 'round-result' && lastResult && (
        <ScoreDisplay
          distanceKm={lastResult.distanceKm}
          score={lastResult.score}
          color={lastResult.color}
          onDismiss={nextRound}
        />
      )}

      {/* Finished screen */}
      {state.phase === 'final-result' && (
        <FinishedScreen
          mapName={mapData.name}
          totalScore={state.totalScore}
          maxScore={totalRounds * 1000}
          onPlayAgain={() => setPlayKey((k) => k + 1)}
        />
      )}
    </div>
  )
}
