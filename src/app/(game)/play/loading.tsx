export default function PlayLoading() {
  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center">
      {/* Globe placeholder with spinning animation */}
      <div className="relative flex items-center justify-center">
        {/* Outer ring - spinning */}
        <div className="absolute w-72 h-72 rounded-full border border-emerald-500/20 animate-spin [animation-duration:8s]" />
        <div className="absolute w-64 h-64 rounded-full border border-emerald-500/10 animate-spin [animation-duration:12s] [animation-direction:reverse]" />

        {/* Globe body - pulsing */}
        <div className="w-56 h-56 rounded-full bg-gradient-to-br from-emerald-900/30 to-zinc-900/50 border border-white/10 animate-pulse flex items-center justify-center">
          <svg
            className="w-20 h-20 text-emerald-500/40"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={0.75}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A8.966 8.966 0 0 1 3 12c0-1.97.633-3.794 1.708-5.278"
            />
          </svg>
        </div>
      </div>

      {/* Bottom loading bar */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
        <div className="h-1 w-48 bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full w-1/3 bg-emerald-500/60 rounded-full animate-[shimmer_1.5s_ease-in-out_infinite]" />
        </div>
        <p className="text-zinc-500 text-xs font-medium tracking-wide uppercase animate-pulse">
          Loading puzzle…
        </p>
      </div>
    </div>
  )
}
