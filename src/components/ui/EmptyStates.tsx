'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

interface EmptyStateProps {
  emoji: string
  title: string
  description: string
  action?: {
    label: string
    href: string
  }
}

export default function EmptyState({ emoji, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.span
        className="text-6xl mb-4 block select-none"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        {emoji}
      </motion.span>
      <h3 className="text-white text-xl font-bold mb-2">{title}</h3>
      <p className="text-white/50 text-sm max-w-xs leading-relaxed mb-6">
        {description}
      </p>
      {action && (
        <Link
          href={action.href}
          className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm transition-all active:scale-95"
        >
          {action.label}
        </Link>
      )}
    </motion.div>
  )
}

// ── Pre-built empty states ────────────────────────────────────────────────────

export function NoScoresYet() {
  return (
    <EmptyState
      emoji="🗺️"
      title="No scores yet"
      description="Play your first daily challenge to see your stats here!"
      action={{ label: 'Play Now', href: '/play' }}
    />
  )
}

export function NoGroupsYet() {
  return (
    <EmptyState
      emoji="👥"
      title="No groups yet"
      description="Create or join a group to compete with friends, classmates, or coworkers."
      action={{ label: 'Create Group', href: '/groups' }}
    />
  )
}

export function NoBadgesYet() {
  return (
    <EmptyState
      emoji="🏅"
      title="No badges earned"
      description="Keep playing to unlock badges — they reward streaks, accuracy, and exploration."
    />
  )
}

export function NoMatchesYet() {
  return (
    <EmptyState
      emoji="⚔️"
      title="No matches yet"
      description="Challenge a friend or queue for a ranked match to start your versus career."
      action={{ label: 'Find Match', href: '/versus' }}
    />
  )
}

export function LeaderboardEmpty() {
  return (
    <EmptyState
      emoji="🏆"
      title="Leaderboard is empty"
      description="Be the first to post a score! Play today's challenge and claim #1."
      action={{ label: 'Play Today', href: '/play' }}
    />
  )
}

export function OfflineState() {
  return (
    <EmptyState
      emoji="📡"
      title="You're offline"
      description="GeoGlobe needs an internet connection to load puzzles and sync scores. Check your connection and try again."
    />
  )
}
