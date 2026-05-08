import type { RoundResult } from './game-engine'

// Returns emoji block for a distance
function distanceEmoji(distanceKm: number): string {
  if (distanceKm <= 50) return '🟩'
  if (distanceKm <= 500) return '🟨'
  if (distanceKm <= 1500) return '🟧'
  if (distanceKm <= 3000) return '🟥'
  return '⬛'
}

export function generateShareText(
  puzzleNumber: number,
  totalScore: number,
  roundResults: RoundResult[],
  streak: number
): string {
  const lines = [
    `🌍 GeoGlobe #${puzzleNumber} — ${totalScore.toLocaleString()}/5,000`,
    '',
    ...roundResults.map(r => {
      const km = Math.round(r.distanceKm).toLocaleString()
      return `📍 ${distanceEmoji(r.distanceKm)} ${km} km`
    }),
    '',
  ]
  if (streak > 1) lines.push(`🔥 ${streak}-day streak`)
  lines.push('https://geoglobe.app')
  return lines.join('\n')
}

export async function copyShareText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
