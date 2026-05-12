'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
    <motion.div
      className={[
        'fixed z-40',
        'left-4 bottom-20 md:bottom-8 md:left-6',
        'w-[calc(100vw-2rem)] md:w-80',
      ].join(' ')}
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      key={location.id}
    >
      <div className="bg-black/80 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-black/50">
        {/* Header row */}
        <div className="flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="text-white/40 text-xs uppercase tracking-widest font-semibold">
              Round {roundNumber}/{totalRounds}
            </span>
            {/* Mini progress */}
            <div className="flex gap-0.5">
              {Array.from({ length: totalRounds }).map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full ${
                    i < roundNumber - 1
                      ? 'bg-emerald-400'
                      : i === roundNumber - 1
                      ? 'bg-white'
                      : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
          </div>
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="text-white/50 hover:text-white transition-colors text-xs ml-2 leading-none p-1"
            aria-label={collapsed ? 'Expand clue' : 'Collapse clue'}
          >
            {collapsed ? '▲' : '▼'}
          </button>
        </div>

        {/* City info */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              className="px-4 pb-4 pt-1 space-y-1"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-white font-bold text-2xl leading-tight flex items-center gap-2">
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.1 }}
                >
                  📍
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  {location.name}
                </motion.span>
              </h2>
              <motion.p
                className="text-white/50 text-sm font-medium pl-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
              >
                {location.country}
              </motion.p>
              <motion.p
                className="text-white/30 text-xs pl-8 pt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
              >
                Tap the globe to place your pin
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
