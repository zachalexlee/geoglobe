'use client'

import Link from 'next/link'

interface CategoryStat {
  avg: number
  count: number
}

interface WeakSpotCardProps {
  weakCategories: string[]
  weakRegions: string[]
  avgScore: number
  totalGames: number
  categoryStats?: Record<string, CategoryStat>
  regionStats?: Record<string, CategoryStat>
}

/** Max score per round is 1000, so 1000 is the perfect score per round. */
const MAX_ROUND_SCORE = 1000

/** Capitalise and tidy up a raw category/region string. */
function formatLabel(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/** Return a Tailwind colour class based on a 0-100 percentage. */
function barColor(pct: number): string {
  if (pct >= 70) return 'bg-emerald-500'
  if (pct >= 45) return 'bg-amber-400'
  return 'bg-rose-500'
}

/** Render a single stat bar row (category or region). */
function StatBar({
  label,
  avg,
  isWeakest,
}: {
  label: string
  avg: number
  isWeakest: boolean
}) {
  const pct = Math.round((avg / MAX_ROUND_SCORE) * 100)
  const color = barColor(pct)

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-white/70 font-medium">
          {isWeakest && (
            <span className="text-rose-400 text-[10px] font-bold uppercase tracking-wide">
              ⚠ weak
            </span>
          )}
          {formatLabel(label)}
        </span>
        <span className={`font-bold tabular-nums ${pct < 45 ? 'text-rose-400' : pct < 70 ? 'text-amber-400' : 'text-emerald-400'}`}>
          {pct}%
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export default function WeakSpotCard({
  weakCategories,
  weakRegions,
  avgScore,
  totalGames,
  categoryStats = {},
  regionStats = {},
}: WeakSpotCardProps) {
  // Overall average as % of a perfect 5-round game (5000 pts)
  const overallPct = Math.round((avgScore / 5000) * 100)
  const overallColor =
    overallPct >= 70 ? 'text-emerald-400' : overallPct >= 45 ? 'text-amber-400' : 'text-rose-400'

  // Determine the single weakest category/region for summary callouts
  const weakestCat = weakCategories[0]
  const weakestRegion = weakRegions[0]

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-white font-extrabold text-lg tracking-tight flex items-center gap-2">
            🎯 Your Weak Spots
          </h2>
          <p className="text-white/40 text-sm mt-0.5">
            Based on your last {totalGames} game{totalGames !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Overall score badge */}
        <div className="text-right shrink-0">
          <p className={`text-3xl font-black tabular-nums ${overallColor}`}>{overallPct}%</p>
          <p className="text-white/30 text-[11px]">avg accuracy</p>
        </div>
      </div>

      {/* Quick-glance callouts */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
          <p className="text-rose-400 text-[10px] font-bold uppercase tracking-wider mb-1">
            Weakest Category
          </p>
          <p className="text-white font-bold text-sm truncate">
            {weakestCat ? formatLabel(weakestCat) : '—'}
          </p>
        </div>
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
          <p className="text-rose-400 text-[10px] font-bold uppercase tracking-wider mb-1">
            Weakest Region
          </p>
          <p className="text-white font-bold text-sm truncate">
            {weakestRegion ? formatLabel(weakestRegion) : '—'}
          </p>
        </div>
      </div>

      {/* Category performance bars */}
      {Object.keys(categoryStats).length > 0 && (
        <div className="space-y-3">
          <p className="text-white/40 text-xs font-semibold uppercase tracking-widest">
            By Category
          </p>
          {weakCategories.map((cat, idx) => {
            const stat = categoryStats[cat]
            if (!stat) return null
            return (
              <StatBar
                key={cat}
                label={cat}
                avg={stat.avg}
                isWeakest={idx === 0}
              />
            )
          })}
        </div>
      )}

      {/* Region performance list */}
      {Object.keys(regionStats).length > 0 && (
        <div className="space-y-3">
          <p className="text-white/40 text-xs font-semibold uppercase tracking-widest">
            By Region
          </p>
          {weakRegions.map((region, idx) => {
            const stat = regionStats[region]
            if (!stat) return null
            return (
              <StatBar
                key={region}
                label={region}
                avg={stat.avg}
                isWeakest={idx === 0}
              />
            )
          })}
        </div>
      )}

      {/* CTA */}
      <Link
        href="/practice/recommended"
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-sm transition-colors"
      >
        🏋️ Practice Weak Areas
      </Link>
    </div>
  )
}
