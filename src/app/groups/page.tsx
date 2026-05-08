'use client'

import { useState, useEffect, useCallback } from 'react'
import GroupCard from '@/components/groups/GroupCard'

interface GroupInfo {
  id: string
  name: string
  code: string
  isPublic: boolean
  memberCount: number
  createdAt: string
  isJoined: boolean
}

function CreateGroupModal({
  onClose,
  onCreated,
}: {
  onClose: () => void
  onCreated: (group: GroupInfo) => void
}) {
  const [name, setName] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), isPublic }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create group')
      onCreated(data)
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="font-semibold text-zinc-100">Create Group</h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Group Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              placeholder="My Awesome Group"
              required
              className="w-full rounded-lg bg-zinc-800 border border-white/10 text-zinc-100 placeholder:text-zinc-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-300">Public Group</p>
              <p className="text-xs text-zinc-500">Anyone can discover and join</p>
            </div>
            <button
              type="button"
              onClick={() => setIsPublic((v) => !v)}
              className={[
                'relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500',
                isPublic ? 'bg-blue-600' : 'bg-zinc-700',
              ].join(' ')}
              aria-checked={isPublic}
              role="switch"
            >
              <span
                className={[
                  'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
                  isPublic ? 'translate-x-5' : 'translate-x-0.5',
                ].join(' ')}
              />
            </button>
          </div>
          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm transition-colors"
          >
            {loading ? 'Creating…' : 'Create Group'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<GroupInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [joinLoading, setJoinLoading] = useState(false)
  const [joinError, setJoinError] = useState<string | null>(null)

  const fetchGroups = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/groups')
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to load groups')
      }
      const data: GroupInfo[] = await res.json()
      setGroups(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchGroups()
  }, [fetchGroups])

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!joinCode.trim()) return
    setJoinLoading(true)
    setJoinError(null)
    try {
      const res = await fetch('/api/groups/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: joinCode.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to join group')
      setGroups((prev) => {
        const exists = prev.find((g) => g.id === data.id)
        if (exists) return prev.map((g) => (g.id === data.id ? { ...g, isJoined: true } : g))
        return [data, ...prev]
      })
      setJoinCode('')
    } catch (e) {
      setJoinError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setJoinLoading(false)
    }
  }

  const handleCreated = (group: GroupInfo) => {
    setGroups((prev) => [group, ...prev])
  }

  const myGroups = groups.filter((g) => g.isJoined)
  const publicGroups = groups.filter((g) => g.isPublic && !g.isJoined)

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-zinc-950/80 backdrop-blur border-b border-white/5 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              👥 Groups
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">Compete with friends and communities</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors flex items-center gap-2"
          >
            <span>+</span> Create Group
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-8">
        {/* Join by Code */}
        <section className="rounded-xl border border-white/10 bg-zinc-900/60 p-4">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
            Join by Code
          </h2>
          <form onSubmit={handleJoin} className="flex gap-2">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              maxLength={8}
              placeholder="Enter code (e.g. AB3XYZ)"
              className="flex-1 rounded-lg bg-zinc-800 border border-white/10 text-zinc-100 placeholder:text-zinc-600 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
            />
            <button
              type="submit"
              disabled={joinLoading || !joinCode.trim()}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
            >
              {joinLoading ? '…' : 'Join'}
            </button>
          </form>
          {joinError && (
            <p className="mt-2 text-xs text-red-400">{joinError}</p>
          )}
        </section>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-4 text-center text-red-400 text-sm">
            {error}
            <button
              onClick={fetchGroups}
              className="ml-2 underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Your Groups */}
        <section>
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
            Your Groups
          </h2>
          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 rounded-xl bg-zinc-900 animate-pulse border border-white/10" />
              ))}
            </div>
          ) : myGroups.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-zinc-900/40 px-4 py-8 text-center">
              <p className="text-2xl mb-2">🌍</p>
              <p className="text-zinc-400 text-sm">You haven&apos;t joined any groups yet.</p>
              <p className="text-zinc-600 text-xs mt-1">Create one or enter a join code above.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {myGroups.map((g) => (
                <GroupCard key={g.id} {...g} />
              ))}
            </div>
          )}
        </section>

        {/* Discover Public Groups */}
        <section>
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
            Discover Public Groups
          </h2>
          {loading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 rounded-xl bg-zinc-900 animate-pulse border border-white/10" />
              ))}
            </div>
          ) : publicGroups.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-zinc-900/40 px-4 py-8 text-center">
              <p className="text-2xl mb-2">🔭</p>
              <p className="text-zinc-400 text-sm">No public groups to discover right now.</p>
              <p className="text-zinc-600 text-xs mt-1">Create a public group and be the first!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {publicGroups.map((g) => (
                <GroupCard key={g.id} {...g} />
              ))}
            </div>
          )}
        </section>
      </main>

      {showCreate && (
        <CreateGroupModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  )
}
