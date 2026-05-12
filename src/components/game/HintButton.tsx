'use client'

import { useState, useCallback } from 'react'
import {
  createHintState,
  advanceHint,
  getHintForLevel,
  HINT_PENALTY,
  type HintState,
  type HintLevel,
} from '@/lib/hint-system'

interface HintButtonProps {
  cityName: string
  country: string
  onPenaltyChange: (penalty: number) => void
  /** Called with the current hint text to display */
  onHintRevealed: (text: string, level: HintLevel) => void
}

export default function HintButton({
  cityName,
  country,
  onPenaltyChange,
  onHintRevealed,
}: HintButtonProps) {
  const [hintState, setHintState] = useState<HintState>(createHintState)

  const handleRequestHint = useCallback(() => {
    setHintState((prev) => {
      const next = advanceHint(prev)
      if (!next) return prev
      const hint = getHintForLevel(cityName, country, next.currentLevel)
      onPenaltyChange(next.totalPenalty)
      onHintRevealed(hint.text, next.currentLevel)
      return next
    })
  }, [cityName, country, onPenaltyChange, onHintRevealed])

  // Reset hints when city changes
  const [prevCity, setPrevCity] = useState(cityName)
  if (prevCity !== cityName) {
    setPrevCity(cityName)
    setHintState(createHintState())
  }

  const remainingHints = hintState.maxLevel - hintState.currentLevel
  const isMaxed = remainingHints === 0

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleRequestHint}
        disabled={isMaxed}
        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
          isMaxed
            ? 'bg-white/5 text-white/30 cursor-not-allowed'
            : 'bg-teal-600/80 hover:bg-teal-500 text-white'
        }`}
        title={isMaxed ? 'All hints used' : `Reveal next hint (-${HINT_PENALTY} pts)`}
      >
        💡 Hint ({remainingHints} left)
      </button>
      {hintState.totalPenalty > 0 && (
        <span className="text-red-400 text-xs font-medium">
          -{hintState.totalPenalty} pts
        </span>
      )}
    </div>
  )
}
