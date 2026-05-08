'use client'

import { useEffect, useState } from 'react'

interface ScoreDisplayProps {
  distanceKm: number
  score: number
  color: string
  onDismiss?: () => void
  autoDismissMs?: number
}

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`
  return `${Math.round(km).toLocaleString()} km`
}

export default function ScoreDisplay({
  distanceKm,
  score,
  color,
  onDismiss,
  autoDismissMs = 0,
}: ScoreDisplayProps) {
  const [visible, setVisible] = useState(false)

  // Fade in on mount
  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(t)
  }, [])

  // Optional auto-dismiss
  useEffect(() => {
    if (!autoDismissMs) return
    const t = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onDismiss?.(), 300)
    }, autoDismissMs)
    return () => clearTimeout(t)
  }, [autoDismissMs, onDismiss])

  return (
    <div
      className="fixed inset-x-0 top-20 z-50 flex justify-center pointer-events-none"
    >
      <div
        className={[
          'pointer-events-auto transition-all duration-300 ease-out',
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4',
          'bg-black/80 backdrop-blur-md rounded-2xl border px-8 py-5 text-center shadow-2xl',
          'min-w-[220px]',
        ].join(' ')}
        style={{ borderColor: `${color}55` }}
      >
        {/* Distance line */}
        <p className="text-white/60 text-sm mb-1">
          📍 {formatDistance(distanceKm)} away
        </p>

        {/* Score line */}
        <div
          className="text-4xl font-extrabold tabular-nums tracking-tight"
          style={{ color }}
        >
          +{score.toLocaleString()}
        </div>
        <p className="text-white/40 text-xs mt-0.5 uppercase tracking-widest">
          points
        </p>

        {/* Score label */}
        <div
          className="mt-3 text-xs font-semibold px-3 py-1 rounded-full inline-block"
          style={{ backgroundColor: `${color}22`, color }}
        >
          {score === 1000
            ? '🎯 Perfect!'
            : score >= 700
            ? '🔥 Great!'
            : score >= 400
            ? '👍 Good'
            : score >= 100
            ? '📏 Getting warmer'
            : '❄️ Way off'}
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="mt-4 block w-full text-center text-white/50 hover:text-white text-xs transition-colors"
          >
            Continue →
          </button>
        )}
      </div>
    </div>
  )
}
