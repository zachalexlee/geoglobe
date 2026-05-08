'use client'

import type { LeaderboardEntry } from '@/app/api/leaderboard/route'

interface LeaderboardTableProps {
  entries: LeaderboardEntry[]
  type: string
  loading: boolean
}

const MEDAL: Record<number, { bg: string; text: string; badge: string }> = {
  1: { bg: 'bg-yellow-500/10 border-yellow-500/30', text: 'text-yellow-400', badge: '🥇' },
  2: { bg: 'bg-gray-400/10 border-gray-400/30', text: 'text-gray-300', badge: '🥈' },
  3: { bg: 'bg-amber-700/10 border-amber-700/30', text: 'text-amber-600', badge: '🥉' },
}

function SkeletonRow() {
  return (
    <tr className="border-b border-white/5">
      {[...Array(5)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 rounded bg-white/10 animate-pulse" style={{ width: i === 1 ? '60%' : '40%' }} />
        </td>
      ))}
    </tr>
  )
}

function ScoreLabel({ type, entry }: { type: string; entry: LeaderboardEntry }) {
  if (type === 'streaks') {
    return (
      <span className="font-mono font-semibold text-orange-400">
        🔥 {entry.streak} days
      </span>
    )
  }
  if (type === 'elo') {
    return (
      <span className="font-mono font-semibold text-purple-400">
        ⚡ {entry.elo}
      </span>
    )
  }
  return (
    <span className="font-mono font-semibold text-emerald-400">
      {entry.score.toLocaleString()} pts
    </span>
  )
}

export default function LeaderboardTable({ entries, type, loading }: LeaderboardTableProps) {
  const scoreHeader = type === 'streaks' ? 'Streak' : type === 'elo' ? 'ELO' : 'Score'

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10 bg-zinc-900/60 backdrop-blur-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-zinc-500">
            <th className="px-4 py-3 w-12">#</th>
            <th className="px-4 py-3">Player</th>
            <th className="px-4 py-3">{scoreHeader}</th>
            {type !== 'streaks' && type !== 'elo' && (
              <th className="px-4 py-3 hidden sm:table-cell">Streak</th>
            )}
            <th className="px-4 py-3 hidden md:table-cell text-right">ELO</th>
          </tr>
        </thead>
        <tbody>
          {loading
            ? [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
            : entries.length === 0
            ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-16 text-center text-zinc-500"
                >
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-3xl">🌍</span>
                    <p className="text-base font-medium text-zinc-400">No entries yet</p>
                    <p className="text-xs">Be the first to play today&apos;s puzzle!</p>
                  </div>
                </td>
              </tr>
            )
            : entries.map((entry) => {
              const medal = MEDAL[entry.rank]
              return (
                <tr
                  key={entry.userId}
                  className={[
                    'border-b border-white/5 transition-colors',
                    medal
                      ? `${medal.bg} border-l-2 ${medal.text}`
                      : 'hover:bg-white/5',
                  ].join(' ')}
                >
                  {/* Rank */}
                  <td className="px-4 py-3 font-mono font-bold text-zinc-400 w-12">
                    {medal ? medal.badge : <span className="text-zinc-500">{entry.rank}</span>}
                  </td>

                  {/* Player */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 min-w-0">
                      {entry.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={entry.avatar}
                          alt={entry.username}
                          className="w-7 h-7 rounded-full object-cover flex-shrink-0 border border-white/10"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full flex-shrink-0 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                          {entry.username[0]?.toUpperCase()}
                        </div>
                      )}
                      <span className="truncate font-medium text-zinc-100">{entry.username}</span>
                      {entry.flag && (
                        <span className="text-base leading-none flex-shrink-0">{entry.flag}</span>
                      )}
                    </div>
                  </td>

                  {/* Score / Streak / ELO primary */}
                  <td className="px-4 py-3">
                    <ScoreLabel type={type} entry={entry} />
                  </td>

                  {/* Streak (when not in streak/elo mode) */}
                  {type !== 'streaks' && type !== 'elo' && (
                    <td className="px-4 py-3 hidden sm:table-cell text-zinc-400">
                      {entry.streak > 0 ? (
                        <span className="text-orange-400">🔥 {entry.streak}</span>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>
                  )}

                  {/* ELO */}
                  <td className="px-4 py-3 hidden md:table-cell text-right font-mono text-zinc-400 text-xs">
                    {entry.elo}
                  </td>
                </tr>
              )
            })}
        </tbody>
      </table>
    </div>
  )
}
