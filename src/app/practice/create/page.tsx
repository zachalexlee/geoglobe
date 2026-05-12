'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { WORLD_CITIES, type City } from '@/lib/cities'

export default function CreatePracticeMapPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [selectedCities, setSelectedCities] = useState<City[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const filteredCities = useMemo(() => {
    if (!search.trim()) return WORLD_CITIES.slice(0, 20)
    const q = search.toLowerCase()
    return WORLD_CITIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q)
    ).slice(0, 20)
  }, [search])

  const isSelected = (city: City) =>
    selectedCities.some(
      (c) => c.name === city.name && c.country === city.country
    )

  function toggleCity(city: City) {
    if (isSelected(city)) {
      setSelectedCities((prev) =>
        prev.filter((c) => !(c.name === city.name && c.country === city.country))
      )
    } else {
      if (selectedCities.length >= 20) return
      setSelectedCities((prev) => [...prev, city])
    }
  }

  function removeCity(city: City) {
    setSelectedCities((prev) =>
      prev.filter((c) => !(c.name === city.name && c.country === city.country))
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Please enter a map name.')
      return
    }
    if (selectedCities.length < 5) {
      setError('Please select at least 5 cities.')
      return
    }
    if (selectedCities.length > 20) {
      setError('Maximum 20 cities allowed.')
      return
    }

    setLoading(true)
    try {
      const locations = selectedCities.map((c) => ({
        name: c.name,
        country: c.country,
        latitude: c.latitude,
        longitude: c.longitude,
      }))

      const res = await fetch('/api/practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          category: 'custom',
          difficulty,
          locations,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to create map.')
        return
      }

      const map = await res.json()
      router.push(`/practice/${map.id}`)
    } catch {
      setError('An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-white font-extrabold text-2xl tracking-tight">
              🗺️ Create Custom Map
            </h1>
            <p className="text-white/40 text-sm mt-0.5">
              Build your own practice map from world cities
            </p>
          </div>
          <Link
            href="/practice"
            className="text-white/50 hover:text-white text-sm transition-colors"
          >
            ← Back
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 rounded-lg bg-red-900/40 border border-red-700 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-white/70 mb-1">
              Map Name *
            </label>
            <input
              id="name"
              type="text"
              required
              maxLength={60}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg bg-white/5 border border-white/10 text-white px-4 py-2.5 text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="e.g. European Capitals Challenge"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-white/70 mb-1">
              Description
            </label>
            <textarea
              id="description"
              maxLength={200}
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg bg-white/5 border border-white/10 text-white px-4 py-2.5 text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              placeholder="Optional description for your map..."
            />
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Difficulty</label>
            <div className="flex gap-3">
              {(['easy', 'medium', 'hard'] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors border ${
                    difficulty === d
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* City Selection */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Select Cities ({selectedCities.length}/20, min 5)
            </label>

            {/* Selected cities */}
            {selectedCities.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedCities.map((city) => (
                  <span
                    key={`${city.name}-${city.country}`}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 text-xs font-medium"
                  >
                    {city.name}, {city.country}
                    <button
                      type="button"
                      onClick={() => removeCity(city)}
                      className="ml-1 text-indigo-400 hover:text-white"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Search */}
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search cities..."
              className="w-full rounded-lg bg-white/5 border border-white/10 text-white px-4 py-2.5 text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-3"
            />

            {/* City list */}
            <div className="max-h-60 overflow-y-auto rounded-lg border border-white/10 bg-white/5">
              {filteredCities.map((city) => {
                const selected = isSelected(city)
                return (
                  <button
                    key={`${city.name}-${city.country}`}
                    type="button"
                    onClick={() => toggleCity(city)}
                    disabled={!selected && selectedCities.length >= 20}
                    className={`w-full text-left px-4 py-2.5 text-sm border-b border-white/5 last:border-b-0 transition-colors ${
                      selected
                        ? 'bg-indigo-600/20 text-indigo-300'
                        : 'text-white/70 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed'
                    }`}
                  >
                    <span className="font-medium">{city.name}</span>
                    <span className="text-white/40 ml-2">{city.country}</span>
                    {selected && <span className="float-right text-indigo-400">✓</span>}
                  </button>
                )
              })}
              {filteredCities.length === 0 && (
                <p className="text-center text-white/30 py-4 text-sm">No cities found</p>
              )}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || selectedCities.length < 5}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm transition-colors"
          >
            {loading ? 'Creating...' : `Create Map (${selectedCities.length} cities)`}
          </button>
        </form>
      </div>
    </div>
  )
}
