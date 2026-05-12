'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

export default function RoomsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [joinCode, setJoinCode] = useState('')
  const [creating, setCreating] = useState(false)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreate = async () => {
    if (!session?.user) return
    setCreating(true)
    setError(null)
    try {
      const res = await fetch('/api/rooms', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create room')
      router.push(`/rooms/${data.code}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create room')
    } finally {
      setCreating(false)
    }
  }

  const handleJoin = async () => {
    if (!session?.user || !joinCode.trim()) return
    setJoining(true)
    setError(null)
    try {
      const code = joinCode.trim().toUpperCase()
      const res = await fetch(`/api/rooms/${code}/join`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to join room')
      router.push(`/rooms/${code}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to join room')
    } finally {
      setJoining(false)
    }
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-white">Multiplayer Rooms</h1>
          <p className="text-white/60">Sign in to create or join a room</p>
          <Link
            href="/auth/signin"
            className="inline-block px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-medium transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">🎮 Multiplayer Rooms</h1>
          <p className="text-white/60">Play with 3-8 friends in real-time</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Create Room */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Create a Room</h2>
          <p className="text-white/50 text-sm">Start a new game and invite friends with a code</p>
          <button
            onClick={handleCreate}
            disabled={creating}
            className="w-full px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:bg-teal-600/50 text-white font-bold transition-colors"
          >
            {creating ? 'Creating...' : '+ Create Room'}
          </button>
        </div>

        {/* Join Room */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Join a Room</h2>
          <p className="text-white/50 text-sm">Enter the 6-character room code</p>
          <div className="flex gap-3">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="ABCDEF"
              maxLength={6}
              className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-center font-mono text-lg tracking-widest focus:outline-none focus:border-teal-500/50"
            />
            <button
              onClick={handleJoin}
              disabled={joining || joinCode.trim().length < 6}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-bold transition-colors"
            >
              {joining ? '...' : 'Join'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
