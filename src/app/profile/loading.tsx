export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="border-b border-white/5 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="h-7 w-28 bg-white/10 rounded animate-pulse" />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* Profile card skeleton */}
        <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-6 animate-pulse">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/20" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-40 bg-white/10 rounded" />
              <div className="h-3 w-56 bg-white/5 rounded" />
            </div>
          </div>

          {/* XP bar skeleton */}
          <div className="mt-5 space-y-2">
            <div className="flex justify-between">
              <div className="h-3 w-16 bg-white/10 rounded" />
              <div className="h-3 w-24 bg-white/5 rounded" />
            </div>
            <div className="h-2.5 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full w-2/5 bg-emerald-600/40 rounded-full" />
            </div>
          </div>
        </div>

        {/* Stats grid skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-zinc-900/60 border border-white/5 rounded-xl p-4 space-y-2 animate-pulse"
            >
              <div className="h-3 w-16 bg-white/5 rounded" />
              <div className="h-6 w-12 bg-white/10 rounded" />
            </div>
          ))}
        </div>

        {/* Badges section skeleton */}
        <div className="space-y-4 animate-pulse">
          <div className="h-5 w-20 bg-white/10 rounded" />
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-xl bg-zinc-900/60 border border-white/5"
              />
            ))}
          </div>
        </div>

        {/* Recent games skeleton */}
        <div className="space-y-4 animate-pulse">
          <div className="h-5 w-32 bg-white/10 rounded" />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 bg-zinc-900/40 border border-white/5 rounded-xl"
              >
                <div className="h-8 w-8 rounded-lg bg-white/5" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-28 bg-white/10 rounded" />
                  <div className="h-2.5 w-20 bg-white/5 rounded" />
                </div>
                <div className="h-4 w-14 bg-white/10 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
