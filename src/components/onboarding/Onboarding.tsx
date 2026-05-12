'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { haptic } from '@/lib/haptics'
import { playClick, playSuccess, resumeAudio } from '@/lib/sounds'

interface OnboardingProps {
  onComplete: () => void
}

const steps = [
  {
    emoji: '🌍',
    title: 'Welcome to GeoGlobe',
    subtitle: "You'll be given a city name — your job is to pinpoint it on the globe.",
    instruction: 'Tap anywhere to continue',
  },
  {
    emoji: '📍',
    title: 'Place Your Pin',
    subtitle: 'Spin the globe and tap where you think the city is. The closer you are, the higher your score.',
    instruction: 'Tap to continue',
  },
  {
    emoji: '🏆',
    title: '5 Rounds, 500 Points',
    subtitle: 'Score up to 100 per round. Build streaks, climb leaderboards, and challenge friends.',
    instruction: "Tap to start playing",
  },
]

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0)

  const advance = useCallback(() => {
    resumeAudio()
    haptic('light')
    playClick()

    if (step < steps.length - 1) {
      setStep((s) => s + 1)
    } else {
      playSuccess()
      haptic('success')
      onComplete()
    }
  }, [step, onComplete])

  const current = steps[step]

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6"
      onClick={advance}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="text-center max-w-sm"
        >
          {/* Animated emoji */}
          <motion.div
            className="text-7xl mb-6 select-none"
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            {current.emoji}
          </motion.div>

          {/* Title */}
          <h1 className="text-3xl font-extrabold text-white mb-3">
            {current.title}
          </h1>

          {/* Subtitle */}
          <p className="text-white/60 text-lg leading-relaxed mb-8">
            {current.subtitle}
          </p>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {steps.map((_, i) => (
              <motion.div
                key={i}
                className={`h-2 rounded-full transition-colors ${
                  i === step ? 'bg-emerald-400 w-6' : 'bg-white/20 w-2'
                }`}
                layout
              />
            ))}
          </div>

          {/* CTA */}
          <motion.p
            className="text-white/40 text-sm"
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {current.instruction}
          </motion.p>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
