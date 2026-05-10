'use client'

import { useState } from 'react'
import type { LocationClue } from '@/hooks/useGameState'

interface LocationCardProps {
  location: LocationClue
  roundNumber: number   // 1-based
  totalRounds: number
}

export default function LocationCard({
  location,
  roundNumber,
  totalRounds,
}: LocationCardProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div
      className={[
        // Desktop: bottom-left overlay; Mobile: top strip
        'fixed z-40 transition-all duration-300',
        'left-4 bottom-20 md:bottom-8 md:left-6',
        'w-[calc(100vw-2rem)] md:w-80',
        collapsed ? 'h-10' : 'h-auto',
      ].join(' ')}
    >
      {/* Card body */}
      <div className="bg-black/75 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
        {/* Header row (always visible) */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-white/40 text-xs uppercase tracking-widest font-semibold">
              Round {roundNumber}/{totalRounds}
            </span>
            {location.category && (
              <span className="text-[10px] uppercase tracking-wider text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded-full border border-indigo-400/20">
                {location.category}
              </span>
            )}
          </div>

          <button
            onClick={() => setCollapsed((c) => !c)}
            className="text-white/50 hover:text-white transition-colors text-xs ml-2 leading-none"
            aria-label={collapsed ? 'Expand clue' : 'Collapse clue'}
          >
            {collapsed ? '▲ Show' : '▼ Hide'}
          </button>
        </div>

        {/* Expandable content */}
        {!collapsed && (
          <>
            {/* Optional image */}
            {location.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={location.imageUrl}
                alt={location.name}
                className="w-full h-36 object-cover border-t border-white/5"
              />
            )}

            <div className="px-4 pb-4 pt-2 space-y-1">
              <h2 className="text-white font-bold text-xl leading-tight">
                {location.name}
              </h2>
              <p className="text-white/50 text-xs font-medium uppercase tracking-wider">
                {location.country}
              </p>
              <p className="text-white/70 text-sm leading-relaxed mt-2">
                {location.description}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
