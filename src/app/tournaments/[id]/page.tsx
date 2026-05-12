'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { use } from 'react'

interface TournamentEntry {
  id: string
  userId: string
  score: number
  rank: number
  createdAt: string
}

interface TournamentDetail {
  id: string
  name: string
  type: 'daily' | 'weekly'
  startDate: string
  endDate: string
  status: 'active' | 'finished'
  prizes: Array<{ rank: number; description: string }>
  entries: TournamentEntry[]
}

export default function TournamentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: session } = useSession()
  const [tournament, setTournament] = useState<TournamentDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [entering, setEntering] = useState(false)

  useEffect(() => {
    fetch(`/api/tournaments/${id}`)
      .then((r) => r.json())
      .then((data) => setTournament(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const handleEnter = async () => {
    setEntering(true)
    try {
      await fetch(`/api/tournaments/${id}/enter`, { method: 'POST' })
      // Refresh
      const res = await fetch(`/api/tournaments/${id}`)
      setTournament(await res.json())
    } catch {
      // silently fail
    } finally {
      setEntering(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <p className="text-white/50 animate-pulse">Loading tournament...</p>
      </div>
    )
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <p className="text-red-400">Tournament not found</p>
          <Link href="/tournaments" className="inline-block px-6 py-2.5 rounded-xl bg-white/10 text-white font-medium">
            Back
          </Link>
        </div>
      </div>
    )
  }

  const isEntered = tournament.entries.some((e) => e.userId === session?.user?.id)

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <Link href="/tournaments" className="text-white/40 text-sm hover:text-white/60 transition-colors mb-4 inline-block">
            ← Back to Tournaments
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">{tournament.name}</h1>
          <div className="flex items-center gap-3">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              tournament.type === 'daily'
                ? 'bg-teal-600/20 text-teal-400'
                : 'bg-purple-600/20 text-purple-400'
            }`}>
              {tournament.type === 'daily' ? '📅 Daily' : '📆 Weekly'}
            </span>
            <span className={`text-xs font-medium px-2 py-1 rounded-lg ${
              tournament.status === 'active'
                ? 'bg-green-500/20 text-green-400'
                : 'bg-white/10 text-white/40'
            }`}>
              {tournament.status === 'active' ? '🟢 Live' : '⏹ Ended'}
            </span>
            <span className="text-white/30 text-xs">
              {new Date(tournament.startDate).toLocaleDateString()} — {new Date(tournament.endDate).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Prizes */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-3">🎁 Prizes</h2>
          <div className="space-y-2">
            {tournament.prizes.map((prize, idx) => (
              <div key={idx} className="flex items-center gap-3 px-3 py-2 bg-white/5 rounded-lg">
                <span className="text-white">{prize.description}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Enter button */}
        {session?.user && tournament.status === 'active' && !isEntered && (
          <button
            onClick={handleEnter}
            disabled={entering}
            className="w-full px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:bg-teal-600/50 text-white font-bold transition-colors"
          >
            {entering ? 'Entering...' : '⚡ Enter Tournament'}
          </button>
        )}

        {isEntered && (
          <div className="bg-teal-600/10 border border-teal-500/30 rounded-xl px-4 py-3 text-teal-400 text-sm text-center font-medium">
            ✓ You are entered in this tournament
          </div>
        )}

        {/* Leaderboard */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-4">🏆 Leaderboard</h2>
          {tournament.entries.length === 0 ? (
            <p className="text-white/40 text-center py-6">No entries yet. Be the first!</p>
          ) : (
            <div className="space-y-2">
              {tournament.entries.map((entry) => (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl ${
                    entry.userId === session?.user?.id
                      ? 'bg-teal-600/20 border border-teal-500/30'
                      : 'bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-lg font-bold w-8 ${
                      entry.rank === 1 ? 'text-yellow-400' :
                      entry.rank === 2 ? 'text-gray-300' :
                      entry.rank === 3 ? 'text-amber-600' :
                      'text-white/40'
                    }`}>
                      {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : `#${entry.rank}`}
                    </span>
                    <span className="text-white text-sm">
                      Player {entry.userId.slice(-4)}
                      {entry.userId === session?.user?.id ? ' (You)' : ''}
                    </span>
                  </div>
                  <span className="text-teal-400 font-bold">{entry.score} pts</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
