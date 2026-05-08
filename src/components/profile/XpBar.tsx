'use client'

import { useEffect, useRef, useState } from 'react'

interface XpBarProps {
  /** Total accumulated XP */
  xp: number
  /** Current level number */
  level: number
  /** XP already earned within the current level */
  xpCurrentLevel: number
  /** XP required to complete the current level (denominator) */
  xpToNextLevel: number
  /** When true, play a "level up" celebration animation */
  leveledUp?: boolean
}

export default function XpBar({ xp, level, xpCurrentLevel, xpToNextLevel, leveledUp = false }: XpBarProps) {
  const pct = Math.min(100, Math.round((xpCurrentLevel / xpToNextLevel) * 100))

  // Animate fill from 0 → pct on mount
  const [fillPct, setFillPct] = useState(0)
  const [showLevelUp, setShowLevelUp] = useState(false)
  const frameRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // Delay a frame so the CSS transition fires
    frameRef.current = setTimeout(() => setFillPct(pct), 50)
    return () => {
      if (frameRef.current) clearTimeout(frameRef.current)
    }
  }, [pct])

  useEffect(() => {
    if (leveledUp) {
      setShowLevelUp(true)
      const t = setTimeout(() => setShowLevelUp(false), 2500)
      return () => clearTimeout(t)
    }
  }, [leveledUp])

  return (
    <div className="relative w-full select-none">
      {/* Level-up overlay */}
      {showLevelUp && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none animate-bounce">
          <span className="text-yellow-400 font-extrabold text-lg tracking-wider drop-shadow-lg">
            ⬆ LEVEL UP!
          </span>
        </div>
      )}

      {/* Header row */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold shadow">
            {level}
          </span>
          <span className="text-zinc-300 text-xs font-medium">Level {level}</span>
        </div>
        <span className="text-zinc-500 text-xs tabular-nums">
          {xpCurrentLevel.toLocaleString()} / {xpToNextLevel.toLocaleString()} XP
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-3 rounded-full bg-zinc-800 border border-white/5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${fillPct}%`,
            background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
          }}
        />
      </div>

      {/* Footer row */}
      <div className="flex items-center justify-between mt-1">
        <span className="text-zinc-600 text-xs">{pct}% to next level</span>
        <span className="text-zinc-600 text-xs tabular-nums">
          {xp.toLocaleString()} total XP
        </span>
      </div>
    </div>
  )
}
