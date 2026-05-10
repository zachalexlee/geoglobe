export default function LeaderboardLoading() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* Header skeleton */}
      <header className="sticky top-0 z-10 bg-zinc-950/80 backdrop-blur border-b border-white/5 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-6 w-56 bg-zinc-800 rounded animate-pulse" />
            <div className="h-3 w-40 bg-zinc-800/60 rounded animate-pulse" />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Tabs skeleton */}
        <div className="flex gap-1 bg-zinc-900 p-1 rounded-xl border border-white/5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 h-10 rounded-lg bg-zinc-800/50 animate-pulse"
            />
          ))}
        </div>

        {/* Top 3 podium skeleton */}
        <div className="grid grid-cols-3 gap-3">
          {[16, 20, 14].map((h, i) => (
            <div
              key={i}
              className={`flex flex-col items-center justify-end gap-2 rounded-xl bg-zinc-800/40 border border-white/5 p-3 animate-pulse`}
              style={{ height: `${h * 4 + 16}px` }}
            >
              <div className="h-5 w-5 rounded-full bg-zinc-700" />
              <div className="h-3 w-16 bg-zinc-700 rounded" />
              <div className="h-3 w-12 bg-zinc-700/60 rounded" />
            </div>
          ))}
        </div>

        {/* Table rows skeleton */}
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 px-4 py-3 bg-zinc-900/60 border border-white/5 rounded-xl animate-pulse"
            >
              <div className="h-5 w-5 rounded bg-zinc-800" />
              <div className="h-8 w-8 rounded-full bg-zinc-800" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-32 bg-zinc-800 rounded" />
                <div className="h-2.5 w-20 bg-zinc-800/50 rounded" />
              </div>
              <div className="h-4 w-16 bg-zinc-800 rounded" />
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
