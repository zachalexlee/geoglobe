import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { levelFromXp, xpInCurrentLevel, xpToNextLevel as calcXpToNext } from '@/lib/xp-system'
import { getPuzzleNumber } from '@/lib/daily-cities'
import XpBar from '@/components/profile/XpBar'
import BadgeGrid from '@/components/profile/BadgeGrid'
import BadgeProgress from '@/components/profile/BadgeProgress'
import Link from 'next/link'

export const metadata = {
  title: 'Profile – GeoGlobe',
  description: 'Your GeoGlobe progression, badges, and recent scores',
}

// ── Helper: format seconds as mm:ss ───────────────────────────────────────────
function formatTime(seconds: number | null): string {
  if (seconds === null) return '—'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

// ── Server Component ───────────────────────────────────────────────────────────
export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/auth/signin?callbackUrl=/profile')
  }

  const userId = session.user.id

  // Fetch user + recent scores
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      scores: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  })

  if (!user) {
    redirect('/auth/signin')
  }

  // Fetch earned badges
  const userBadges = await prisma.userBadge.findMany({
    where: { userId },
    include: { badge: true },
    orderBy: { earnedAt: 'asc' },
  })

  const gamesPlayed = await prisma.score.count({ where: { userId } })

  // Fetch data for badge progress
  const allScores = await prisma.score.findMany({
    where: { userId },
    select: { totalScore: true, roundScores: true, distances: true },
  })

  let hasPerfectRound = false
  let hasPerfectGame = false
  let bestDistanceKm: number | null = null

  for (const s of allScores) {
    if (s.totalScore >= 500) hasPerfectGame = true
    const rs = Array.isArray(s.roundScores) ? (s.roundScores as number[]) : []
    if (rs.some((r) => r >= 100)) hasPerfectRound = true
    const dists = Array.isArray(s.distances) ? (s.distances as number[]) : []
    for (const d of dists) {
      if (bestDistanceKm === null || d < bestDistanceKm) bestDistanceKm = d
    }
  }

  const level = levelFromXp(user.xp)
  const xpCurrent = xpInCurrentLevel(user.xp)
  const xpNext = calcXpToNext(user.xp)

  const badges = userBadges.map(
    (ub: { badge: { id: string; name: string; description: string; icon: string }; earnedAt: Date }) => ({
      id: ub.badge.id,
      name: ub.badge.name,
      description: ub.badge.description,
      icon: ub.badge.icon,
      earnedAt: ub.earnedAt.toISOString(),
    })
  )

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* ── Header ── */}
      <header className="sticky top-0 z-10 bg-zinc-950/80 backdrop-blur border-b border-white/5 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <Link href="/" className="text-zinc-400 hover:text-white text-sm transition-colors">
            ← Back
          </Link>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            🌍 <span>GeoGlobe</span>
          </h1>
          {/* Edit profile placeholder */}
          <button
            type="button"
            className="text-xs text-zinc-500 border border-white/10 rounded-lg px-3 py-1.5 hover:bg-zinc-800 transition-colors"
            aria-label="Edit profile (coming soon)"
            disabled
          >
            Edit Profile
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">

        {/* ── Avatar + Username ── */}
        <section className="flex items-center gap-5">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {user.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatar}
                alt={user.username}
                className="w-20 h-20 rounded-full object-cover border-2 border-white/10"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-zinc-800 border-2 border-white/10 flex items-center justify-center text-3xl select-none">
                {user.flag ?? user.username.charAt(0).toUpperCase()}
              </div>
            )}
            {/* Premium badge */}
            {user.isPremium && (
              <span className="absolute -bottom-1 -right-1 bg-yellow-500 rounded-full text-xs px-1.5 py-0.5 font-bold text-black">
                PRO
              </span>
            )}
          </div>

          {/* Identity */}
          <div className="min-w-0">
            <h2 className="text-2xl font-extrabold text-white truncate">{user.username}</h2>
            <p className="text-zinc-500 text-sm mt-0.5">{user.email}</p>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="inline-flex items-center gap-1 bg-blue-600/20 text-blue-400 text-xs font-semibold px-2 py-0.5 rounded-full border border-blue-600/30">
                ⚡ {user.elo.toLocaleString()} ELO
              </span>
              <span className="inline-flex items-center gap-1 bg-zinc-800 text-zinc-400 text-xs font-medium px-2 py-0.5 rounded-full border border-white/10">
                🎮 {gamesPlayed} {gamesPlayed === 1 ? 'game' : 'games'}
              </span>
            </div>
          </div>
        </section>

        {/* ── XP Bar ── */}
        <section className="bg-zinc-900 border border-white/5 rounded-2xl p-5">
          <p className="text-zinc-500 text-xs uppercase tracking-widest mb-4">Experience</p>
          <XpBar
            xp={user.xp}
            level={level}
            xpCurrentLevel={xpCurrent}
            xpToNextLevel={xpNext}
          />
        </section>

        {/* ── Streaks ── */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Current Streak', value: `${user.streak} 🔥`, highlight: user.streak >= 7 },
            { label: 'Longest Streak', value: `${user.longestStreak} ⚡`, highlight: false },
            { label: 'Level', value: level.toString(), highlight: false },
            { label: 'Total XP', value: user.xp.toLocaleString(), highlight: false },
          ].map(({ label, value, highlight }) => (
            <div
              key={label}
              className={[
                'rounded-xl border p-4 text-center',
                highlight
                  ? 'bg-amber-500/10 border-amber-500/20'
                  : 'bg-zinc-900 border-white/5',
              ].join(' ')}
            >
              <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">{label}</p>
              <p className={['text-xl font-extrabold tabular-nums', highlight ? 'text-amber-400' : 'text-white'].join(' ')}>
                {value}
              </p>
            </div>
          ))}
        </section>

        {/* ── Streak Shields ── */}
        <section className="bg-zinc-900 border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🛡️</span>
              <div>
                <p className="text-white font-bold text-sm">Streak Shields</p>
                <p className="text-zinc-500 text-xs">Protects your streak if you miss a day</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white text-2xl font-extrabold tabular-nums">
                {user.streakShields}
              </p>
              <p className="text-zinc-600 text-xs">available</p>
            </div>
          </div>
          {!user.isPremium && (
            <p className="mt-3 text-xs text-zinc-600 border-t border-white/5 pt-3">
              ⭐ Premium members earn streak shields automatically. Upgrade to PRO for protection!
            </p>
          )}
        </section>

        {/* ── Globe Skin ── */}
        <section className="bg-zinc-900 border border-white/5 rounded-2xl p-5">
          <p className="text-zinc-500 text-xs uppercase tracking-widest mb-3">Globe Skin</p>
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌍</span>
            <div>
              <p className="text-white font-semibold text-sm capitalize">{user.selectedSkin}</p>
              <p className="text-zinc-500 text-xs">Current globe appearance</p>
            </div>
          </div>
        </section>

        {/* ── Badges ── */}
        <section className="bg-zinc-900 border border-white/5 rounded-2xl p-5">
          <BadgeGrid badges={badges} />
        </section>

        {/* ── Badge Progress ── */}
        <section className="bg-zinc-900 border border-white/5 rounded-2xl p-5">
          <BadgeProgress
            gamesPlayed={gamesPlayed}
            streak={user.streak}
            level={level}
            hasPerfectRound={hasPerfectRound}
            hasPerfectGame={hasPerfectGame}
            bestDistanceKm={bestDistanceKm}
            earnedBadgeNames={new Set(badges.map((b: { name: string }) => b.name))}
          />
        </section>

        {/* ── Recent Scores ── */}
        <section className="bg-zinc-900 border border-white/5 rounded-2xl p-5">
          <p className="text-zinc-500 text-xs uppercase tracking-widest mb-4">Recent Games</p>

          {user.scores.length === 0 ? (
            <p className="text-zinc-600 text-sm text-center py-6">No games played yet. <Link href="/play" className="text-blue-400 hover:underline">Play now!</Link></p>
          ) : (
            <div className="space-y-2">
              {/* Column headers */}
              <div className="grid grid-cols-4 text-zinc-600 text-xs uppercase tracking-wider px-2 pb-1 border-b border-white/5">
                <span>Puzzle</span>
                <span className="text-center">Score</span>
                <span className="text-center">Time</span>
                <span className="text-right">Date</span>
              </div>

              {user.scores.map((score: {
                id: string
                totalScore: number
                timeTaken: number | null
                puzzleId: string
                createdAt: Date
              }) => {
                const pct = Math.round((score.totalScore / 500) * 100)
                // Derive puzzle number and date from puzzleId (format: "daily-YYYY-MM-DD")
                const dateStr = score.puzzleId.startsWith('daily-')
                  ? score.puzzleId.slice(6)
                  : null
                const puzzleNum = dateStr ? getPuzzleNumber(dateStr) : null
                return (
                  <div
                    key={score.id}
                    className="grid grid-cols-4 items-center px-2 py-2.5 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <span className="text-zinc-300 text-sm font-medium">
                      {puzzleNum ? `#${puzzleNum}` : '—'}
                    </span>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-white font-bold tabular-nums text-sm">
                        {score.totalScore.toLocaleString()}
                      </span>
                      <div className="w-16 h-1 rounded-full bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(pct, 100)}%`,
                            background: pct >= 90 ? '#22c55e' : pct >= 60 ? '#3b82f6' : '#f59e0b',
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-zinc-400 text-xs text-center tabular-nums">
                      {formatTime(score.timeTaken)}
                    </span>
                    <span className="text-zinc-600 text-xs text-right">
                      {dateStr
                        ? new Date(dateStr).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })
                        : new Date(score.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* ── CTA ── */}
        <div className="text-center pb-4">
          <Link
            href="/play"
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 transition-colors"
          >
            🌍 Play Today&apos;s Puzzle
          </Link>
        </div>

        {/* ── Quick Links ── */}
        <section className="bg-zinc-900 border border-white/5 rounded-2xl p-5">
          <p className="text-zinc-500 text-xs uppercase tracking-widest mb-4">Settings & More</p>
          <div className="space-y-2">
            <Link
              href="/profile/notifications"
              className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">🔔</span>
                <div>
                  <p className="text-white text-sm font-medium">Notification Settings</p>
                  <p className="text-zinc-500 text-xs">Email & push reminders</p>
                </div>
              </div>
              <span className="text-zinc-600">→</span>
            </Link>
            <Link
              href="/profile/referrals"
              className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">🎁</span>
                <div>
                  <p className="text-white text-sm font-medium">Referrals</p>
                  <p className="text-zinc-500 text-xs">Invite friends, earn XP</p>
                </div>
              </div>
              <span className="text-zinc-600">→</span>
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
