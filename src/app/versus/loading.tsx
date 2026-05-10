export default function VersusLoading() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header skeleton */}
      <div className="border-b border-white/5 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-7 w-44 bg-white/10 rounded animate-pulse" />
            <div className="h-3.5 w-60 bg-white/5 rounded animate-pulse" />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* Matchmaking card skeleton */}
        <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-6 space-y-6 animate-pulse">
          {/* VS badge area */}
          <div className="flex items-center justify-center gap-6">
            {/* Player 1 */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20" />
              <div className="h-3 w-14 bg-white/10 rounded" />
            </div>

            {/* VS divider */}
            <div className="flex flex-col items-center gap-1">
              <div className="h-8 w-8 rounded-lg bg-white/10" />
            </div>

            {/* Player 2 (empty/searching) */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-white/5 border border-dashed border-white/20" />
              <div className="h-3 w-14 bg-white/5 rounded" />
            </div>
          </div>

          {/* Search/match button skeleton */}
          <div className="h-12 w-full bg-emerald-600/20 border border-emerald-500/20 rounded-xl" />
        </div>

        {/* Recent matches skeleton */}
        <div className="space-y-4">
          <div className="h-5 w-32 bg-white/10 rounded animate-pulse" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 bg-zinc-900/40 border border-white/5 rounded-xl animate-pulse"
              >
                <div className="h-10 w-10 rounded-full bg-white/10" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-36 bg-white/10 rounded" />
                  <div className="h-2.5 w-24 bg-white/5 rounded" />
                </div>
                <div className="h-6 w-16 bg-white/10 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
