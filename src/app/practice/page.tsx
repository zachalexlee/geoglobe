'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import PracticeCard from '@/components/practice/PracticeCard'

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

type CategoryFilter = 'all' | 'capitals' | 'countries' | 'themed' | 'custom'
type DifficultyFilter = 'all' | 'easy' | 'medium' | 'hard'

const CATEGORY_TABS: { value: CategoryFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'capitals', label: 'World Capitals' },
  { value: 'countries', label: 'Countries' },
  { value: 'themed', label: 'Themed' },
  { value: 'custom', label: 'Custom' },
]

const DIFFICULTY_TABS: { value: DifficultyFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
]

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

export default function PracticePage() {
  const [maps, setMaps] = useState<PracticeMapSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all')

  useEffect(() => {
    async function fetchMaps() {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (categoryFilter !== 'all') params.set('category', categoryFilter)
        if (difficultyFilter !== 'all') params.set('difficulty', difficultyFilter)

        const res = await fetch(`/api/practice?${params.toString()}`)
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        setMaps(data)
      } catch (err) {
        console.error('Failed to load practice maps:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchMaps()
  }, [categoryFilter, difficultyFilter])

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-white font-extrabold text-2xl tracking-tight">
              🌍 Practice Mode
            </h1>
            <p className="text-white/40 text-sm mt-0.5">
              Sharpen your geography skills, no pressure
            </p>
          </div>
          <Link
            href="/practice/create"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-sm font-bold transition-colors"
          >
            + Create Map
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Filters */}
        <div className="space-y-3">
          {/* Category tabs */}
          <div>
            <p className="text-white/40 text-xs uppercase tracking-widest mb-2">Category</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setCategoryFilter(tab.value)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                    categoryFilter === tab.value
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty tabs */}
          <div>
            <p className="text-white/40 text-xs uppercase tracking-widest mb-2">Difficulty</p>
            <div className="flex flex-wrap gap-2">
              {DIFFICULTY_TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setDifficultyFilter(tab.value)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                    difficultyFilter === tab.value
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Map count */}
        {!loading && (
          <p className="text-white/30 text-sm">
            {maps.length} map{maps.length !== 1 ? 's' : ''} found
          </p>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : maps.map((map) => (
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

        {/* Empty state */}
        {!loading && maps.length === 0 && (
          <div className="text-center py-20 space-y-3">
            <p className="text-5xl">🗺️</p>
            <p className="text-white/50 text-lg font-semibold">No maps found</p>
            <p className="text-white/30 text-sm">Try adjusting your filters or create a custom map.</p>
            <Link
              href="/practice/create"
              className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-colors"
            >
              + Create Custom Map
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
