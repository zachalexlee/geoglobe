'use client'

import { useEffect, useState } from 'react'
import type { RoundResult } from '@/lib/game-engine'
import ShareCard from './ShareCard'

interface ResultsScreenProps {
  puzzleNumber: number
  totalScore: number
  maxScore: number
  roundResults: RoundResult[]
  streak?: number
}

// ── Countdown to midnight ─────────────────────────────────────────────────────
function useCountdown() {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    function calc() {
      const now = new Date()
      const midnight = new Date()
      midnight.setHours(24, 0, 0, 0)
      const diffMs = midnight.getTime() - now.getTime()
      const h = Math.floor(diffMs / 3_600_000)
      const m = Math.floor((diffMs % 3_600_000) / 60_000)
      const s = Math.floor((diffMs % 60_000) / 1000)
      setTimeLeft(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`)
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [])

  return timeLeft
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ResultsScreen({
  puzzleNumber,
  totalScore,
  maxScore,
  roundResults,
  streak = 0,
}: ResultsScreenProps) {
  const countdown = useCountdown()

  const pct = Math.round((totalScore / maxScore) * 100)

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-md mx-auto py-8 space-y-6">
        {/* Title */}
        <div className="text-center">
          <p className="text-white/40 text-sm uppercase tracking-widest mb-1">
            GeoGlobe #{puzzleNumber}
          </p>
          <h1 className="text-white text-4xl font-extrabold">
            {pct >= 90
              ? '🏆 Incredible!'
              : pct >= 70
              ? '🎉 Great game!'
              : pct >= 50
              ? '👏 Not bad!'
              : '🗺️ Keep exploring!'}
          </h1>
        </div>

        {/* Total score */}
        <div className="bg-white/5 rounded-2xl border border-white/10 p-6 text-center">
          <p className="text-white/50 text-xs uppercase tracking-widest mb-1">
            Total Score
          </p>
          <div className="text-white text-6xl font-extrabold tabular-nums">
            {totalScore.toLocaleString()}
          </div>
          <p className="text-white/30 text-sm mt-1">
            out of {maxScore.toLocaleString()}
          </p>

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

        {/* Streak */}
        {streak > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 flex items-center gap-3">
            <span className="text-2xl">🔥</span>
            <div>
              <p className="text-amber-400 font-bold">{streak}-day streak!</p>
              <p className="text-white/40 text-xs">Keep coming back every day</p>
            </div>
          </div>
        )}

        {/* Per-round breakdown */}
        <div className="space-y-3">
          <p className="text-white/40 text-xs uppercase tracking-widest">
            Round Breakdown
          </p>
          {roundResults.map((result, i) => {
            const barWidth = Math.round((result.score / 1000) * 100)
            return (
              <div
                key={result.location.id}
                className="bg-white/5 rounded-xl border border-white/10 px-4 py-3"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-white/40 text-xs mr-2">#{i + 1}</span>
                    <span className="text-white font-semibold text-sm">
                      {result.location.name}
                    </span>
                    <span className="text-white/40 text-xs ml-2">
                      {result.location.country}
                    </span>
                  </div>
                  <div className="text-right">
                    <span
                      className="font-bold text-sm tabular-nums"
                      style={{ color: result.color }}
                    >
                      +{result.score.toLocaleString()}
                    </span>
                  </div>
                </div>
                <p className="text-white/30 text-xs mb-2">
                  📍 {Math.round(result.distanceKm).toLocaleString()} km away
                </p>
                {/* Mini score bar */}
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${barWidth}%`,
                      backgroundColor: result.color,
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Share card */}
        <ShareCard
          puzzleNumber={puzzleNumber}
          totalScore={totalScore}
          roundResults={roundResults}
          streak={streak}
        />

        {/* Next puzzle countdown */}
        <div className="text-center">
          <p className="text-white/40 text-xs uppercase tracking-widest mb-1">
            Next puzzle in
          </p>
          <p className="text-white text-2xl font-mono font-bold tabular-nums">
            {countdown}
          </p>
          <p className="text-white/30 text-xs mt-1">
            Come back tomorrow to play again!
          </p>
        </div>
      </div>
    </div>
  )
}
