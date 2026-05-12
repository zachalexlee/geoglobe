'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { use } from 'react'
import Link from 'next/link'

interface RoomData {
  id: string
  code: string
  hostId: string
  status: 'waiting' | 'playing' | 'finished'
  maxPlayers: number
  locations: Array<{ name: string; country: string }>
  playerScores: Record<string, number[]>
  createdAt: string
}

export default function RoomPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params)
  const { data: session } = useSession()
  const router = useRouter()
  const [room, setRoom] = useState<RoomData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentRound, setCurrentRound] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)

  const fetchRoom = useCallback(async () => {
    try {
      const res = await fetch(`/api/rooms/${code}`)
      if (!res.ok) throw new Error('Room not found')
      const data = await res.json()
      setRoom(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load room')
    } finally {
      setLoading(false)
    }
  }, [code])

  // Initial fetch
  useEffect(() => {
    fetchRoom()
  }, [fetchRoom])

  // SSE connection for real-time updates
  useEffect(() => {
    if (!session?.user?.id || !room) return

    const es = new EventSource(`/api/rooms/${code}/events`)
    eventSourceRef.current = es

    es.addEventListener('player-joined', (e) => {
      const data = JSON.parse(e.data)
      setRoom((prev) => prev ? { ...prev, playerScores: data.playerScores || prev.playerScores } : prev)
      fetchRoom() // Refresh full state
    })

    es.addEventListener('game-started', () => {
      setRoom((prev) => prev ? { ...prev, status: 'playing' } : prev)
      fetchRoom()
    })

    es.addEventListener('score-updated', (e) => {
      const data = JSON.parse(e.data)
      setRoom((prev) => prev ? { ...prev, playerScores: data.playerScores } : prev)
    })

    es.addEventListener('game-finished', (e) => {
      const data = JSON.parse(e.data)
      setRoom((prev) => prev ? { ...prev, status: 'finished', playerScores: data.playerScores } : prev)
    })

    return () => {
      es.close()
      eventSourceRef.current = null
    }
  }, [session?.user?.id, room?.status, code, fetchRoom])

  const handleStart = async () => {
    try {
      const res = await fetch(`/api/rooms/${code}/start`, { method: 'POST' })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error)
      }
    } catch {
      setError('Failed to start game')
    }
  }

  const handleSubmitGuess = async (lat: number, lng: number) => {
    if (submitting) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/rooms/${code}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ round: currentRound, lat, lng }),
      })
      const data = await res.json()
      if (res.ok) {
        setCurrentRound((r) => r + 1)
      } else {
        setError(data.error)
      }
    } catch {
      setError('Failed to submit guess')
    } finally {
      setSubmitting(false)
    }
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <p className="text-white/60">Sign in to join this room</p>
          <Link href="/auth/signin" className="inline-block px-6 py-2.5 rounded-xl bg-teal-600 text-white font-medium">
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <p className="text-white/50 animate-pulse">Loading room...</p>
      </div>
    )
  }

  if (error && !room) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <p className="text-red-400">{error}</p>
          <Link href="/rooms" className="inline-block px-6 py-2.5 rounded-xl bg-white/10 text-white font-medium">
            Back to Rooms
          </Link>
        </div>
      </div>
    )
  }

  if (!room) return null

  const players = Object.keys(room.playerScores)
  const isHost = room.hostId === session.user.id
  const isInRoom = players.includes(session.user.id!)
  const myScores = room.playerScores[session.user.id!] || []

  // ─── Waiting Lobby ──────────────────────────────────────────────────
  if (room.status === 'waiting') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-2">Room Lobby</h1>
            <div className="inline-block bg-white/10 border border-white/20 rounded-xl px-6 py-3">
              <p className="text-white/50 text-xs uppercase tracking-widest mb-1">Room Code</p>
              <p className="text-white font-mono text-3xl tracking-widest">{room.code}</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-3">
              Players ({players.length}/{room.maxPlayers})
            </h2>
            <div className="space-y-2">
              {players.map((playerId) => (
                <div key={playerId} className="flex items-center gap-3 px-3 py-2 bg-white/5 rounded-lg">
                  <span className="h-8 w-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-bold">
                    {playerId.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="text-white text-sm">
                    {playerId === room.hostId ? '👑 ' : ''}
                    Player {playerId.slice(-4)}
                    {playerId === session.user.id ? ' (You)' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {!isInRoom && (
            <button
              onClick={async () => {
                await fetch(`/api/rooms/${code}/join`, { method: 'POST' })
                fetchRoom()
              }}
              className="w-full px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold transition-colors"
            >
              Join Room
            </button>
          )}

          {isHost && players.length >= 2 && (
            <button
              onClick={handleStart}
              className="w-full px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-colors"
            >
              ▶ Start Game ({players.length} players)
            </button>
          )}

          {isHost && players.length < 2 && (
            <p className="text-center text-white/40 text-sm">Waiting for at least 2 players...</p>
          )}

          {!isHost && isInRoom && (
            <p className="text-center text-white/40 text-sm">Waiting for host to start...</p>
          )}
        </div>
      </div>
    )
  }

  // ─── Playing ────────────────────────────────────────────────────────
  if (room.status === 'playing') {
    const totalRounds = room.locations.length
    const currentLoc = room.locations[currentRound]
    const finished = currentRound >= totalRounds

    if (finished) {
      const total = myScores.reduce((a, b) => a + (b || 0), 0)
      return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
          <div className="max-w-md w-full space-y-6 text-center">
            <h1 className="text-2xl font-bold text-white">🎉 You&apos;re Done!</h1>
            <p className="text-white/60">Your total: <span className="text-teal-400 font-bold">{Math.round(total)} pts</span></p>
            <p className="text-white/40 text-sm">Waiting for other players to finish...</p>
            <Scoreboard playerScores={room.playerScores} currentUserId={session.user.id!} />
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-[#0a0a0a] p-4">
        <div className="max-w-lg mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold">Round {currentRound + 1}/{totalRounds}</h2>
            <span className="text-white/40 text-sm">Score: {Math.round(myScores.reduce((a, b) => a + (b || 0), 0))}</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
            <p className="text-white/50 text-xs uppercase tracking-widest mb-2">Find this city</p>
            <h2 className="text-white font-bold text-2xl">📍 {currentLoc?.name}</h2>
            <p className="text-white/50 mt-1">{currentLoc?.country}</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <p className="text-white/60 text-sm mb-4">Enter your guess coordinates:</p>
            <GuessInput onSubmit={handleSubmitGuess} disabled={submitting} />
          </div>

          <Scoreboard playerScores={room.playerScores} currentUserId={session.user.id!} />
        </div>
      </div>
    )
  }

  // ─── Finished ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">🏆 Game Over!</h1>
          <p className="text-white/60">Final Results</p>
        </div>
        <Scoreboard playerScores={room.playerScores} currentUserId={session.user.id!} final />
        <div className="text-center">
          <Link href="/rooms" className="inline-block px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold transition-colors">
            Play Again
          </Link>
        </div>
      </div>
    </div>
  )
}

// ─── Scoreboard Component ───────────────────────────────────────────────────
function Scoreboard({
  playerScores,
  currentUserId,
  final = false,
}: {
  playerScores: Record<string, number[]>
  currentUserId: string
  final?: boolean
}) {
  const sorted = Object.entries(playerScores)
    .map(([id, scores]) => ({
      id,
      total: scores.reduce((a, b) => a + (b || 0), 0),
      rounds: scores.length,
    }))
    .sort((a, b) => b.total - a.total)

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
      <h3 className="text-white font-semibold text-sm mb-3">
        {final ? '🏆 Final Standings' : '📊 Live Scores'}
      </h3>
      <div className="space-y-2">
        {sorted.map((player, idx) => (
          <div
            key={player.id}
            className={`flex items-center justify-between px-3 py-2 rounded-lg ${
              player.id === currentUserId ? 'bg-teal-600/20 border border-teal-500/30' : 'bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-white/60 text-xs font-bold w-5">#{idx + 1}</span>
              <span className="text-white text-sm">
                Player {player.id.slice(-4)}
                {player.id === currentUserId ? ' (You)' : ''}
              </span>
            </div>
            <div className="text-right">
              <span className="text-teal-400 font-bold text-sm">{Math.round(player.total)} pts</span>
              <span className="text-white/30 text-xs ml-2">({player.rounds} rounds)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Guess Input Component ──────────────────────────────────────────────────
function GuessInput({
  onSubmit,
  disabled,
}: {
  onSubmit: (lat: number, lng: number) => void
  disabled: boolean
}) {
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const latNum = parseFloat(lat)
    const lngNum = parseFloat(lng)
    if (isNaN(latNum) || isNaN(lngNum)) return
    onSubmit(latNum, lngNum)
    setLat('')
    setLng('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <input
        type="number"
        step="any"
        value={lat}
        onChange={(e) => setLat(e.target.value)}
        placeholder="Latitude"
        className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-teal-500/50"
      />
      <input
        type="number"
        step="any"
        value={lng}
        onChange={(e) => setLng(e.target.value)}
        placeholder="Longitude"
        className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-teal-500/50"
      />
      <button
        type="submit"
        disabled={disabled || !lat || !lng}
        className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white text-sm font-bold transition-colors"
      >
        {disabled ? '...' : '✓'}
      </button>
    </form>
  )
}
