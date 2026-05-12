'use client'

import { motion } from 'framer-motion'

const errorMessages = [
  { emoji: '🌋', title: 'Tectonic shift detected', subtitle: 'Something broke beneath the surface.' },
  { emoji: '🧭', title: 'Lost our bearings', subtitle: "We've wandered off the map." },
  { emoji: '🌊', title: 'Washed ashore', subtitle: 'A wave knocked something loose.' },
  { emoji: '🏔️', title: 'Hit a mountain', subtitle: "There's something blocking the path." },
  { emoji: '🌪️', title: 'Caught in a storm', subtitle: 'Things got turbulent for a moment.' },
]

function getRandomError() {
  return errorMessages[Math.floor(Math.random() * errorMessages.length)]
}

interface ErrorStateProps {
  error?: Error & { digest?: string }
  reset?: () => void
  message?: string
}

export default function ErrorState({ error, reset, message }: ErrorStateProps) {
  const randomMsg = getRandomError()

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-[50vh] px-6 text-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.span
        className="text-6xl mb-4 block select-none"
        animate={{ rotate: [0, -5, 5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        {randomMsg.emoji}
      </motion.span>

      <h2 className="text-white text-2xl font-bold mb-2">
        {randomMsg.title}
      </h2>

      <p className="text-white/50 text-sm max-w-xs leading-relaxed mb-2">
        {randomMsg.subtitle}
      </p>

      {(message || error?.message) && (
        <p className="text-white/30 text-xs font-mono mt-2 mb-4 max-w-sm break-all">
          {message || error?.message}
        </p>
      )}

      <div className="flex gap-3 mt-4">
        {reset && (
          <button
            onClick={reset}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm transition-all active:scale-95"
          >
            Try Again
          </button>
        )}
        <a
          href="/"
          className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm transition-all active:scale-95"
        >
          Go Home
        </a>
      </div>

      {error?.digest && (
        <p className="text-white/20 text-xs mt-6 font-mono">
          Error ID: {error.digest}
        </p>
      )}
    </motion.div>
  )
}
