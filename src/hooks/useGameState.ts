'use client'

import { useCallback, useReducer } from 'react'
import { haversineDistance, calculateScore, proximityColor } from '@/lib/game-engine'

// ── Types ──────────────────────────────────────────────────────────────────────

/** Client-safe location clue — no coordinates (for daily puzzles) */
export type LocationClue = {
  id: string
  order: number
  name: string
  country: string
  description: string
  imageUrl?: string | null
  category?: string | null
  eventDate?: string | null
}

/** Full location with coordinates (for practice/versus modes that compute locally) */
export type GameLocationFull = LocationClue & {
  latitude: number
  longitude: number
}

export type RoundResult = {
  location: LocationClue & { latitude: number; longitude: number }
  guess: { lat: number; lng: number }
  distanceKm: number
  score: number
  color: string
}

export type GamePhase = 'playing' | 'submitting' | 'round-result' | 'final-result'

export type GameState = {
  puzzleId: string
  puzzleNumber: number
  date: string
  locations: (LocationClue | GameLocationFull)[]
  currentRound: number       // 0-4
  phase: GamePhase
  pendingGuess: { lat: number; lng: number } | null
  confirmedGuess: { lat: number; lng: number } | null
  roundResults: RoundResult[]
  totalScore: number
}

// ── Actions ───────────────────────────────────────────────────────────────────

type Action =
  | { type: 'INIT_GAME'; payload: { puzzleId: string; puzzleNumber: number; date: string; locations: (LocationClue | GameLocationFull)[] } }
  | { type: 'PLACE_PENDING_GUESS'; payload: { lat: number; lng: number } }
  | { type: 'START_SUBMIT' }
  | { type: 'CONFIRM_GUESS_LOCAL' }
  | { type: 'GUESS_RESULT'; payload: RoundResult }
  | { type: 'GUESS_ERROR' }
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

// ── Type guard ────────────────────────────────────────────────────────────────

function hasCoordinates(loc: LocationClue | GameLocationFull): loc is GameLocationFull {
  return 'latitude' in loc && 'longitude' in loc
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

    case 'START_SUBMIT': {
      if (!state.pendingGuess || state.phase !== 'playing') return state
      return { ...state, phase: 'submitting' }
    }

    case 'CONFIRM_GUESS_LOCAL': {
      // Local computation — only works when locations have coordinates (practice/versus)
      if (!state.pendingGuess || state.phase !== 'playing') return state

      const location = state.locations[state.currentRound]
      if (!location || !hasCoordinates(location)) return state

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

    case 'GUESS_RESULT': {
      const result = action.payload
      return {
        ...state,
        phase: 'round-result',
        confirmedGuess: result.guess,
        roundResults: [...state.roundResults, result],
        totalScore: state.totalScore + result.score,
      }
    }

    case 'GUESS_ERROR': {
      // Revert to playing state so user can try again
      return { ...state, phase: 'playing' }
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
  locations: (LocationClue | GameLocationFull)[]
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

  /**
   * Confirm guess LOCALLY — for practice/versus modes that have coordinates in state.
   * This does NOT call the server and computes distance client-side.
   */
  const confirmGuess = useCallback(() => {
    dispatch({ type: 'CONFIRM_GUESS_LOCAL' })
  }, [])

  /**
   * Submit the guess to the server for validation (daily puzzle mode).
   * The server computes the distance/score and reveals the actual coordinates.
   */
  const submitGuess = useCallback(
    async (
      puzzleId: string,
      round: number,
      guessLat: number,
      guessLng: number,
      locationClue: LocationClue
    ) => {
      dispatch({ type: 'START_SUBMIT' })

      try {
        const res = await fetch('/api/guess', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ puzzleId, round, guessLat, guessLng }),
        })

        if (!res.ok) {
          const error = await res.json().catch(() => ({ error: 'Unknown error' }))
          console.error('Guess submission failed:', error)
          dispatch({ type: 'GUESS_ERROR' })
          return null
        }

        const data = await res.json()
        // data: { distance, score, color, actualLat, actualLng, locationName, locationCountry }

        const result: RoundResult = {
          location: {
            ...locationClue,
            latitude: data.actualLat,
            longitude: data.actualLng,
          },
          guess: { lat: guessLat, lng: guessLng },
          distanceKm: data.distance,
          score: data.score,
          color: data.color ?? proximityColor(data.distance),
        }

        dispatch({ type: 'GUESS_RESULT', payload: result })
        return result
      } catch (err) {
        console.error('Guess submission error:', err)
        dispatch({ type: 'GUESS_ERROR' })
        return null
      }
    },
    []
  )

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
    submitGuess,
    nextRound,
    resetPendingGuess,
  }
}
