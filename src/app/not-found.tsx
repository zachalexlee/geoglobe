import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Globe illustration */}
        <div className="mx-auto w-32 h-32 relative flex items-center justify-center">
          {/* Outer orbit ring */}
          <div className="absolute inset-0 rounded-full border border-emerald-500/20 animate-spin [animation-duration:10s]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-400/60" />
          </div>

          {/* Globe body */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-900/40 to-zinc-800/60 border border-white/10 flex items-center justify-center">
            <svg
              className="w-12 h-12 text-emerald-500/50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A8.966 8.966 0 0 1 3 12c0-1.97.633-3.794 1.708-5.278"
              />
            </svg>
          </div>
        </div>

        {/* 404 text */}
        <div className="space-y-2">
          <p className="text-emerald-400 font-mono text-sm tracking-widest">404</p>
          <h1 className="text-2xl font-bold text-white">Page not found</h1>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Looks like you&apos;ve wandered off the map. This location doesn&apos;t exist
            in our atlas.
          </p>
        </div>

        {/* Go Home button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955a1.126 1.126 0 0 1 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          Go Home
        </Link>
      </div>
    </div>
  )
}
