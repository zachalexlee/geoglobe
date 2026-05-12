'use client'

import { useState } from 'react'

export default function ChallengeButton() {
  const [loading, setLoading] = useState(false)
  const [challengeUrl, setChallengeUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const createChallenge = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/challenge', { method: 'POST' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to create challenge')
      }
      const data = await res.json()
      setChallengeUrl(data.url)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create challenge')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (!challengeUrl) return
    const text = `Can you beat my GeoGlobe score? Try this challenge: ${challengeUrl}`
    if (navigator.share) {
      navigator.share({ title: 'GeoGlobe Challenge', text, url: challengeUrl }).catch(() => {})
    } else {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    }
  }

  if (challengeUrl) {
    return (
      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={challengeUrl}
            readOnly
            className="flex-1 bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-mono truncate"
          />
          <button
            onClick={handleCopy}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-colors shrink-0"
          >
            {copied ? '✓ Copied!' : '📋 Copy'}
          </button>
        </div>
        <p className="text-zinc-500 text-xs text-center">
          Share this link with a friend to challenge them!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <button
        onClick={createChallenge}
        disabled={loading}
        className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <span className="animate-spin">⏳</span>
        ) : (
          <>
            🤝 Challenge a Friend
          </>
        )}
      </button>
      {error && (
        <p className="text-red-400 text-xs text-center">{error}</p>
      )}
    </div>
  )
}
