'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { RoundResult } from '@/hooks/useGameState'
import { GLOBE_CONFIG, type Pin, type ArcData } from '@/lib/globe-config'

interface ReplayViewProps {
  roundResults: RoundResult[]
  onClose: () => void
}

/**
 * ReplayView — Animated replay of a completed game.
 * Rotates the globe to each city, shows guess vs actual with an arc,
 * pauses, then moves to the next round.
 */
export default function ReplayView({ roundResults, onClose }: ReplayViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globeRef = useRef<any>(null)
  const [currentStep, setCurrentStep] = useState(-1) // -1 = initial zoom out
  const [isPlaying, setIsPlaying] = useState(true)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Initialize globe ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let globe: any
    let destroyed = false

    import('globe.gl').then((mod) => {
      if (destroyed || !containerRef.current) return

      const GlobeGL = mod.default

      globe = new GlobeGL(containerRef.current!)

      globe
        .globeImageUrl(GLOBE_CONFIG.imageUrl)
        .bumpImageUrl(GLOBE_CONFIG.bumpImageUrl)
        .backgroundImageUrl(GLOBE_CONFIG.backgroundImageUrl)
        .atmosphereColor(GLOBE_CONFIG.atmosphereColor)
        .atmosphereAltitude(GLOBE_CONFIG.atmosphereAltitude)
        .pointOfView({ lat: 20, lng: 0, altitude: 3 }, 0)
        .width(containerRef.current.clientWidth)
        .height(containerRef.current.clientHeight)

      globeRef.current = globe

      // Start playback after a brief pause
      setTimeout(() => {
        if (!destroyed) setCurrentStep(0)
      }, 800)
    })

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (globeRef.current && entry) {
        const { width, height } = entry.contentRect
        globeRef.current.width(width).height(height)
      }
    })
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => {
      destroyed = true
      resizeObserver.disconnect()
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (globe) {
        try {
          globe._destructor?.()
        } catch {
          // ignore
        }
      }
      globeRef.current = null
    }
  }, [])

  // ── Animate through rounds ───────────────────────────────────────────────────
  useEffect(() => {
    if (!globeRef.current || currentStep < 0 || !isPlaying) return
    if (currentStep >= roundResults.length) return

    const result = roundResults[currentStep]

    // Fly to the actual location
    globeRef.current.pointOfView(
      { lat: result.location.latitude, lng: result.location.longitude, altitude: 1.5 },
      1500
    )

    // Show pins and arc after arriving
    const showTimer = setTimeout(() => {
      if (!globeRef.current) return

      // Pins: guess + actual
      const pins: Pin[] = [
        {
          id: `replay-guess-${currentStep}`,
          lat: result.guess.lat,
          lng: result.guess.lng,
          color: result.color,
          label: 'Your guess',
          isGuess: true,
        },
        {
          id: `replay-actual-${currentStep}`,
          lat: result.location.latitude,
          lng: result.location.longitude,
          color: '#ffffff',
          label: result.location.name,
          isCorrect: true,
        },
      ]

      globeRef.current
        .htmlElementsData(pins)
        .htmlLat('lat')
        .htmlLng('lng')
        .htmlAltitude(0.01)
        .htmlElement((d: Pin) => {
          const el = document.createElement('div')
          const size = d.isCorrect ? 14 : 18
          el.style.width = `${size}px`
          el.style.height = `${size}px`
          el.style.borderRadius = '50%'
          el.style.background = d.color
          el.style.border = '2px solid rgba(255,255,255,0.8)'
          el.style.boxShadow = `0 0 8px ${d.color}80`
          el.style.transform = 'translate(-50%, -50%)'
          el.style.pointerEvents = 'none'
          return el
        })

      // Arc between guess and actual
      const arcs: ArcData[] = [
        {
          startLat: result.guess.lat,
          startLng: result.guess.lng,
          endLat: result.location.latitude,
          endLng: result.location.longitude,
          color: result.color,
        },
      ]

      globeRef.current
        .arcsData(arcs)
        .arcStartLat('startLat')
        .arcStartLng('startLng')
        .arcEndLat('endLat')
        .arcEndLng('endLng')
        .arcColor('color')
        .arcDashLength(0.4)
        .arcDashGap(0.2)
        .arcDashAnimateTime(1500)
        .arcStroke(0.8)
    }, 1600)

    // Move to next step after pause
    timeoutRef.current = setTimeout(() => {
      if (currentStep < roundResults.length - 1) {
        setCurrentStep((s) => s + 1)
      } else {
        setIsPlaying(false)
      }
    }, 4000) // 1.5s fly + 2.5s display

    return () => {
      clearTimeout(showTimer)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [currentStep, isPlaying, roundResults])

  const handleRestart = useCallback(() => {
    setCurrentStep(0)
    setIsPlaying(true)
  }, [])

  const currentResult = currentStep >= 0 && currentStep < roundResults.length
    ? roundResults[currentStep]
    : null

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-3">
          <span className="text-white/60 text-sm font-medium">
            🎬 Replay
          </span>
          {currentResult && (
            <span className="text-white text-sm font-bold">
              Round {currentStep + 1}/{roundResults.length} — {currentResult.location.name}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-white/60 hover:text-white text-sm px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
        >
          ✕ Close
        </button>
      </div>

      {/* Globe */}
      <div ref={containerRef} className="flex-1 w-full" />

      {/* Bottom info card */}
      {currentResult && (
        <div className="absolute bottom-0 left-0 right-0 z-10 p-4 bg-gradient-to-t from-black/90 to-transparent">
          <div className="max-w-md mx-auto bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-white font-bold text-sm">
                  {currentResult.location.name}, {currentResult.location.country}
                </p>
                <p className="text-white/40 text-xs">
                  📍 {Math.round(currentResult.distanceKm).toLocaleString()} km away
                </p>
              </div>
              <span
                className="text-lg font-extrabold tabular-nums"
                style={{ color: currentResult.color }}
              >
                +{currentResult.score}
              </span>
            </div>

            {/* Progress dots */}
            <div className="flex items-center justify-center gap-2 mt-3">
              {roundResults.map((_, i) => (
                <div
                  key={i}
                  className={[
                    'w-2 h-2 rounded-full transition-all duration-300',
                    i === currentStep
                      ? 'bg-white scale-125'
                      : i < currentStep
                      ? 'bg-white/50'
                      : 'bg-white/20',
                  ].join(' ')}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Replay finished overlay */}
      {!isPlaying && currentStep >= roundResults.length - 1 && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="text-center space-y-4">
            <p className="text-white text-xl font-bold">Replay complete!</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleRestart}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium border border-white/10 transition-colors"
              >
                🔄 Watch Again
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
