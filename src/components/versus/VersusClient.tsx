'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { GameLocation } from '@/lib/game-engine'
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

  const resultPollRef = useRef<ReturnType<typeof setInterval> | null>(null)

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

  // ── Game complete — submit scores then poll for results ────────────────────
  const handleGameComplete = useCallback(
    async (scores: number[], distances: number[], timeTaken: number) => {
      if (!matchId) return

      setPhase('waiting-results')

      try {
        await fetch(`/api/versus/${matchId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scores, distances, timeTaken }),
        })
      } catch (err) {
        console.error('Failed to submit scores:', err)
      }

      // Poll for the completed match result
      resultPollRef.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/versus/${matchId}`)
          if (!res.ok) return
          const data: MatchData = await res.json()
          if (data.status === 'complete') {
            clearInterval(resultPollRef.current!)
            setMatchData(data)
            setPhase('results')
          }
        } catch {
          // ignore
        }
      }, 2000)
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
  return <VersusLobby onMatchFound={handleMatchFound} />
}
