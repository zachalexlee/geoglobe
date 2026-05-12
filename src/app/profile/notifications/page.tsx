'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Toronto',
  'America/Sao_Paulo',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Moscow',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Kolkata',
  'Asia/Dubai',
  'Australia/Sydney',
  'Pacific/Auckland',
]

interface NotificationPrefs {
  notifyEmail: boolean
  notifyPush: boolean
  timezone: string
}

export default function NotificationSettingsPage() {
  const [prefs, setPrefs] = useState<NotificationPrefs | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchPrefs() {
      try {
        const res = await fetch('/api/user/notifications')
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        setPrefs(data)
      } catch {
        setError('Failed to load notification settings.')
      } finally {
        setLoading(false)
      }
    }
    fetchPrefs()
  }, [])

  async function handleSave() {
    if (!prefs) return
    setSaving(true)
    setError('')
    setSaved(false)

    try {
      const res = await fetch('/api/user/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefs),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to save settings.')
        return
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError('An unexpected error occurred.')
    } finally {
      setSaving(false)
    }
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
              🔔 Notification Settings
            </h1>
            <p className="text-white/40 text-sm mt-0.5">
              Configure your daily reminders
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

        {saved && (
          <div className="rounded-lg bg-green-900/40 border border-green-700 px-4 py-3 text-sm text-green-300">
            ✓ Settings saved successfully!
          </div>
        )}

        {prefs && (
          <div className="space-y-6">
            {/* Email notifications */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-bold text-sm">📧 Email Reminders</h3>
                  <p className="text-white/40 text-xs mt-1">
                    Receive daily puzzle reminders via email
                  </p>
                </div>
                <button
                  onClick={() => setPrefs({ ...prefs, notifyEmail: !prefs.notifyEmail })}
                  className={`relative w-12 h-7 rounded-full transition-colors ${
                    prefs.notifyEmail ? 'bg-indigo-600' : 'bg-white/10'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform ${
                      prefs.notifyEmail ? 'translate-x-5' : ''
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Push notifications */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-bold text-sm">🔔 Push Notifications</h3>
                  <p className="text-white/40 text-xs mt-1">
                    Get browser push notifications for streaks and challenges
                  </p>
                </div>
                <button
                  onClick={() => setPrefs({ ...prefs, notifyPush: !prefs.notifyPush })}
                  className={`relative w-12 h-7 rounded-full transition-colors ${
                    prefs.notifyPush ? 'bg-indigo-600' : 'bg-white/10'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform ${
                      prefs.notifyPush ? 'translate-x-5' : ''
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Timezone */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="text-white font-bold text-sm mb-1">🌍 Timezone</h3>
              <p className="text-white/40 text-xs mb-3">
                We&apos;ll send notifications at the right time for you
              </p>
              <select
                value={prefs.timezone}
                onChange={(e) => setPrefs({ ...prefs, timezone: e.target.value })}
                className="w-full rounded-lg bg-white/5 border border-white/10 text-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz} className="bg-zinc-900">
                    {tz}
                  </option>
                ))}
              </select>
            </div>

            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-sm transition-colors"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
