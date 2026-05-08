'use client'

import { useRouter } from 'next/navigation'

interface Player {
  id: string
  username: string
  avatar?: string | null
  elo: number
}

interface VersusResultsProps {
  matchId: string
  currentUserId: string
  player1: Player
  player2: Player
  p1Scores: number[]
  p2Scores: number[]
  winnerId: string | null
  eloChange: number | null
  isRanked: boolean
}

export default function VersusResults({
  currentUserId,
  player1,
  player2,
  p1Scores,
  p2Scores,
  winnerId,
  eloChange,
  isRanked,
}: VersusResultsProps) {
  const router = useRouter()

  const isPlayer1 = currentUserId === player1.id
  const me = isPlayer1 ? player1 : player2
  const opponent = isPlayer1 ? player2 : player1
  const myScores = isPlayer1 ? p1Scores : p2Scores
  const opponentScores = isPlayer1 ? p2Scores : p1Scores

  const myTotal = myScores.reduce((a, b) => a + b, 0)
  const opponentTotal = opponentScores.reduce((a, b) => a + b, 0)

  const iWon = winnerId === currentUserId
  const isDraw = winnerId === null
  const iLost = !iWon && !isDraw

  let resultEmoji = '🤝'
  let resultText = 'Draw!'
  let resultColor = 'text-white'
  if (iWon) {
    resultEmoji = '🏆'
    resultText = 'You Win!'
    resultColor = 'text-green-400'
  } else if (iLost) {
    resultEmoji = '😔'
    resultText = 'You Lose'
    resultColor = 'text-red-400'
  }

  // ELO delta from my perspective
  const myEloDelta =
    isRanked && eloChange !== null
      ? iWon
        ? `+${eloChange}`
        : isDraw
        ? '+0'
        : `${-eloChange}`
      : null

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-md mx-auto py-8 space-y-6">
        {/* Result header */}
        <div className="text-center space-y-2">
          <div className="text-6xl">{resultEmoji}</div>
          <h1 className={`text-4xl font-extrabold ${resultColor}`}>{resultText}</h1>
          {isRanked && myEloDelta && (
            <p
              className={`text-lg font-bold ${
                iWon ? 'text-green-400' : iLost ? 'text-red-400' : 'text-white/50'
              }`}
            >
              ELO: {myEloDelta}
            </p>
          )}
        </div>

        {/* Score comparison */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
          <p className="text-white/40 text-xs uppercase tracking-widest text-center">
            Final Scores
          </p>

          <div className="grid grid-cols-2 gap-4">
            {/* My score */}
            <div
              className={[
                'rounded-xl border p-4 text-center',
                iWon
                  ? 'bg-green-500/10 border-green-500/30'
                  : isDraw
                  ? 'bg-white/5 border-white/10'
                  : 'bg-white/5 border-white/10',
              ].join(' ')}
            >
              <p className="text-white/50 text-xs mb-1 truncate">{me.username}</p>
              <p className="text-white text-3xl font-extrabold tabular-nums">
                {myTotal.toLocaleString()}
              </p>
              {isRanked && myEloDelta && (
                <p
                  className={`text-xs font-bold mt-1 ${
                    iWon ? 'text-green-400' : iLost ? 'text-red-400' : 'text-white/30'
                  }`}
                >
                  {myEloDelta} ELO
                </p>
              )}
            </div>

            {/* Opponent score */}
            <div
              className={[
                'rounded-xl border p-4 text-center',
                iLost
                  ? 'bg-indigo-500/10 border-indigo-500/30'
                  : 'bg-white/5 border-white/10',
              ].join(' ')}
            >
              <p className="text-white/50 text-xs mb-1 truncate">{opponent.username}</p>
              <p className="text-white text-3xl font-extrabold tabular-nums">
                {opponentTotal.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Per-round breakdown */}
        <div className="space-y-2">
          <p className="text-white/40 text-xs uppercase tracking-widest">Round Breakdown</p>
          {myScores.map((score, i) => {
            const oppScore = opponentScores[i] ?? 0
            const roundWon = score > oppScore
            const roundTied = score === oppScore
            return (
              <div
                key={i}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 flex items-center justify-between"
              >
                <span className="text-white/40 text-xs">Round {i + 1}</span>
                <div className="flex items-center gap-3">
                  <span
                    className={`font-bold text-sm tabular-nums ${
                      roundWon
                        ? 'text-green-400'
                        : roundTied
                        ? 'text-white/60'
                        : 'text-white/60'
                    }`}
                  >
                    {score.toLocaleString()}
                  </span>
                  <span className="text-white/20 text-xs">vs</span>
                  <span
                    className={`font-bold text-sm tabular-nums ${
                      !roundWon && !roundTied ? 'text-indigo-400' : 'text-white/40'
                    }`}
                  >
                    {oppScore.toLocaleString()}
                  </span>
                  <span className="text-base">
                    {roundWon ? '✅' : roundTied ? '🤝' : '❌'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push('/versus')}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold transition-colors shadow-lg"
          >
            ⚔️ Play Again
          </button>
          <button
            onClick={() => router.push('/')}
            className="w-full py-2 text-white/40 hover:text-white/60 text-sm transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}
