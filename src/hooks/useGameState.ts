'use client'

import { useCallback, useReducer } from 'react'
import {
  haversineDistance,
  calculateScore,
  proximityColor,
  type GameLocation,
  type GameState,
  type RoundResult,
} from '@/lib/game-engine'

// ── Actions ───────────────────────────────────────────────────────────────────

type Action =
  | { type: 'INIT_GAME'; payload: { puzzleId: string; puzzleNumber: number; date: string; locations: GameLocation[] } }
  | { type: 'PLACE_PENDING_GUESS'; payload: { lat: number; lng: number } }
  | { type: 'CONFIRM_GUESS' }
  | { type: 'NEXT_ROUND' }
  | { type: 'RESET_PENDING_GUESS' }

// ── Initial state ─────────────────────────────────────────────────────────────

const INITIAL_STATE: GameState = {
  puzzleId: '',
  puzzleNumber: 0,
  date: '',
  locations: [],
  currentRound: 0,
  phase: 'playing',
  pendingGuess: null,
  confirmedGuess: null,
  roundResults: [],
  totalScore: 0,
}

// ── Reducer ───────────────────────────────────────────────────────────────────

function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'INIT_GAME': {
      return {
        ...INITIAL_STATE,
        ...action.payload,
      }
    }

    case 'PLACE_PENDING_GUESS': {
      if (state.phase !== 'playing') return state
      return { ...state, pendingGuess: action.payload }
    }

    case 'CONFIRM_GUESS': {
      if (!state.pendingGuess || state.phase !== 'playing') return state

      const location = state.locations[state.currentRound]
      if (!location) return state

      const distanceKm = haversineDistance(
        state.pendingGuess.lat,
        state.pendingGuess.lng,
        location.latitude,
        location.longitude
      )
      const score = calculateScore(distanceKm)
      const color = proximityColor(distanceKm)

      const result: RoundResult = {
        location,
        guess: state.pendingGuess,
        distanceKm,
        score,
        color,
      }

      return {
        ...state,
        phase: 'round-result',
        confirmedGuess: state.pendingGuess,
        roundResults: [...state.roundResults, result],
        totalScore: state.totalScore + score,
      }
    }

    case 'NEXT_ROUND': {
      if (state.phase !== 'round-result') return state

      const nextRound = state.currentRound + 1
      const isLastRound = nextRound >= state.locations.length

      return {
        ...state,
        currentRound: isLastRound ? state.currentRound : nextRound,
        phase: isLastRound ? 'final-result' : 'playing',
        pendingGuess: null,
        confirmedGuess: null,
      }
    }

    case 'RESET_PENDING_GUESS': {
      if (state.phase !== 'playing') return state
      return { ...state, pendingGuess: null }
    }

    default:
      return state
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export type PuzzleData = {
  id: string
  puzzleNumber: number
  date: string
  locations: GameLocation[]
}

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE)

  const initGame = useCallback((puzzle: PuzzleData) => {
    dispatch({
      type: 'INIT_GAME',
      payload: {
        puzzleId: puzzle.id,
        puzzleNumber: puzzle.puzzleNumber,
        date: puzzle.date,
        locations: puzzle.locations,
      },
    })
  }, [])

  const placePendingGuess = useCallback((lat: number, lng: number) => {
    dispatch({ type: 'PLACE_PENDING_GUESS', payload: { lat, lng } })
  }, [])

  const confirmGuess = useCallback(() => {
    dispatch({ type: 'CONFIRM_GUESS' })
  }, [])

  const nextRound = useCallback(() => {
    dispatch({ type: 'NEXT_ROUND' })
  }, [])

  const resetPendingGuess = useCallback(() => {
    dispatch({ type: 'RESET_PENDING_GUESS' })
  }, [])

  return {
    state,
    initGame,
    placePendingGuess,
    confirmGuess,
    nextRound,
    resetPendingGuess,
  }
}
