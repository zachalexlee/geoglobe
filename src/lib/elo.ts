// ── ELO rating calculation ────────────────────────────────────────────────────

export function calculateEloChange(
  winnerElo: number,
  loserElo: number,
  k = 32
): { winner: number; loser: number } {
  const expectedWin = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400))
  const change = Math.round(k * (1 - expectedWin))
  return { winner: change, loser: -change }
}
