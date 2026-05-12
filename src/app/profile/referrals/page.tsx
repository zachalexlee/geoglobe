'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface ReferralStats {
  referralCode: string
  totalReferred: number
  totalXpEarned: number
}

export default function ReferralsPage() {
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/user/referral')
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        setStats(data)
      } catch {
        setError('Failed to load referral stats.')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  function copyCode() {
    if (!stats) return
    const url = `${window.location.origin}/auth/register?ref=${stats.referralCode}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    })
  }

  function copyCodeOnly() {
    if (!stats) return
    navigator.clipboard.writeText(stats.referralCode).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-pulse text-white/40">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-white font-extrabold text-2xl tracking-tight">
              🎁 Referrals
            </h1>
            <p className="text-white/40 text-sm mt-0.5">
              Invite friends and earn XP rewards
            </p>
          </div>
          <Link
            href="/profile"
            className="text-white/50 hover:text-white text-sm transition-colors"
          >
            ← Profile
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {error && (
          <div className="rounded-lg bg-red-900/40 border border-red-700 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {stats && (
          <>
            {/* Referral Code */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
              <p className="text-white/40 text-xs uppercase tracking-widest mb-3">
                Your Referral Code
              </p>
              <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-6 py-3">
                <span className="text-white font-mono text-2xl font-bold tracking-wider">
                  {stats.referralCode}
                </span>
                <button
                  onClick={copyCodeOnly}
                  className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
                >
                  {copied ? '✓' : '📋'}
                </button>
              </div>
              <p className="text-white/30 text-xs mt-3">
                Share this code with friends to earn 100 XP per referral
              </p>
            </div>

            {/* Share link */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <p className="text-white/40 text-xs uppercase tracking-widest mb-2">
                Share Link
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/auth/register?ref=${stats.referralCode}`}
                  className="flex-1 rounded-lg bg-white/5 border border-white/10 text-white/70 px-3 py-2 text-sm font-mono truncate"
                />
                <button
                  onClick={copyCode}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-colors whitespace-nowrap"
                >
                  {copied ? '✓ Copied!' : 'Copy Link'}
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
                <p className="text-white/40 text-xs uppercase tracking-widest mb-2">
                  Friends Joined
                </p>
                <p className="text-white text-3xl font-extrabold tabular-nums">
                  {stats.totalReferred}
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
                <p className="text-white/40 text-xs uppercase tracking-widest mb-2">
                  XP Earned
                </p>
                <p className="text-indigo-400 text-3xl font-extrabold tabular-nums">
                  {stats.totalXpEarned}
                </p>
              </div>
            </div>

            {/* How it works */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="text-white font-bold text-sm mb-3">How it works</h3>
              <ul className="space-y-2 text-white/60 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400">1.</span>
                  Share your referral code or link with friends
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400">2.</span>
                  They sign up using your code
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400">3.</span>
                  You earn <span className="text-white font-bold">100 XP</span> and they get <span className="text-white font-bold">50 XP</span> bonus
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
