'use client'

import { useState, useEffect, useCallback } from 'react'
import type { LeaderboardEntry } from '@/app/api/leaderboard/route'
import LeaderboardTable from '@/components/leaderboard/LeaderboardTable'
import RegionalLeaderboard from '@/components/leaderboard/RegionalLeaderboard'

type Tab = {
  id: string
  label: string
  icon: string
  description: string
}

const TABS: Tab[] = [
  { id: 'global', label: "Today", icon: '🏆', description: "Top scores for today's puzzle" },
  { id: 'monthly', label: 'Monthly', icon: '📅', description: 'Best cumulative scores this month' },
  { id: 'streaks', label: 'Streaks', icon: '🔥', description: 'Longest active daily streaks' },
  { id: 'elo', label: 'ELO', icon: '⚡', description: 'Competitive ELO rankings' },
]

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<string>('global')
  const [showRegional, setShowRegional] = useState(false)
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const currentTab = TABS.find((t) => t.id === activeTab)!

  const fetchLeaderboard = useCallback(async (type: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/leaderboard?type=${type}&limit=50`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data: LeaderboardEntry[] = await res.json()
      setEntries(data)
      setLastUpdated(new Date())
    } catch {
      setEntries([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!showRegional) {
      fetchLeaderboard(activeTab)
    }
  }, [activeTab, showRegional, fetchLeaderboard])

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    setShowRegional(false)
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-zinc-950/80 backdrop-blur border-b border-white/5 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              🌍 <span>GeoGlobe Leaderboard</span>
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">{currentTab.description}</p>
          </div>
          {lastUpdated && (
            <p className="text-xs text-zinc-600 hidden sm:block">
              Updated {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Main Tabs */}
        <div className="flex gap-1 bg-zinc-900 p-1 rounded-xl border border-white/5" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={[
                'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
                activeTab === tab.id
                  ? 'bg-zinc-700 text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300',
              ].join(' ')}
            >
              <span className="text-base leading-none">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden text-xs">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Regional toggle (only for today/monthly tabs) */}
        {(activeTab === 'global' || activeTab === 'monthly') && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowRegional(false)}
              className={[
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                !showRegional
                  ? 'bg-zinc-700 text-white'
                  : 'text-zinc-500 hover:text-zinc-300',
              ].join(' ')}
            >
              🌐 Global
            </button>
            <button
              onClick={() => setShowRegional(true)}
              className={[
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                showRegional
                  ? 'bg-blue-600 text-white'
                  : 'text-zinc-500 hover:text-zinc-300',
              ].join(' ')}
            >
              🗺️ By Region
            </button>
          </div>
        )}

        {/* Content */}
        {showRegional && (activeTab === 'global' || activeTab === 'monthly') ? (
          <RegionalLeaderboard leaderboardType={activeTab} />
        ) : (
          <div className="space-y-3">
            {/* Top 3 summary cards for non-loading, non-empty states */}
            {!loading && entries.length >= 3 && activeTab === 'global' && (
              <div className="grid grid-cols-3 gap-3 mb-2">
                {[
                  { entry: entries[1], order: 2, size: 'h-16', medal: '🥈', color: 'from-gray-600 to-gray-700' },
                  { entry: entries[0], order: 1, size: 'h-20', medal: '🥇', color: 'from-yellow-600 to-yellow-700' },
                  { entry: entries[2], order: 3, size: 'h-14', medal: '🥉', color: 'from-amber-700 to-amber-800' },
                ].map(({ entry, order, size, medal, color }) =>
                  entry ? (
                    <div
                      key={order}
                      className={`flex flex-col items-center justify-end gap-1 ${size} rounded-xl bg-gradient-to-b ${color} bg-opacity-20 border border-white/10 p-2 text-center`}
                    >
                      <span className="text-lg leading-none">{medal}</span>
                      <div className="flex flex-col items-center min-w-0 w-full">
                        <span className="text-xs font-semibold text-white truncate w-full text-center">
                          {entry.flag} {entry.username}
                        </span>
                        <span className="text-xs text-zinc-300 font-mono">
                          {entry.score.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ) : null
                )}
              </div>
            )}

            <LeaderboardTable entries={entries} type={activeTab} loading={loading} />

            {/* Refresh button */}
            <div className="flex justify-center pt-2">
              <button
                onClick={() => fetchLeaderboard(activeTab)}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs font-medium transition-all disabled:opacity-40"
              >
                <span className={loading ? 'animate-spin' : ''}>↻</span>
                Refresh
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
