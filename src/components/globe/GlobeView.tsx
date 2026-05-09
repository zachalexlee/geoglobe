'use client'

import { useEffect, useRef } from 'react'
import {
  GLOBE_CONFIG,
  DEFAULT_MAP_STYLE,
  type Pin,
  type ArcData,
  type MapStyle,
} from '@/lib/globe-config'

interface GlobeViewProps {
  onGlobeClick?: (coords: { lat: number; lng: number }) => void
  pins?: Pin[]
  arcs?: ArcData[]
  disabled?: boolean
  mapStyle?: MapStyle
}

export default function GlobeView({
  onGlobeClick,
  pins = [],
  arcs = [],
  disabled = false,
  mapStyle = DEFAULT_MAP_STYLE,
}: GlobeViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globeRef = useRef<any>(null)

  // Store latest callback in a ref so the globe event handler is always up-to-date
  const onClickRef = useRef(onGlobeClick)
  useEffect(() => {
    onClickRef.current = onGlobeClick
  }, [onGlobeClick])

  const disabledRef = useRef(disabled)
  useEffect(() => {
    disabledRef.current = disabled
  }, [disabled])

  // ── Initialise the globe once on mount ──────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let globe: any
    let destroyed = false

    import('globe.gl').then((mod) => {
      if (destroyed || !containerRef.current) return

      const GlobeGL = mod.default

      globe = new GlobeGL(containerRef.current)

      globe
        // Use tile engine for high-res maps
        .globeTileEngineUrl(mapStyle.tileUrl)
        // Remove the static image so tiles render cleanly
        .globeImageUrl('')
        // Keep bump map for terrain depth
        .bumpImageUrl(GLOBE_CONFIG.bumpImageUrl)
        .backgroundImageUrl(GLOBE_CONFIG.backgroundImageUrl)
        // Atmosphere
        .atmosphereColor(GLOBE_CONFIG.atmosphereColor)
        .atmosphereAltitude(GLOBE_CONFIG.atmosphereAltitude)
        // Initial point of view
        .pointOfView(GLOBE_CONFIG.defaultPov, 0)
        // Click handler
        .onGlobeClick((coords: { lat: number; lng: number }) => {
          if (!disabledRef.current && onClickRef.current) {
            onClickRef.current(coords)
          }
        })
        // Size to container
        .width(containerRef.current.clientWidth)
        .height(containerRef.current.clientHeight)

      globeRef.current = globe
    })

    // Resize observer
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
      if (globe) {
        try {
          globe._destructor?.()
        } catch {
          // ignore
        }
      }
      globeRef.current = null
    }
  }, []) // intentionally empty — only run once

  // ── Update tile engine when map style changes ───────────────────────────────
  useEffect(() => {
    if (!globeRef.current) return
    globeRef.current.globeTileEngineUrl(mapStyle.tileUrl)
  }, [mapStyle])

  // ── Sync pins ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!globeRef.current) return

    globeRef.current
      .pointsData(pins)
      .pointLat('lat')
      .pointLng('lng')
      .pointColor('color')
      .pointAltitude(0.01)
      .pointRadius(0.5)
      .pointLabel((d: Pin) => d.label ?? '')
  }, [pins])

  // ── Sync arcs ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!globeRef.current) return

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
      .arcStroke(0.5)
  }, [arcs])

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ cursor: disabled ? 'not-allowed' : 'crosshair' }}
    />
  )
}
