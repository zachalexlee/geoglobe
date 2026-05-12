/**
 * Celebration effects for great moments.
 * Uses canvas-confetti for particle effects.
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - canvas-confetti types
import confetti from 'canvas-confetti'

/** Big confetti burst for perfect/near-perfect scores */
export function celebrateScore(score: number, maxScore: number) {
  const pct = score / maxScore

  if (pct >= 0.95) {
    // Perfect! Full fireworks
    fireworks()
  } else if (pct >= 0.8) {
    // Great score — big burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#6366f1', '#f59e0b', '#ec4899'],
    })
  } else if (pct >= 0.6) {
    // Good — small pop
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.7 },
      colors: ['#10b981', '#6366f1'],
    })
  }
}

/** Celebrate a streak milestone */
export function celebrateStreak(streak: number) {
  if (streak % 7 === 0) {
    // Weekly streak — big celebration
    fireworks()
  } else if (streak >= 3) {
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.5 },
      colors: ['#f59e0b', '#ef4444', '#f97316'],
    })
  }
}

/** Celebrate badge unlock */
export function celebrateBadge() {
  const duration = 2000
  const end = Date.now() + duration

  function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.6 },
      colors: ['#fbbf24', '#f59e0b', '#d97706'],
    })
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.6 },
      colors: ['#fbbf24', '#f59e0b', '#d97706'],
    })

    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  }
  frame()
}

/** Fireworks effect for the best moments */
function fireworks() {
  const duration = 3000
  const animationEnd = Date.now() + duration
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 }

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min
  }

  const interval = setInterval(function () {
    const timeLeft = animationEnd - Date.now()
    if (timeLeft <= 0) return clearInterval(interval)

    const particleCount = 50 * (timeLeft / duration)
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
    })
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
    })
  }, 250)
}

/** Single pin-placement burst */
export function celebratePinPlacement(score: number) {
  if (score >= 90) {
    confetti({
      particleCount: 30,
      spread: 40,
      origin: { x: 0.5, y: 0.5 },
      colors: ['#10b981', '#34d399'],
      gravity: 0.8,
      scalar: 0.8,
    })
  }
}
