'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import GroupLeaderboard from '@/components/groups/GroupLeaderboard'

interface GroupDetail {
  id: string
  name: string
  code: string
  isPublic: boolean
  memberCount: number
  createdAt: string
  createdById: string
}

export default function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const [groupId, setGroupId] = useState<string | null>(null)
  const [group, setGroup] = useState<GroupDetail | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [leavingLoading, setLeavingLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Resolve params
  useEffect(() => {
    params.then(({ id }) => setGroupId(id))
  }, [params])

  const fetchData = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const [groupRes, sessionRes] = await Promise.all([
        fetch(`/api/groups/${id}`),
        fetch('/api/auth/session'),
      ])

      if (!groupRes.ok) {
        const data = await groupRes.json()
        throw new Error(data.error || 'Group not found')
      }

      const groupData = await groupRes.json()
      setGroup(groupData.group)

      // Determine current user's role
      if (sessionRes.ok) {
        const session = await sessionRes.json()
        const uid = session?.user?.id
        setCurrentUserId(uid ?? null)
        if (uid) {
          const memberEntry = groupData.members.find(
            (m: { userId: string; role: string }) => m.userId === uid
          )
          setUserRole(memberEntry?.role ?? null)
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (groupId) fetchData(groupId)
  }, [groupId, fetchData])

  const handleCopyCode = async () => {
    if (!group) return
    try {
      await navigator.clipboard.writeText(group.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // ignore
    }
  }

  const handleLeave = async () => {
    if (!groupId || !currentUserId) return
    if (!confirm('Are you sure you want to leave this group?')) return
    setLeavingLoading(true)
    try {
      const res = await fetch(`/api/groups/${groupId}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Failed to leave group')
        return
      }
      router.push('/groups')
    } catch {
      alert('Failed to leave group')
    } finally {
      setLeavingLoading(false)
    }
  }

  if (loading || !groupId) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
          <div className="h-8 w-48 rounded-xl bg-zinc-800 animate-pulse" />
          <div className="h-4 w-32 rounded bg-zinc-800 animate-pulse" />
          <div className="h-64 rounded-xl bg-zinc-900 animate-pulse" />
        </div>
      </div>
    )
  }

  if (error || !group) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-3xl">😕</p>
          <p className="text-zinc-400">{error ?? 'Group not found'}</p>
          <button
            onClick={() => router.push('/groups')}
            className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm transition-colors"
          >
            ← Back to Groups
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-zinc-950/80 backdrop-blur border-b border-white/5 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <button
            onClick={() => router.push('/groups')}
            className="text-zinc-500 hover:text-zinc-300 transition-colors text-sm flex items-center gap-1"
          >
            ← Back
          </button>
          <div className="flex-1 min-w-0 text-center">
            <h1 className="font-bold text-zinc-100 truncate">{group.name}</h1>
          </div>
          {/* Leave button (non-admins only) */}
          {userRole && userRole !== 'admin' && (
            <button
              onClick={handleLeave}
              disabled={leavingLoading}
              className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-medium transition-colors disabled:opacity-50"
            >
              {leavingLoading ? '…' : 'Leave'}
            </button>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Group info card */}
        <div className="rounded-xl border border-white/10 bg-zinc-900/60 p-4 space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className={[
                'text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded',
                group.isPublic
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-zinc-700 text-zinc-400 border border-zinc-600',
              ].join(' ')}
            >
              {group.isPublic ? 'Public' : 'Private'}
            </span>
            <span className="text-xs text-zinc-500">
              👥 {group.memberCount} member{group.memberCount !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Join code */}
          <div>
            <p className="text-xs text-zinc-500 mb-1">Join Code</p>
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg font-bold text-zinc-100 tracking-widest bg-zinc-800 px-3 py-1.5 rounded-lg border border-white/10">
                {group.code}
              </span>
              <button
                onClick={handleCopyCode}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-white/10 text-zinc-400 hover:text-zinc-200 text-xs font-medium transition-all"
              >
                {copied ? '✓ Copied!' : '⎘ Copy'}
              </button>
            </div>
          </div>
        </div>

        {/* Leaderboard + Members */}
        <GroupLeaderboard groupId={group.id} />
      </main>
    </div>
  )
}
