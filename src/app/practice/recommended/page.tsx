'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import WeakSpotCard from '@/components/practice/WeakSpotCard'
import PracticeCard from '@/components/practice/PracticeCard'

// ── Types ──────────────────────────────────────────────────────────────────────

interface CategoryStat {
  avg: number
  count: number
}

interface WeakSpotsResponse {
  weakCategories: string[]
  weakRegions: string[]
  avgScore: number
  totalGames: number
  categoryStats: Record<string, CategoryStat>
  regionStats: Record<string, CategoryStat>
  recommendedMaps: PracticeMapSummary[]
}

interface PracticeMapSummary {
  id: string
  name: string
  description: string | null
  category: string
  difficulty: string
  locationCount: number
  playCount: number
  isOfficial: boolean
}

// ── Skeleton helpers ───────────────────────────────────────────────────────────

function SkeletonWeakSpot() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 animate-pulse">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="h-5 w-40 bg-white/10 rounded" />
          <div className="h-3 w-24 bg-white/8 rounded" />
        </div>
        <div className="h-10 w-16 bg-white/10 rounded" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="h-16 bg-white/8 rounded-xl" />
        <div className="h-16 bg-white/8 rounded-xl" />
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-1">
          <div className="flex justify-between">
            <div className="h-3 w-20 bg-white/10 rounded" />
            <div className="h-3 w-8 bg-white/10 rounded" />
          </div>
          <div className="h-2 w-full bg-white/10 rounded-full" />
        </div>
      ))}
      <div className="h-11 w-full bg-white/10 rounded-xl" />
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-3 animate-pulse">
      <div className="h-4 w-3/4 bg-white/10 rounded" />
      <div className="h-3 w-full bg-white/8 rounded" />
      <div className="flex gap-2">
        <div className="h-5 w-16 bg-white/10 rounded-full" />
        <div className="h-5 w-14 bg-white/10 rounded-full" />
      </div>
      <div className="h-3 w-1/2 bg-white/8 rounded" />
      <div className="h-9 w-full bg-white/10 rounded-xl mt-auto" />
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

const MIN_GAMES_FOR_RECOMMENDATIONS = 5

export default function RecommendedPracticePage() {
  const [data, setData] = useState<WeakSpotsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchWeakSpots() {
      try {
        const res = await fetch('/api/user/weak-spots')
        if (res.status === 401) {
          setError('Please sign in to view personalised recommendations.')
          return
        }
        if (!res.ok) throw new Error('Failed to fetch weak spots')
        const json: WeakSpotsResponse = await res.json()
        setData(json)
      } catch (err) {
        console.error('Failed to load weak spots:', err)
        setError('Something went wrong. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    fetchWeakSpots()
  }, [])

  const notEnoughData =
    !loading && !error && data !== null && data.totalGames < MIN_GAMES_FOR_RECOMMENDATIONS

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/practice"
            className="text-white/50 hover:text-white transition-colors text-sm font-medium"
          >
            ← Practice
          </Link>
          <div>
            <h1 className="text-white font-extrabold text-2xl tracking-tight">
              🎯 Personalised Practice
            </h1>
            <p className="text-white/40 text-sm mt-0.5">
              Maps tailored to your weak areas
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
        {/* ── Weak-spot card ── */}
        <section>
          {loading ? (
            <SkeletonWeakSpot />
          ) : error ? (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6 text-center space-y-2">
              <p className="text-3xl">⚠️</p>
              <p className="text-rose-400 font-semibold">{error}</p>
              {error.includes('sign in') && (
                <Link
                  href="/auth/signin"
                  className="inline-flex items-center gap-2 mt-3 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          ) : notEnoughData ? (
            /* ── Not enough data state ── */
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center space-y-4">
              <p className="text-5xl">🌍</p>
              <div>
                <h2 className="text-white font-extrabold text-xl">
                  Not enough data yet
                </h2>
                <p className="text-white/50 text-sm mt-1 max-w-sm mx-auto">
                  Play more daily puzzles to unlock personalised recommendations.
                  You&apos;ve completed{' '}
                  <span className="text-white font-bold">{data?.totalGames ?? 0}</span> of{' '}
                  <span className="text-white font-bold">{MIN_GAMES_FOR_RECOMMENDATIONS}</span>{' '}
                  required games.
                </p>
              </div>

              {/* Progress bar */}
              <div className="max-w-xs mx-auto">
                <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(
                        100,
                        ((data?.totalGames ?? 0) / MIN_GAMES_FOR_RECOMMENDATIONS) * 100
                      )}%`,
                    }}
                  />
                </div>
                <p className="text-white/30 text-xs mt-1.5 text-right">
                  {data?.totalGames ?? 0} / {MIN_GAMES_FOR_RECOMMENDATIONS} games
                </p>
              </div>

              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-colors"
              >
                ▶ Play Today&apos;s Puzzle
              </Link>
            </div>
          ) : data ? (
            <WeakSpotCard
              weakCategories={data.weakCategories}
              weakRegions={data.weakRegions}
              avgScore={data.avgScore}
              totalGames={data.totalGames}
              categoryStats={data.categoryStats}
              regionStats={data.regionStats}
            />
          ) : null}
        </section>

        {/* ── Recommended maps grid ── */}
        {!notEnoughData && !error && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-extrabold text-lg tracking-tight">
                Recommended Maps
              </h2>
              <Link
                href="/practice"
                className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
              >
                View all →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                : data?.recommendedMaps.slice(0, 6).map((map) => (
                    <PracticeCard
                      key={map.id}
                      id={map.id}
                      name={map.name}
                      description={map.description}
                      category={map.category}
                      difficulty={map.difficulty}
                      locationCount={map.locationCount}
                      playCount={map.playCount}
                      isOfficial={map.isOfficial}
                    />
                  ))}
            </div>

            {/* Empty state (logged-in, has games, but no practice maps exist) */}
            {!loading && data?.recommendedMaps.length === 0 && (
              <div className="text-center py-16 space-y-3">
                <p className="text-5xl">🗺️</p>
                <p className="text-white/50 text-lg font-semibold">No practice maps yet</p>
                <p className="text-white/30 text-sm">
                  Check back soon — new maps are added regularly.
                </p>
                <Link
                  href="/practice/create"
                  className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-colors"
                >
                  + Create Custom Map
                </Link>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  )
}
