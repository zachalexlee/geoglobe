'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { GameLocation } from '@/lib/game-engine'

interface VersusLobbyProps {
  onMatchFound: (matchId: string, locations: GameLocation[]) => void
}

export default function VersusLobby({ onMatchFound }: VersusLobbyProps) {
  const router = useRouter()
  const [isRanked, setIsRanked] = useState(false)
  const [searching, setSearching] = useState(false)
  const [matchId, setMatchId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ── Poll while waiting ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!searching || !matchId) return

    async function poll() {
      try {
        const res = await fetch(`/api/versus/${matchId}`)
        if (!res.ok) return
        const data = await res.json()

        if (data.status === 'active') {
          clearInterval(pollRef.current!)
          setSearching(false)
          onMatchFound(data.id, data.locations)
        } else if (data.status === 'cancelled') {
          clearInterval(pollRef.current!)
          setSearching(false)
          setMatchId(null)
          setError('Match was cancelled.')
        }
      } catch {
        // ignore transient errors
      }
    }

    pollRef.current = setInterval(poll, 2000)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [searching, matchId, onMatchFound])

  // ── Start search ───────────────────────────────────────────────────────────
  async function handleFindMatch() {
    setError(null)
    setSearching(true)

    try {
      const res = await fetch('/api/versus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRanked }),
      })
      const data = await res.json()

      if (!res.ok) {
        setSearching(false)
        setError(data.error ?? 'Failed to find match')
        return
      }

      if (data.status === 'active') {
        // Immediately found a match
        setSearching(false)
        onMatchFound(data.matchId, data.locations)
      } else {
        // Waiting — start polling
        setMatchId(data.matchId)
      }
    } catch {
      setSearching(false)
      setError('Network error. Please try again.')
    }
  }

  // ── Cancel search ──────────────────────────────────────────────────────────
  async function handleCancel() {
    if (pollRef.current) clearInterval(pollRef.current)
    setSearching(false)

    if (matchId) {
      try {
        await fetch(`/api/versus/${matchId}/cancel`, { method: 'POST' })
      } catch {
        // ignore
      }
      setMatchId(null)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-sm mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="text-5xl">⚔️</div>
          <h1 className="text-white text-3xl font-extrabold tracking-tight">Versus Mode</h1>
          <p className="text-white/50 text-sm">
            Challenge another player in real-time
          </p>
        </div>

        {/* Main card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
          {!searching ? (
            <>
              {/* Ranked toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold">Ranked Match</p>
                  <p className="text-white/40 text-xs mt-0.5">Win or lose ELO rating</p>
                </div>
                <button
                  onClick={() => setIsRanked((r) => !r)}
                  className={[
                    'relative w-12 h-6 rounded-full transition-colors duration-200',
                    isRanked ? 'bg-indigo-600' : 'bg-white/20',
                  ].join(' ')}
                  aria-label="Toggle ranked mode"
                >
                  <span
                    className={[
                      'absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200',
                      isRanked ? 'translate-x-7' : 'translate-x-1',
                    ].join(' ')}
                  />
                </button>
              </div>

              <div className="h-px bg-white/10" />

              {/* Mode label */}
              <div
                className={[
                  'rounded-xl px-4 py-3 text-center text-sm font-semibold border',
                  isRanked
                    ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                    : 'bg-white/5 border-white/10 text-white/60',
                ].join(' ')}
              >
                {isRanked ? '🏆 Ranked — ELO at stake' : '🎮 Casual — just for fun'}
              </div>

              {/* Error */}
              {error && (
                <div className="text-red-400 text-sm text-center bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              {/* Find match button */}
              <button
                onClick={handleFindMatch}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-lg transition-colors shadow-lg"
              >
                Find Match
              </button>

              <button
                onClick={() => router.push('/')}
                className="w-full py-2 text-white/40 hover:text-white/70 text-sm transition-colors"
              >
                ← Back to Home
              </button>
            </>
          ) : (
            /* Searching state */
            <div className="text-center space-y-6 py-4">
              {/* Spinner */}
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-indigo-500 animate-spin" />
              </div>

              <div>
                <p className="text-white font-bold text-lg">Looking for opponent…</p>
                <p className="text-white/40 text-sm mt-1">
                  {isRanked ? 'Ranked match' : 'Casual match'} • Searching…
                </p>
              </div>

              <button
                onClick={handleCancel}
                className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium border border-white/10 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
