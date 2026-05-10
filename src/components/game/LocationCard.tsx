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
        'fixed z-40 transition-all duration-300',
        'left-4 bottom-20 md:bottom-8 md:left-6',
        'w-[calc(100vw-2rem)] md:w-80',
        collapsed ? 'h-10' : 'h-auto',
      ].join(' ')}
    >
      <div className="bg-black/75 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
        {/* Header row */}
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-white/40 text-xs uppercase tracking-widest font-semibold">
            Round {roundNumber}/{totalRounds}
          </span>
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="text-white/50 hover:text-white transition-colors text-xs ml-2 leading-none"
            aria-label={collapsed ? 'Expand clue' : 'Collapse clue'}
          >
            {collapsed ? '▲ Show' : '▼ Hide'}
          </button>
        </div>

        {/* City info */}
        {!collapsed && (
          <div className="px-4 pb-4 pt-1 space-y-1">
            <h2 className="text-white font-bold text-2xl leading-tight">
              📍 {location.name}
            </h2>
            <p className="text-white/50 text-sm font-medium">
              {location.country}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
