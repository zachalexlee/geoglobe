export default function PracticeLoading() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header skeleton */}
      <div className="border-b border-white/10 bg-black/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-7 w-48 bg-white/10 rounded animate-pulse" />
            <div className="h-3.5 w-64 bg-white/5 rounded animate-pulse" />
          </div>
          <div className="h-9 w-28 bg-white/10 rounded-xl animate-pulse" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Category filter skeleton */}
        <div className="space-y-3">
          <div>
            <div className="h-3 w-16 bg-white/10 rounded mb-2 animate-pulse" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-8 rounded-full bg-white/5 border border-white/10 animate-pulse"
                  style={{ width: `${60 + i * 16}px` }}
                />
              ))}
            </div>
          </div>

          {/* Difficulty filter skeleton */}
          <div>
            <div className="h-3 w-16 bg-white/10 rounded mb-2 animate-pulse" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-8 w-16 rounded-full bg-white/5 border border-white/10 animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Cards grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-3 animate-pulse"
            >
              <div className="h-4 w-3/4 bg-white/10 rounded" />
              <div className="h-3 w-full bg-white/[0.08] rounded" />
              <div className="flex gap-2">
                <div className="h-5 w-16 bg-white/10 rounded-full" />
                <div className="h-5 w-14 bg-white/10 rounded-full" />
              </div>
              <div className="h-3 w-1/2 bg-white/[0.08] rounded" />
              <div className="h-9 w-full bg-white/10 rounded-xl mt-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
