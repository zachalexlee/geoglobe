'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { useGameState } from '@/hooks/useGameState'
import LocationCard from '@/components/game/LocationCard'
import ScoreDisplay from '@/components/game/ScoreDisplay'
import MapStylePicker from '@/components/globe/MapStylePicker'
import { DEFAULT_MAP_STYLE, type Pin, type ArcData, type MapStyle } from '@/lib/globe-config'
import type { GameLocationFull as GameLocation } from '@/hooks/useGameState'

const GlobeView = dynamic(() => import('@/components/globe/GlobeView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-white/60 text-sm animate-pulse">Loading globe…</div>
    </div>
  ),
})

interface ChallengeLocation {
  name: string
  country: string
  lat: number
  lng: number
}

// ── Finished Screen ──────────────────────────────────────────────────────────

function FinishedScreen({
  totalScore,
  maxScore,
  code,
  roundResults,
}: {
  totalScore: number
  maxScore: number
  code: string
  roundResults: { location: { name: string }; distanceKm: number; score: number; color: string }[]
}) {
  const pct = Math.round((totalScore / maxScore) * 100)
  const [copied, setCopied] = useState(false)
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/challenge/${code}` : ''

  const emoji =
    pct >= 90 ? '🏆 Incredible!' : pct >= 70 ? '🎉 Great round!' : pct >= 50 ? '👏 Not bad!' : '🗺️ Keep exploring!'

  const handleShare = () => {
    const text = `I scored ${totalScore}/${maxScore} on this GeoGlobe challenge! Can you beat me? ${shareUrl}`
    if (navigator.share) {
      navigator.share({ title: 'GeoGlobe Challenge', text, url: shareUrl }).catch(() => {})
    } else {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto space-y-6">
        <div className="text-center">
          <p className="text-white/40 text-sm uppercase tracking-widest mb-1">Challenge Complete</p>
          <h1 className="text-white text-4xl font-extrabold">{emoji}</h1>
        </div>

        <div className="bg-white/5 rounded-2xl border border-white/10 p-6 text-center">
          <p className="text-white/50 text-xs uppercase tracking-widest mb-1">Final Score</p>
          <div className="text-white text-6xl font-extrabold tabular-nums">
            {totalScore.toLocaleString()}
          </div>
          <p className="text-white/30 text-sm mt-1">out of {maxScore.toLocaleString()}</p>
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

        {/* Round breakdown */}
        <div className="bg-zinc-900 border border-white/10 rounded-xl p-4 space-y-2">
          {roundResults.map((r, i) => (
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
            onClick={handleShare}
            className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold transition-colors"
          >
            {copied ? '✓ Copied!' : '🔗 Share Challenge'}
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

// ── Main Component ───────────────────────────────────────────────────────────

export default function ChallengePage() {
  const params = useParams()
  const code = params?.code as string

  const [locations, setLocations] = useState<ChallengeLocation[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [mapStyle, setMapStyle] = useState<MapStyle>(DEFAULT_MAP_STYLE)

  const {
    state,
    initGame,
    placePendingGuess,
    confirmGuess,
    nextRound,
    resetPendingGuess,
  } = useGameState()

  // ── Fetch challenge ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!code) return
    async function load() {
      try {
        const res = await fetch(`/api/challenge/${code}`)
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || 'Challenge not found')
        }
        const data = await res.json()
        setLocations(data.locations)
      } catch (err: unknown) {
        setLoadError(err instanceof Error ? err.message : 'Failed to load challenge')
      }
    }
    load()
  }, [code])

  // ── Init game ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!locations || !code) return
    const gameLocations: GameLocation[] = locations.map((loc, i) => ({
      id: `challenge-${code}-${i}`,
      order: i,
      latitude: loc.lat,
      longitude: loc.lng,
      name: loc.name,
      country: loc.country,
      description: `Locate ${loc.name} on the globe`,
    }))

    initGame({
      id: `challenge-${code}`,
      puzzleNumber: 0,
      date: new Date().toISOString(),
      locations: gameLocations,
    })
  }, [locations, code, initGame])

  // ── Globe click ────────────────────────────────────────────────────────────
  const handleGlobeClick = useCallback(
    ({ lat, lng }: { lat: number; lng: number }) => {
      if (state.phase === 'playing') {
        placePendingGuess(lat, lng)
      }
    },
    [state.phase, placePendingGuess]
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
        label: `${Math.round(r.distanceKm).toLocaleString()} km away`,
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
  const lastResult = state.roundResults[state.roundResults.length - 1] ?? null
  const totalRounds = locations?.length ?? 5

  // ── Error state ────────────────────────────────────────────────────────────
  if (loadError) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-5xl">😕</div>
          <p className="text-white/60 text-lg">{loadError}</p>
          <a href="/" className="text-indigo-400 hover:text-indigo-300 underline text-sm">
            Back to Home
          </a>
        </div>
      </div>
    )
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (!locations || !state.puzzleId) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <p className="text-white/50 text-sm animate-pulse">Loading challenge…</p>
      </div>
    )
  }

  return (
    <div className="relative w-full h-[calc(100vh-3.5rem)]">
      {/* Header */}
      <header className="fixed top-14 left-0 right-0 z-50 h-12 bg-black/80 backdrop-blur-md border-b border-white/10 flex items-center px-4">
        <div className="flex-1 flex items-center gap-3">
          <a href="/" className="text-white/50 hover:text-white transition-colors text-sm">←</a>
          <div>
            <span className="text-white font-bold text-sm">Challenge: {code}</span>
            <span className="text-white/30 text-xs ml-2">
              · {totalRounds} locations
            </span>
          </div>
        </div>

        {/* Round dots */}
        <div className="flex gap-1.5 items-center">
          {Array.from({ length: totalRounds }).map((_, i) => {
            const completed = i < state.currentRound || state.phase === 'final-result'
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

        <div className="flex-1 flex justify-end">
          <span className="text-white font-bold tabular-nums">{state.totalScore} pts</span>
        </div>
      </header>

      {/* Globe */}
      <GlobeView
        pins={pins}
        arcs={arcs}
        onGlobeClick={handleGlobeClick}
        disabled={state.phase !== 'playing'}
        mapStyle={mapStyle}
      />

      <MapStylePicker selected={mapStyle} onChange={setMapStyle} />

      {/* Location card */}
      {currentLocation && state.phase !== 'final-result' && (
        <LocationCard
          location={currentLocation}
          roundNumber={state.currentRound + 1}
          totalRounds={totalRounds}
        />
      )}

      {/* Pending guess actions */}
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

      {/* Round result */}
      {state.phase === 'round-result' && lastResult && (
        <ScoreDisplay
          distanceKm={lastResult.distanceKm}
          score={lastResult.score}
          color={lastResult.color}
          onDismiss={nextRound}
        />
      )}

      {/* Finished */}
      {state.phase === 'final-result' && (
        <FinishedScreen
          totalScore={state.totalScore}
          maxScore={totalRounds * 100}
          code={code}
          roundResults={state.roundResults}
        />
      )}
    </div>
  )
}
