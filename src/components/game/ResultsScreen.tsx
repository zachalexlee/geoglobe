'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { RoundResult } from '@/hooks/useGameState'
import { getFactsForCity } from '@/lib/city-facts'
import { celebrateScore, celebrateStreak } from '@/lib/celebrations'
import { playScoreReveal, playSuccess, playStreak } from '@/lib/sounds'
import { haptic } from '@/lib/haptics'
import ShareCard from './ShareCard'
import ChallengeButton from './ChallengeButton'

const ReplayView = dynamic(() => import('./ReplayView'), { ssr: false })

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

// ── Animated counter ──────────────────────────────────────────────────────────
function AnimatedCounter({ target, duration = 1.5 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const start = performance.now()
    function tick(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / (duration * 1000), 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target, duration])

  return <>{count.toLocaleString()}</>
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
  const [showReplay, setShowReplay] = useState(false)
  const [revealedRounds, setRevealedRounds] = useState(0)
  const [showScore, setShowScore] = useState(false)

  const pct = Math.round((totalScore / maxScore) * 100)

  // Progressive reveal animation
  useEffect(() => {
    // Reveal rounds one by one
    const timers: NodeJS.Timeout[] = []

    roundResults.forEach((_, i) => {
      timers.push(
        setTimeout(() => {
          setRevealedRounds(i + 1)
          playScoreReveal(roundResults[i].score)
          haptic('light')
        }, 400 + i * 500)
      )
    })

    // Show total score after all rounds
    timers.push(
      setTimeout(() => {
        setShowScore(true)
        playSuccess()
        haptic('success')
        celebrateScore(totalScore, maxScore)
      }, 400 + roundResults.length * 500 + 300)
    )

    // Streak celebration
    if (streak >= 3) {
      timers.push(
        setTimeout(() => {
          playStreak()
          celebrateStreak(streak)
        }, 400 + roundResults.length * 500 + 1200)
      )
    }

    return () => timers.forEach(clearTimeout)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (showReplay) {
    return (
      <ReplayView
        roundResults={roundResults}
        onClose={() => setShowReplay(false)}
      />
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md overflow-y-auto overscroll-contain touch-auto">
      <div className="w-full max-w-md mx-auto py-8 px-4 space-y-6 min-h-full flex flex-col justify-center">
        {/* Title */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-white/40 text-sm uppercase tracking-widest mb-1">
            GeoGlobe #{puzzleNumber}
          </p>
          <AnimatePresence>
            {showScore && (
              <motion.h1
                className="text-white text-4xl font-extrabold"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 12 }}
              >
                {pct >= 90
                  ? '🏆 Incredible!'
                  : pct >= 70
                  ? '🎉 Great game!'
                  : pct >= 50
                  ? '👏 Not bad!'
                  : '🗺️ Keep exploring!'}
              </motion.h1>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Total score */}
        <AnimatePresence>
          {showScore && (
            <motion.div
              className="bg-white/5 rounded-2xl border border-white/10 p-6 text-center"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
              <p className="text-white/50 text-xs uppercase tracking-widest mb-1">
                Total Score
              </p>
              <div className="text-white text-6xl font-extrabold tabular-nums">
                <AnimatedCounter target={totalScore} duration={1.2} />
              </div>
              <p className="text-white/30 text-sm mt-1">
                out of {maxScore.toLocaleString()}
              </p>

              {/* Score bar */}
              <div className="mt-4 h-2.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: 'linear-gradient(to right, #6366f1, #10b981, #22c55e)',
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1.5, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Streak */}
        <AnimatePresence>
          {showScore && streak > 0 && (
            <motion.div
              className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, type: 'spring' }}
            >
              <motion.span
                className="text-2xl"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, repeat: 3 }}
              >
                🔥
              </motion.span>
              <div>
                <p className="text-amber-400 font-bold">{streak}-day streak!</p>
                <p className="text-white/40 text-xs">Keep coming back every day</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Per-round breakdown — progressive reveal */}
        <div className="space-y-3">
          <motion.p
            className="text-white/40 text-xs uppercase tracking-widest"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Round Breakdown
          </motion.p>
          {roundResults.map((result, i) => {
            const barWidth = Math.round((result.score / 100) * 100)
            const facts = getFactsForCity(result.location.name)
            const isRevealed = i < revealedRounds

            return (
              <AnimatePresence key={result.location.id}>
                {isRevealed && (
                  <motion.div
                    className="bg-white/5 rounded-xl border border-white/10 px-4 py-3"
                    initial={{ opacity: 0, x: -30, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 250, damping: 20 }}
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
                      <motion.div
                        className="text-right"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 400 }}
                      >
                        <span
                          className="font-bold text-sm tabular-nums"
                          style={{ color: result.color }}
                        >
                          +{result.score.toLocaleString()}
                        </span>
                      </motion.div>
                    </div>
                    <p className="text-white/30 text-xs mb-2">
                      📍 {Math.round(result.distanceKm).toLocaleString()} km away
                    </p>
                    {/* Mini score bar */}
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: result.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${barWidth}%` }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                      />
                    </div>
                    {/* Learning mode: Fun facts */}
                    {facts && (
                      <motion.div
                        className="mt-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-3 py-2"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ delay: 0.3 }}
                      >
                        <p className="text-indigo-300 text-xs font-semibold mb-1">💡 Did you know?</p>
                        {facts.map((fact, fi) => (
                          <p key={fi} className="text-white/60 text-xs leading-relaxed">
                            • {fact}
                          </p>
                        ))}
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            )
          })}
        </div>

        {/* Actions — only show after score reveal */}
        <AnimatePresence>
          {showScore && (
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {/* Watch Replay button */}
              <button
                onClick={() => setShowReplay(true)}
                className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                🎬 Watch Replay
              </button>

              {/* Share card */}
              <ShareCard
                puzzleNumber={puzzleNumber}
                totalScore={totalScore}
                roundResults={roundResults}
                streak={streak}
              />

              {/* Challenge a Friend */}
              <ChallengeButton />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Next puzzle countdown */}
        <AnimatePresence>
          {showScore && (
            <motion.div
              className="text-center pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-white/40 text-xs uppercase tracking-widest mb-1">
                Next puzzle in
              </p>
              <p className="text-white text-2xl font-mono font-bold tabular-nums">
                {countdown}
              </p>
              <p className="text-white/30 text-xs mt-1">
                Come back tomorrow to play again!
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
