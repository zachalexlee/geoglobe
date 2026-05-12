'use client'

import { BADGE_DEFINITIONS, type BadgeCondition } from '@/lib/badges'

interface BadgeProgressProps {
  /** Number of games the user has played */
  gamesPlayed: number
  /** Current streak */
  streak: number
  /** Current level */
  level: number
  /** Whether user has scored 100 on any single round */
  hasPerfectRound: boolean
  /** Whether user has scored 500 on any single game */
  hasPerfectGame: boolean
  /** Best (lowest) distance in km across all rounds */
  bestDistanceKm: number | null
  /** Names of badges already earned */
  earnedBadgeNames: Set<string>
}

export default function BadgeProgress({
  gamesPlayed,
  streak,
  level,
  hasPerfectRound,
  hasPerfectGame,
  bestDistanceKm,
  earnedBadgeNames,
}: BadgeProgressProps) {
  function getProgress(condition: BadgeCondition): { current: number; target: number; percent: number; achieved: boolean } {
    switch (condition.type) {
      case 'games_played':
        return {
          current: gamesPlayed,
          target: condition.value,
          percent: Math.min(100, Math.round((gamesPlayed / condition.value) * 100)),
          achieved: gamesPlayed >= condition.value,
        }
      case 'streak':
        return {
          current: streak,
          target: condition.value,
          percent: Math.min(100, Math.round((streak / condition.value) * 100)),
          achieved: streak >= condition.value,
        }
      case 'level':
        return {
          current: level,
          target: condition.value,
          percent: Math.min(100, Math.round((level / condition.value) * 100)),
          achieved: level >= condition.value,
        }
      case 'perfect_round':
        return {
          current: hasPerfectRound ? 1 : 0,
          target: 1,
          percent: hasPerfectRound ? 100 : 0,
          achieved: hasPerfectRound,
        }
      case 'perfect_game':
        return {
          current: hasPerfectGame ? 500 : 0,
          target: 500,
          percent: hasPerfectGame ? 100 : 0,
          achieved: hasPerfectGame,
        }
      case 'distance_km':
        const dist = bestDistanceKm ?? Infinity
        // For distance badges: user needs to guess WITHIN the target km
        const achieved = dist <= condition.value
        return {
          current: achieved ? condition.value : Math.round(dist),
          target: condition.value,
          percent: achieved ? 100 : Math.max(0, Math.round(((5000 - dist) / (5000 - condition.value)) * 100)),
          achieved,
        }
    }
  }

  function formatProgressLabel(condition: BadgeCondition, progress: ReturnType<typeof getProgress>): string {
    switch (condition.type) {
      case 'games_played':
        return `${progress.current} / ${progress.target} games`
      case 'streak':
        return `${progress.current} / ${progress.target} day streak`
      case 'level':
        return `Level ${progress.current} / ${progress.target}`
      case 'perfect_round':
        return progress.achieved ? 'Achieved!' : 'Score 100 on a round'
      case 'perfect_game':
        return progress.achieved ? 'Achieved!' : 'Score 500 in one game'
      case 'distance_km':
        return progress.achieved ? 'Achieved!' : `Best: ${progress.current > 5000 ? '—' : progress.current + ' km'} (need ≤${progress.target} km)`
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-zinc-500 text-xs uppercase tracking-widest">
        Achievement Progress
      </p>

      <div className="space-y-3">
        {BADGE_DEFINITIONS.map((def) => {
          const isEarned = earnedBadgeNames.has(def.name)
          const progress = getProgress(def.condition)

          return (
            <div
              key={def.name}
              className={[
                'rounded-xl border p-3 transition-all',
                isEarned
                  ? 'bg-emerald-500/10 border-emerald-500/20'
                  : 'bg-zinc-900 border-white/5',
              ].join(' ')}
            >
              <div className="flex items-center gap-3">
                {/* Icon */}
                <span className="text-2xl leading-none shrink-0">
                  {isEarned ? def.icon : '🔒'}
                </span>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={[
                      'text-sm font-semibold truncate',
                      isEarned ? 'text-emerald-400' : 'text-zinc-300',
                    ].join(' ')}>
                      {def.name}
                    </span>
                    {isEarned && (
                      <span className="text-emerald-400 text-xs font-bold shrink-0">✓</span>
                    )}
                  </div>

                  <p className="text-zinc-500 text-xs mt-0.5">{def.description}</p>

                  {/* Progress bar */}
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-zinc-500 text-[10px]">
                        {formatProgressLabel(def.condition, progress)}
                      </span>
                      <span className="text-zinc-600 text-[10px] tabular-nums">
                        {progress.percent}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${progress.percent}%`,
                          background: isEarned
                            ? '#22c55e'
                            : progress.percent >= 75
                            ? '#3b82f6'
                            : progress.percent >= 25
                            ? '#eab308'
                            : '#6b7280',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
