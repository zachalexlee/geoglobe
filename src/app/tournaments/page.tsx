'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface Tournament {
  id: string
  name: string
  type: 'daily' | 'weekly'
  startDate: string
  endDate: string
  status: 'active' | 'finished'
  prizes: Array<{ rank: number; description: string }>
  _count: { entries: number }
}

export default function TournamentsPage() {
  const { data: session } = useSession()
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/tournaments')
      .then((r) => r.json())
      .then((data) => setTournaments(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <p className="text-white/50 animate-pulse">Loading tournaments...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">🏆 Tournaments</h1>
          <p className="text-white/60">Compete for daily and weekly prizes</p>
        </div>

        {tournaments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/40">No active tournaments right now</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tournaments.map((t) => (
              <div
                key={t.id}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-white font-bold text-lg">{t.name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        t.type === 'daily'
                          ? 'bg-teal-600/20 text-teal-400'
                          : 'bg-purple-600/20 text-purple-400'
                      }`}>
                        {t.type === 'daily' ? '📅 Daily' : '📆 Weekly'}
                      </span>
                      <span className="text-white/40 text-xs">
                        {t._count.entries} participants
                      </span>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-lg ${
                    t.status === 'active'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-white/10 text-white/40'
                  }`}>
                    {t.status === 'active' ? '🟢 Live' : '⏹ Ended'}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <span className="text-white/30 text-xs">
                    {new Date(t.startDate).toLocaleDateString()} — {new Date(t.endDate).toLocaleDateString()}
                  </span>
                </div>

                {/* Prizes */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {t.prizes.map((prize, idx) => (
                    <span key={idx} className="text-xs bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white/60">
                      {prize.description}
                    </span>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Link
                    href={`/tournaments/${t.id}`}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition-colors"
                  >
                    View Leaderboard
                  </Link>
                  {session?.user && t.status === 'active' && (
                    <EnterButton tournamentId={t.id} />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function EnterButton({ tournamentId }: { tournamentId: string }) {
  const [entering, setEntering] = useState(false)
  const [entered, setEntered] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleEnter = async () => {
    setEntering(true)
    setError(null)
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/enter`, { method: 'POST' })
      const data = await res.json()
      if (res.status === 409) {
        setEntered(true)
      } else if (!res.ok) {
        setError(data.error)
      } else {
        setEntered(true)
      }
    } catch {
      setError('Failed to enter')
    } finally {
      setEntering(false)
    }
  }

  if (entered) {
    return (
      <span className="px-4 py-2 rounded-xl bg-teal-600/20 text-teal-400 text-sm font-medium">
        ✓ Entered
      </span>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleEnter}
        disabled={entering}
        className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:bg-teal-600/50 text-white text-sm font-bold transition-colors"
      >
        {entering ? 'Entering...' : '⚡ Enter'}
      </button>
      {error && <span className="text-red-400 text-xs">{error}</span>}
    </div>
  )
}
