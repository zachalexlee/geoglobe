export default function GroupsLoading() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header skeleton */}
      <div className="border-b border-white/5 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-7 w-36 bg-white/10 rounded animate-pulse" />
            <div className="h-3.5 w-56 bg-white/5 rounded animate-pulse" />
          </div>
          {/* Create group button placeholder */}
          <div className="h-9 w-32 bg-emerald-600/20 border border-emerald-500/20 rounded-xl animate-pulse" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Search/filter bar skeleton */}
        <div className="flex gap-3">
          <div className="flex-1 h-10 bg-white/5 border border-white/10 rounded-xl animate-pulse" />
          <div className="h-10 w-24 bg-white/5 border border-white/10 rounded-xl animate-pulse" />
        </div>

        {/* Card grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-zinc-900/60 border border-white/5 rounded-2xl p-5 flex flex-col gap-3 animate-pulse"
            >
              {/* Group icon + name */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-3/4 bg-white/10 rounded" />
                  <div className="h-2.5 w-1/2 bg-white/5 rounded" />
                </div>
              </div>

              {/* Members + stats */}
              <div className="flex gap-2 mt-1">
                <div className="h-5 w-20 bg-white/5 rounded-full" />
                <div className="h-5 w-16 bg-white/5 rounded-full" />
              </div>

              {/* Join button */}
              <div className="h-9 w-full bg-white/10 rounded-xl mt-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
