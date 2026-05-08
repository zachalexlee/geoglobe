'use client'

import { useState } from 'react'
import { BADGE_DEFINITIONS } from '@/lib/badges'

interface EarnedBadge {
  id?: string
  name: string
  icon: string
  description: string
  earnedAt: string
}

interface BadgeGridProps {
  /** Badges the user has already earned */
  badges: EarnedBadge[]
}

export default function BadgeGrid({ badges }: BadgeGridProps) {
  const [tooltip, setTooltip] = useState<string | null>(null)

  // Build a lookup of earned badge names for quick O(1) access
  const earnedMap = new Map<string, EarnedBadge>()
  for (const b of badges) earnedMap.set(b.name, b)

  return (
    <div className="space-y-3">
      <p className="text-zinc-500 text-xs uppercase tracking-widest">
        Badges ({badges.length}/{BADGE_DEFINITIONS.length})
      </p>

      <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 md:grid-cols-5 lg:grid-cols-6">
        {BADGE_DEFINITIONS.map((def) => {
          const earned = earnedMap.get(def.name)
          const isTooltipOpen = tooltip === def.name

          return (
            <button
              key={def.name}
              type="button"
              onClick={() => setTooltip(isTooltipOpen ? null : def.name)}
              onMouseEnter={() => setTooltip(def.name)}
              onMouseLeave={() => setTooltip(null)}
              className={[
                'relative flex flex-col items-center justify-center rounded-xl border p-2 gap-1 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
                earned
                  ? 'bg-zinc-800 border-white/10 hover:border-white/20 hover:bg-zinc-700'
                  : 'bg-zinc-900 border-white/5 opacity-40 cursor-default',
              ].join(' ')}
              aria-label={`${def.name}: ${def.description}`}
            >
              {/* Badge icon */}
              <span
                className={[
                  'text-2xl leading-none',
                  earned ? '' : 'grayscale',
                ].join(' ')}
              >
                {earned ? def.icon : '🔒'}
              </span>

              {/* Short name */}
              <span
                className={[
                  'text-center leading-tight',
                  earned ? 'text-zinc-300 text-[10px] font-medium' : 'text-zinc-600 text-[9px]',
                ].join(' ')}
              >
                {def.name}
              </span>

              {/* Tooltip */}
              {isTooltipOpen && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 z-20 pointer-events-none">
                  <div className="bg-zinc-800 border border-white/10 rounded-lg shadow-xl px-3 py-2 text-center">
                    <p className="text-white text-xs font-semibold">{def.name}</p>
                    <p className="text-zinc-400 text-xs mt-0.5">{def.description}</p>
                    {earned && (
                      <p className="text-blue-400 text-[10px] mt-1">
                        Earned {new Date(earned.earnedAt).toLocaleDateString()}
                      </p>
                    )}
                    {!earned && (
                      <p className="text-zinc-600 text-[10px] mt-1">Not yet unlocked</p>
                    )}
                  </div>
                  {/* Tooltip arrow */}
                  <div className="flex justify-center">
                    <div className="w-2 h-2 bg-zinc-800 border-r border-b border-white/10 rotate-45 -mt-1" />
                  </div>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
