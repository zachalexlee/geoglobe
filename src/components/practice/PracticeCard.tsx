'use client'

import Link from 'next/link'
import { useState } from 'react'

interface PracticeCardProps {
  id: string
  name: string
  description?: string | null
  category: string
  difficulty: string
  locationCount: number
  playCount: number
  isOfficial: boolean
}

const CATEGORY_STYLES: Record<string, { label: string; bg: string; text: string; border: string }> = {
  capitals: {
    label: 'Capitals',
    bg: 'bg-blue-500/15',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
  },
  countries: {
    label: 'Countries',
    bg: 'bg-green-500/15',
    text: 'text-green-400',
    border: 'border-green-500/30',
  },
  themed: {
    label: 'Themed',
    bg: 'bg-purple-500/15',
    text: 'text-purple-400',
    border: 'border-purple-500/30',
  },
  custom: {
    label: 'Custom',
    bg: 'bg-gray-500/15',
    text: 'text-gray-400',
    border: 'border-gray-500/30',
  },
}

const DIFFICULTY_STYLES: Record<string, { label: string; bg: string; text: string; border: string }> = {
  easy: {
    label: 'Easy',
    bg: 'bg-green-500/15',
    text: 'text-green-400',
    border: 'border-green-500/30',
  },
  medium: {
    label: 'Medium',
    bg: 'bg-yellow-500/15',
    text: 'text-yellow-400',
    border: 'border-yellow-500/30',
  },
  hard: {
    label: 'Hard',
    bg: 'bg-red-500/15',
    text: 'text-red-400',
    border: 'border-red-500/30',
  },
}

export default function PracticeCard({
  id,
  name,
  description,
  category,
  difficulty,
  locationCount,
  playCount,
  isOfficial,
}: PracticeCardProps) {
  const cat = CATEGORY_STYLES[category] ?? CATEGORY_STYLES.custom
  const diff = DIFFICULTY_STYLES[difficulty] ?? DIFFICULTY_STYLES.medium
  const [copied, setCopied] = useState(false)

  function handleShare(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const url = `${window.location.origin}/practice/${id}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="group relative bg-white/5 hover:bg-white/8 border border-white/10 hover:border-white/20 rounded-2xl p-5 flex flex-col gap-3 transition-all duration-200 hover:shadow-lg hover:shadow-black/40 hover:-translate-y-0.5">
      {/* Official star badge */}
      {isOfficial && (
        <span
          className="absolute top-3 right-3 text-amber-400 text-sm"
          title="Official map"
        >
          ★
        </span>
      )}

      {/* Share button for community maps */}
      {!isOfficial && (
        <button
          onClick={handleShare}
          className="absolute top-3 right-3 text-white/40 hover:text-white text-xs px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          title="Copy link"
        >
          {copied ? '✓ Copied' : '🔗 Share'}
        </button>
      )}

      {/* Header */}
      <div className="pr-16">
        <h3 className="text-white font-bold text-base leading-snug">{name}</h3>
        {description && (
          <p className="text-white/50 text-xs mt-1 leading-relaxed line-clamp-2">
            {description}
          </p>
        )}
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        <span
          className={`inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full border ${cat.bg} ${cat.text} ${cat.border}`}
        >
          {cat.label}
        </span>
        <span
          className={`inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full border ${diff.bg} ${diff.text} ${diff.border}`}
        >
          {diff.label}
        </span>
        {!isOfficial && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full border bg-cyan-500/15 text-cyan-400 border-cyan-500/30">
            Community
          </span>
        )}
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 text-xs text-white/40">
        <span>📍 {locationCount} location{locationCount !== 1 ? 's' : ''}</span>
        <span>▶ {playCount.toLocaleString()} play{playCount !== 1 ? 's' : ''}</span>
      </div>

      {/* Play button */}
      <Link
        href={`/practice/${id}`}
        className="mt-auto inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-sm font-bold transition-colors"
      >
        ▶ Play
      </Link>
    </div>
  )
}
