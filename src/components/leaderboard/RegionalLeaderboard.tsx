'use client'

import { useState, useEffect, useCallback } from 'react'
import type { LeaderboardEntry } from '@/app/api/leaderboard/route'
import LeaderboardTable from './LeaderboardTable'

const REGIONS = [
  { label: 'Global', value: 'global' },
  { label: '🌎 NA', value: 'NA' },
  { label: '🌍 Europe', value: 'Europe' },
  { label: '🌏 Asia', value: 'Asia' },
  { label: '🌎 SA', value: 'SA' },
  { label: '🌍 Africa', value: 'Africa' },
  { label: '🌏 Oceania', value: 'Oceania' },
]

interface RegionalLeaderboardProps {
  leaderboardType?: string
}

export default function RegionalLeaderboard({ leaderboardType = 'global' }: RegionalLeaderboardProps) {
  const [selectedRegion, setSelectedRegion] = useState<string>('global')
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async (region: string) => {
    setLoading(true)
    try {
      const isGlobal = region === 'global'
      const params = new URLSearchParams({
        type: isGlobal ? leaderboardType : 'regional',
        limit: '50',
      })
      if (!isGlobal) {
        params.set('region', region)
      }
      const res = await fetch(`/api/leaderboard?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data: LeaderboardEntry[] = await res.json()
      setEntries(data)
    } catch {
      setEntries([])
    } finally {
      setLoading(false)
    }
  }, [leaderboardType])

  useEffect(() => {
    fetchData(selectedRegion)
  }, [selectedRegion, fetchData])

  const handleTabClick = (value: string) => {
    setSelectedRegion(value)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Region tabs */}
      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Region filter">
        {REGIONS.map((r) => (
          <button
            key={r.value}
            role="tab"
            aria-selected={selectedRegion === r.value}
            onClick={() => handleTabClick(r.value)}
            className={[
              'px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
              selectedRegion === r.value
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200 border border-white/10',
            ].join(' ')}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Leaderboard table */}
      <LeaderboardTable
        entries={entries}
        type={selectedRegion === 'global' ? leaderboardType : 'regional'}
        loading={loading}
      />
    </div>
  )
}
