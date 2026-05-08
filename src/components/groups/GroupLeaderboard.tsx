'use client'

import { useState, useEffect } from 'react'

interface LeaderboardEntry {
  rank: number
  userId: string
  username: string
  avatar: string | null
  flag: string | null
  score: number
}

interface Member {
  userId: string
  username: string
  avatar: string | null
  flag: string | null
  role: string
}

interface GroupData {
  group: {
    id: string
    name: string
    code: string
    isPublic: boolean
    memberCount: number
    createdAt: string
    createdById: string
  }
  members: Member[]
  leaderboard: LeaderboardEntry[]
}

const MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 animate-pulse">
      <div className="w-6 h-4 rounded bg-white/10" />
      <div className="w-7 h-7 rounded-full bg-white/10 flex-shrink-0" />
      <div className="h-4 rounded bg-white/10 flex-1" style={{ maxWidth: '60%' }} />
      <div className="w-16 h-4 rounded bg-white/10 ml-auto" />
    </div>
  )
}

function Avatar({ username, avatar }: { username: string; avatar: string | null }) {
  if (avatar) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatar}
        alt={username}
        className="w-7 h-7 rounded-full object-cover border border-white/10 flex-shrink-0"
      />
    )
  }
  return (
    <div className="w-7 h-7 rounded-full flex-shrink-0 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
      {username[0]?.toUpperCase()}
    </div>
  )
}

export default function GroupLeaderboard({ groupId }: { groupId: string }) {
  const [data, setData] = useState<GroupData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchGroup() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/groups/${groupId}`)
        if (!res.ok) throw new Error('Failed to load group data')
        const json: GroupData = await res.json()
        setData(json)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    fetchGroup()
  }, [groupId])

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Leaderboard skeleton */}
        <div className="rounded-xl border border-white/10 bg-zinc-900/60 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10">
            <div className="h-4 w-32 rounded bg-white/10 animate-pulse" />
          </div>
          {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
        </div>
        {/* Members skeleton */}
        <div className="rounded-xl border border-white/10 bg-zinc-900/60 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10">
            <div className="h-4 w-24 rounded bg-white/10 animate-pulse" />
          </div>
          {[...Array(3)].map((_, i) => <SkeletonRow key={i} />)}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-8 text-center text-red-400">
        {error}
      </div>
    )
  }

  if (!data) return null

  const { leaderboard, members } = data

  return (
    <div className="space-y-4">
      {/* Leaderboard */}
      <div className="rounded-xl border border-white/10 bg-zinc-900/60 overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-300">🏆 Today&apos;s Leaderboard</h3>
          <span className="text-xs text-zinc-500">{leaderboard.length} played</span>
        </div>

        {leaderboard.length === 0 ? (
          <div className="px-4 py-10 text-center text-zinc-500 text-sm">
            <p className="text-2xl mb-2">📍</p>
            <p>No scores yet today — be the first!</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {leaderboard.map((entry) => (
              <div
                key={entry.userId}
                className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
              >
                <span className="w-7 text-center font-mono text-sm flex-shrink-0">
                  {MEDAL[entry.rank] ?? (
                    <span className="text-zinc-500 text-xs">{entry.rank}</span>
                  )}
                </span>
                <Avatar username={entry.username} avatar={entry.avatar} />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-zinc-100 truncate block">
                    {entry.flag && <span className="mr-1">{entry.flag}</span>}
                    {entry.username}
                  </span>
                </div>
                <span className="font-mono text-emerald-400 font-semibold text-sm flex-shrink-0">
                  {entry.score.toLocaleString()} pts
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Members */}
      <div className="rounded-xl border border-white/10 bg-zinc-900/60 overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-300">👥 Members</h3>
          <span className="text-xs text-zinc-500">{members.length} total</span>
        </div>
        <div className="divide-y divide-white/5">
          {members.map((member) => (
            <div key={member.userId} className="flex items-center gap-3 px-4 py-3">
              <Avatar username={member.username} avatar={member.avatar} />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-zinc-100 truncate block">
                  {member.flag && <span className="mr-1">{member.flag}</span>}
                  {member.username}
                </span>
              </div>
              {member.role === 'admin' && (
                <span className="text-[10px] uppercase tracking-widest font-bold px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 flex-shrink-0">
                  Admin
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
