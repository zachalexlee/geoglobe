'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface GroupCardProps {
  id: string
  name: string
  code: string
  isPublic: boolean
  memberCount: number
  isJoined: boolean
}

export default function GroupCard({ id, name, code, isPublic, memberCount, isJoined }: GroupCardProps) {
  const router = useRouter()
  const [copying, setCopying] = useState(false)

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(code)
      setCopying(true)
      setTimeout(() => setCopying(false), 1500)
    } catch {
      // ignore
    }
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-zinc-900 border border-white/10 px-4 py-3 hover:bg-zinc-800 transition-colors">
      {/* Left: name + meta */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-zinc-100 truncate">{name}</span>
          <span
            className={[
              'text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded',
              isPublic
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-zinc-700 text-zinc-400 border border-zinc-600',
            ].join(' ')}
          >
            {isPublic ? 'Public' : 'Private'}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
          <span>👥 {memberCount} member{memberCount !== 1 ? 's' : ''}</span>
          {isJoined && (
            <button
              onClick={handleCopy}
              className="font-mono text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1"
              title="Copy join code"
            >
              <span>{code}</span>
              <span className="text-[10px]">{copying ? '✓' : '⎘'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Right: action */}
      <button
        onClick={() => router.push(`/groups/${id}`)}
        className={[
          'flex-shrink-0 px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
          isJoined
            ? 'bg-zinc-700 text-zinc-200 hover:bg-zinc-600'
            : 'bg-blue-600 text-white hover:bg-blue-500',
        ].join(' ')}
      >
        {isJoined ? 'View' : 'Join'}
      </button>
    </div>
  )
}
