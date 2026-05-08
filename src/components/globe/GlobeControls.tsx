'use client'

interface GlobeControlsProps {
  /** e.g. "Round 3 / 5" */
  roundLabel?: string
  /** Name of the location to guess */
  locationName?: string
  /** Whether the player has placed a pin (shows Confirm button) */
  hasPinPlaced?: boolean
  onConfirm?: () => void
  onReset?: () => void
  /** Disable interaction while result is showing */
  disabled?: boolean
}

export default function GlobeControls({
  roundLabel,
  locationName,
  hasPinPlaced = false,
  onConfirm,
  onReset,
  disabled = false,
}: GlobeControlsProps) {
  return (
    <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4 pointer-events-none">
      {/* ── Left: round + location info ─────────────────────────────── */}
      <div className="flex flex-col gap-2 pointer-events-auto">
        {roundLabel && (
          <div className="bg-black/60 backdrop-blur-sm text-white/70 text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full">
            {roundLabel}
          </div>
        )}
        {locationName && (
          <div className="bg-black/70 backdrop-blur-sm text-white text-lg font-bold px-4 py-2 rounded-xl shadow-lg">
            📍 {locationName}
          </div>
        )}
      </div>

      {/* ── Right: action buttons ────────────────────────────────────── */}
      <div className="flex flex-col gap-2 items-end pointer-events-auto">
        {hasPinPlaced && (
          <button
            onClick={onConfirm}
            disabled={disabled}
            className="
              bg-emerald-500 hover:bg-emerald-400 active:scale-95
              disabled:opacity-40 disabled:cursor-not-allowed
              text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-lg
              transition-all duration-150
            "
          >
            ✓ Confirm Guess
          </button>
        )}
        {hasPinPlaced && (
          <button
            onClick={onReset}
            disabled={disabled}
            className="
              bg-black/60 backdrop-blur-sm hover:bg-black/80 active:scale-95
              disabled:opacity-40 disabled:cursor-not-allowed
              text-white/80 font-semibold text-sm px-4 py-2 rounded-xl shadow
              transition-all duration-150
            "
          >
            ↺ Reset Pin
          </button>
        )}
      </div>
    </div>
  )
}
