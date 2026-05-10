'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { GameLocation } from '@/lib/game-engine'
import { useVersusEvents } from '@/hooks/useVersusEvents'
import VersusLobby from '@/components/versus/VersusLobby'
import VersusGame from '@/components/versus/VersusGame'
import VersusResults from '@/components/versus/VersusResults'

// ── Types ──────────────────────────────────────────────────────────────────────

interface Player {
  id: string
  username: string
  avatar?: string | null
  elo: number
}

interface MatchData {
  id: string
  status: string
  isRanked: boolean
  locations: GameLocation[]
  player1: Player
  player2: Player | null
  p1Scores: number[] | null
  p2Scores: number[] | null
  p1Time: number | null
  p2Time: number | null
  winnerId: string | null
  eloChange: number | null
}

type AppPhase = 'lobby' | 'game' | 'waiting-results' | 'results'

interface VersusClientProps {
  userId: string
}

// ── Client Component ──────────────────────────────────────────────────────────

export default function VersusClient({ userId }: VersusClientProps) {
  const router = useRouter()

  const [phase, setPhase] = useState<AppPhase>('lobby')
  const [matchId, setMatchId] = useState<string | null>(null)
  const [matchData, setMatchData] = useState<MatchData | null>(null)

  // Fallback poll ref (only used if SSE fails)
  const resultPollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const fallbackPollActive = useRef(false)

  // ── SSE event handlers ──────────────────────────────────────────────────────
  const handleMatchReady = useCallback(() => {
    // Match became active — fetch full match data
    if (!matchId) return
    fetch(`/api/versus/${matchId}`)
      .then((r) => r.json())
      .then((data: MatchData) => {
        if (data.status === 'active' && data.player2) {
          setMatchData(data)
          setPhase('game')
        }
      })
      .catch(console.error)
  }, [matchId])

  const handleOpponentScored = useCallback((_playerId: string) => {
    // Opponent submitted — we can show a visual indicator if desired
    // For now, just update opponent scores if we're already in results-waiting
    if (!matchId) return
    fetch(`/api/versus/${matchId}`)
      .then((r) => r.json())
      .then((data: MatchData) => {
        if (data.status === 'complete') {
          setMatchData(data)
          setPhase('results')
        }
      })
      .catch(console.error)
  }, [matchId])

  const handleMatchComplete = useCallback((_winnerId: string | null, _eloChange: number | null) => {
    // Match resolved — fetch final results
    if (!matchId) return
    fetch(`/api/versus/${matchId}`)
      .then((r) => r.json())
      .then((data: MatchData) => {
        if (data.status === 'complete') {
          if (resultPollRef.current) clearInterval(resultPollRef.current)
          setMatchData(data)
          setPhase('results')
        }
      })
      .catch(console.error)
  }, [matchId])

  // Connect to SSE when we have a matchId
  useVersusEvents({
    matchId,
    onMatchReady: handleMatchReady,
    onOpponentScored: handleOpponentScored,
    onMatchComplete: handleMatchComplete,
    enabled: !!matchId && phase !== 'results',
  })

  // ── Match found callback from lobby ───────────────────────────────────────
  const handleMatchFound = useCallback(
    (foundMatchId: string, locations: GameLocation[]) => {
      setMatchId(foundMatchId)
      fetch(`/api/versus/${foundMatchId}`)
        .then((r) => r.json())
        .then((data: MatchData) => {
          setMatchData({ ...data, locations })
          setPhase('game')
        })
        .catch(console.error)
    },
    []
  )

  // ── Game complete — submit scores then wait for SSE match-complete event ────
  const handleGameComplete = useCallback(
    async (scores: number[], distances: number[], timeTaken: number) => {
      if (!matchId) return

      setPhase('waiting-results')

      try {
        const res = await fetch(`/api/versus/${matchId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scores, distances, timeTaken }),
        })
        const data = await res.json()

        // If the response already shows 'complete', transition immediately
        if (data.status === 'complete') {
          const fullData = await fetch(`/api/versus/${matchId}`).then((r) => r.json())
          setMatchData(fullData)
          setPhase('results')
          return
        }
      } catch (err) {
        console.error('Failed to submit scores:', err)
      }

      // Fallback: poll in case SSE connection dropped.
      // SSE should deliver 'match-complete' event, but we poll as safety net.
      fallbackPollActive.current = true
      resultPollRef.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/versus/${matchId}`)
          if (!res.ok) return
          const data: MatchData = await res.json()
          if (data.status === 'complete') {
            clearInterval(resultPollRef.current!)
            fallbackPollActive.current = false
            setMatchData(data)
            setPhase('results')
          }
        } catch {
          // ignore
        }
      }, 5000) // 5s fallback poll (SSE delivers in <100ms normally)
    },
    [matchId]
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (resultPollRef.current) clearInterval(resultPollRef.current)
    }
  }, [])

  // ── Waiting for results ────────────────────────────────────────────────────
  if (phase === 'waiting-results') {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-white/10 border-t-indigo-500 animate-spin" />
        <p className="text-white font-bold text-lg">Waiting for opponent…</p>
        <p className="text-white/40 text-sm">Scores submitted. Hang tight!</p>
      </div>
    )
  }

  // ── Results ────────────────────────────────────────────────────────────────
  if (phase === 'results' && matchData?.player1 && matchData.player2) {
    return (
      <VersusResults
        matchId={matchData.id}
        currentUserId={userId}
        player1={matchData.player1}
        player2={matchData.player2}
        p1Scores={matchData.p1Scores ?? []}
        p2Scores={matchData.p2Scores ?? []}
        winnerId={matchData.winnerId}
        eloChange={matchData.eloChange}
        isRanked={matchData.isRanked}
      />
    )
  }

  // ── Game ───────────────────────────────────────────────────────────────────
  if (phase === 'game' && matchData?.player1 && matchData.player2) {
    return (
      <VersusGame
        matchId={matchData.id}
        locations={matchData.locations}
        currentUserId={userId}
        player1={matchData.player1}
        player2={matchData.player2}
        onGameComplete={handleGameComplete}
      />
    )
  }

  // ── Lobby ──────────────────────────────────────────────────────────────────
  return <VersusLobby matchId={matchId} onMatchFound={handleMatchFound} onMatchCreated={(id) => setMatchId(id || null)} />
}
