'use client'

interface GameHeaderProps {
  puzzleNumber: number
  currentRound: number   // 0-4
  totalRounds: number    // typically 5
  totalScore: number
}

export default function GameHeader({
  puzzleNumber,
  currentRound,
  totalRounds,
  totalScore,
}: GameHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-black/80 backdrop-blur-md border-b border-white/10 flex items-center px-4">
      {/* Left: title */}
      <div className="flex-1">
        <span className="text-white font-bold text-lg tracking-tight">
          GeoGlobe{' '}
          <span className="text-white/50 font-normal text-sm">
            #{puzzleNumber}
          </span>
        </span>
      </div>

      {/* Center: round progress dots */}
      <div className="flex gap-2 items-center">
        {Array.from({ length: totalRounds }).map((_, i) => {
          const isCompleted = i < currentRound
          const isCurrent = i === currentRound

          return (
            <span
              key={i}
              className="text-lg leading-none"
              style={{
                color: isCompleted
                  ? '#22c55e'
                  : isCurrent
                  ? '#ffffff'
                  : 'rgba(255,255,255,0.25)',
              }}
            >
              {isCompleted ? '●' : isCurrent ? '◉' : '○'}
            </span>
          )
        })}
      </div>

      {/* Right: score */}
      <div className="flex-1 flex justify-end">
        <div className="text-right">
          <span className="text-white font-bold text-lg tabular-nums">
            {totalScore.toLocaleString()}
          </span>
          <span className="text-white/40 text-xs ml-1">pts</span>
        </div>
      </div>
    </header>
  )
}
