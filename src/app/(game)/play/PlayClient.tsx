'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useGameState, type PuzzleData } from '@/hooks/useGameState'
import GameHeader from '@/components/game/GameHeader'
import LocationCard from '@/components/game/LocationCard'
import ScoreDisplay from '@/components/game/ScoreDisplay'
import ResultsScreen from '@/components/game/ResultsScreen'
import MapStylePicker from '@/components/globe/MapStylePicker'
import { DEFAULT_MAP_STYLE, type Pin, type ArcData, type MapStyle } from '@/lib/globe-config'

const GlobeView = dynamic(
  () => import('@/components/globe/GlobeView').catch(() => {
    // Fallback if globe.gl fails to load (WebGL not available)
    return { default: () => <div className="w-full h-full flex items-center justify-center"><p className="text-white/50">Globe unavailable — WebGL required</p></div> }
  }),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-white/60 text-sm animate-pulse">Loading globe…</div>
      </div>
    ),
  }
)

const TOTAL_ROUNDS = 5

interface PlayClientProps {
  puzzle: PuzzleData
}

export default function PlayClient({ puzzle }: PlayClientProps) {
  const {
    state,
    initGame,
    placePendingGuess,
    submitGuess,
    nextRound,
    resetPendingGuess,
  } = useGameState()

  const [mapStyle, setMapStyle] = useState<MapStyle>(DEFAULT_MAP_STYLE)

  // ── Init game with server-fetched puzzle data ──────────────────────────────
  useEffect(() => {
    initGame(puzzle)
  }, [initGame, puzzle])

  // ── Submit final score to server when game ends ────────────────────────────
  const scoreSubmitted = useRef(false)
  useEffect(() => {
    if (state.phase !== 'final-result' || scoreSubmitted.current) return
    scoreSubmitted.current = true

    fetch('/api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        puzzleId: state.puzzleId,
        timeTaken: Math.round((Date.now() - gameStartTime.current) / 1000),
      }),
    }).catch(() => {
      // Silently fail — game result is still shown locally
    })
  }, [state.phase, state.puzzleId])

  const gameStartTime = useRef(Date.now())

  // ── Globe click handler ───────────────────────────────────────────────────
  const handleGlobeClick = useCallback(
    ({ lat, lng }: { lat: number; lng: number }) => {
      if (state.phase === 'playing') {
        placePendingGuess(lat, lng)
      }
    },
    [state.phase, placePendingGuess]
  )

  // ── Confirm guess (calls server) ─────────────────────────────────────────
  const handleConfirmGuess = useCallback(async () => {
    if (!state.pendingGuess || state.phase !== 'playing') return

    const currentLocation = state.locations[state.currentRound]
    if (!currentLocation) return

    await submitGuess(
      state.puzzleId,
      state.currentRound,
      state.pendingGuess.lat,
      state.pendingGuess.lng,
      currentLocation
    )
  }, [state.pendingGuess, state.phase, state.puzzleId, state.currentRound, state.locations, submitGuess])

  // ── Build pins ────────────────────────────────────────────────────────────
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

  // ── Build arcs ────────────────────────────────────────────────────────────
  const arcs = useMemo<ArcData[]>(() => {
    return state.roundResults.map((r) => ({
      startLat: r.guess.lat,
      startLng: r.guess.lng,
      endLat: r.location.latitude,
      endLng: r.location.longitude,
      color: r.color,
    }))
  }, [state.roundResults])

  // ── Current location ───────────────────────────────────────────────────────
  const currentLocation = state.locations[state.currentRound] ?? null
  const lastResult = state.roundResults[state.roundResults.length - 1] ?? null

  // ── Loading state (brief — puzzle is already available) ────────────────────
  if (!state.puzzleId) {
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <p className="text-white/50 text-sm animate-pulse">Initializing…</p>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      <GameHeader
        puzzleNumber={state.puzzleNumber}
        currentRound={state.currentRound}
        totalRounds={TOTAL_ROUNDS}
        totalScore={state.totalScore}
      />

      <GlobeView
        pins={pins}
        arcs={arcs}
        onGlobeClick={handleGlobeClick}
        disabled={state.phase !== 'playing'}
        mapStyle={mapStyle}
      />

      <MapStylePicker selected={mapStyle} onChange={setMapStyle} />

      {currentLocation && state.phase !== 'final-result' && (
        <LocationCard
          location={currentLocation}
          roundNumber={state.currentRound + 1}
          totalRounds={TOTAL_ROUNDS}
        />
      )}

      {state.pendingGuess && state.phase === 'playing' && (
        <div className="fixed bottom-6 inset-x-0 z-40 flex justify-center gap-3 px-4">
          <button
            onClick={resetPendingGuess}
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

      {state.phase === 'submitting' && (
        <div className="fixed bottom-6 inset-x-0 z-40 flex justify-center px-4">
          <div className="px-6 py-2.5 rounded-xl bg-white/10 text-white text-sm font-medium animate-pulse">
            Submitting guess…
          </div>
        </div>
      )}

      {state.phase === 'round-result' && lastResult && (
        <ScoreDisplay
          distanceKm={lastResult.distanceKm}
          score={lastResult.score}
          color={lastResult.color}
          onDismiss={nextRound}
        />
      )}

      {state.phase === 'final-result' && (
        <ResultsScreen
          puzzleNumber={state.puzzleNumber}
          totalScore={state.totalScore}
          maxScore={TOTAL_ROUNDS * 1000}
          roundResults={state.roundResults}
        />
      )}
    </div>
  )
}
