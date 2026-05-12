'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface GameHeaderProps {
  puzzleNumber: number
  currentRound: number   // 0-4
  totalRounds: number    // typically 5
  totalScore: number
}

export default function GameHeader({
  puzzleNumber,
  currentRound,
  totalRounds,
  totalScore,
}: GameHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-black/80 backdrop-blur-lg border-b border-white/10 flex items-center px-4">
      {/* Left: title */}
      <div className="flex-1">
        <span className="text-white font-bold text-lg tracking-tight">
          🌍{' '}
          <span className="text-white/50 font-normal text-sm">
            #{puzzleNumber}
          </span>
        </span>
      </div>

      {/* Center: round progress pills */}
      <div className="flex gap-1.5 items-center">
        {Array.from({ length: totalRounds }).map((_, i) => {
          const isCompleted = i < currentRound
          const isCurrent = i === currentRound

          return (
            <motion.div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                isCompleted
                  ? 'w-6 bg-emerald-400'
                  : isCurrent
                  ? 'w-6 bg-white'
                  : 'w-2 bg-white/20'
              }`}
              layout
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
              {isCurrent && (
                <motion.div
                  className="h-full w-full rounded-full bg-white"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Right: score with animation */}
      <div className="flex-1 flex justify-end">
        <div className="text-right">
          <AnimatePresence mode="popLayout">
            <motion.span
              key={totalScore}
              className="text-white font-bold text-lg tabular-nums inline-block"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 10, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {totalScore.toLocaleString()}
            </motion.span>
          </AnimatePresence>
          <span className="text-white/40 text-xs ml-1">pts</span>
        </div>
      </div>
    </header>
  )
}
