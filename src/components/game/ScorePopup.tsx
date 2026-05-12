'use client'

import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { haptic } from '@/lib/haptics'
import { playScoreReveal } from '@/lib/sounds'
import { celebratePinPlacement } from '@/lib/celebrations'

interface ScorePopupProps {
  score: number
  distanceKm: number
  color: string
  onDismiss: () => void
}

export default function ScorePopup({ score, distanceKm, color, onDismiss }: ScorePopupProps) {
  useEffect(() => {
    playScoreReveal(score)
    haptic(score >= 80 ? 'success' : score >= 50 ? 'medium' : 'light')
    celebratePinPlacement(score)

    // Auto-dismiss after delay
    const timer = setTimeout(onDismiss, 2500)
    return () => clearTimeout(timer)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const emoji = score >= 95 ? '🎯' : score >= 80 ? '🔥' : score >= 60 ? '👍' : score >= 30 ? '🤔' : '😅'

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-black/80 backdrop-blur-lg rounded-3xl border border-white/10 px-8 py-6 text-center pointer-events-auto"
        initial={{ scale: 0.3, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: -30, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        onClick={onDismiss}
      >
        <motion.span
          className="text-5xl block mb-2"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', delay: 0.1 }}
        >
          {emoji}
        </motion.span>

        <motion.div
          className="text-4xl font-extrabold tabular-nums mb-1"
          style={{ color }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2, stiffness: 200 }}
        >
          +{score}
        </motion.div>

        <motion.p
          className="text-white/50 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {distanceKm < 50
            ? 'Pinpoint accuracy!'
            : distanceKm < 200
            ? 'So close!'
            : distanceKm < 500
            ? `${Math.round(distanceKm)} km away`
            : distanceKm < 2000
            ? `${Math.round(distanceKm).toLocaleString()} km off`
            : `${Math.round(distanceKm).toLocaleString()} km away — keep exploring!`}
        </motion.p>
      </motion.div>
    </motion.div>
  )
}
