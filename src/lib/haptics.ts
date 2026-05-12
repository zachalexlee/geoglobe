/**
 * Haptic feedback utilities for mobile devices.
 * Falls back gracefully when Vibration API is unavailable.
 */

type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'pin-drop'

const PATTERNS: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 25,
  heavy: 50,
  success: [10, 50, 20],
  error: [50, 30, 50, 30, 50],
  'pin-drop': [15, 30, 10],
}

export function haptic(pattern: HapticPattern = 'light') {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return
  navigator.vibrate(PATTERNS[pattern])
}
