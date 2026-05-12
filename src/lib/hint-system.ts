/**
 * City-Hint Progression System
 *
 * Provides progressive hints at a score penalty:
 * - Level 0: No hint (city name shown normally if hints disabled)
 * - Level 1: Country name only
 * - Level 2: Country + continent/region
 * - Level 3: City name revealed (full info)
 *
 * Each hint used costs 5 points penalty.
 */

export const HINT_PENALTY = 5

export type HintLevel = 0 | 1 | 2 | 3

export interface HintState {
  currentLevel: HintLevel
  totalPenalty: number
  maxLevel: 3
}

export interface HintInfo {
  level: HintLevel
  text: string
  label: string
}

// Map countries to their continent/region
const COUNTRY_REGIONS: Record<string, string> = {
  'USA': 'North America',
  'Canada': 'North America',
  'Mexico': 'North America',
  'Cuba': 'North America (Caribbean)',
  'Jamaica': 'North America (Caribbean)',
  'Puerto Rico': 'North America (Caribbean)',
  'Panama': 'Central America',
  'Brazil': 'South America',
  'Argentina': 'South America',
  'Peru': 'South America',
  'Colombia': 'South America',
  'Chile': 'South America',
  'Venezuela': 'South America',
  'Ecuador': 'South America',
  'Uruguay': 'South America',
  'Bolivia': 'South America',
  'UK': 'Europe',
  'France': 'Europe',
  'Germany': 'Europe',
  'Italy': 'Europe',
  'Spain': 'Europe',
  'Netherlands': 'Europe',
  'Portugal': 'Europe',
  'Belgium': 'Europe',
  'Switzerland': 'Europe',
  'Austria': 'Europe',
  'Sweden': 'Europe',
  'Norway': 'Europe',
  'Denmark': 'Europe',
  'Finland': 'Europe',
  'Poland': 'Europe',
  'Czech Republic': 'Europe',
  'Greece': 'Europe',
  'Ireland': 'Europe',
  'Hungary': 'Europe',
  'Romania': 'Europe',
  'Croatia': 'Europe',
  'Russia': 'Europe/Asia',
  'Turkey': 'Europe/Asia',
  'Japan': 'East Asia',
  'China': 'East Asia',
  'South Korea': 'East Asia',
  'Taiwan': 'East Asia',
  'India': 'South Asia',
  'Thailand': 'Southeast Asia',
  'Vietnam': 'Southeast Asia',
  'Philippines': 'Southeast Asia',
  'Indonesia': 'Southeast Asia',
  'Malaysia': 'Southeast Asia',
  'Singapore': 'Southeast Asia',
  'UAE': 'Middle East',
  'Saudi Arabia': 'Middle East',
  'Israel': 'Middle East',
  'Iran': 'Middle East',
  'Egypt': 'North Africa',
  'Morocco': 'North Africa',
  'South Africa': 'Southern Africa',
  'Nigeria': 'West Africa',
  'Kenya': 'East Africa',
  'Ethiopia': 'East Africa',
  'Tanzania': 'East Africa',
  'Australia': 'Oceania',
  'New Zealand': 'Oceania',
}

function getRegion(country: string): string {
  return COUNTRY_REGIONS[country] || 'World'
}

/**
 * Get hint information for a given level.
 */
export function getHintForLevel(
  cityName: string,
  country: string,
  level: HintLevel
): HintInfo {
  switch (level) {
    case 0:
      return { level: 0, text: '???', label: 'No hints used' }
    case 1:
      return { level: 1, text: country, label: 'Country revealed' }
    case 2:
      return {
        level: 2,
        text: `${country} (${getRegion(country)})`,
        label: 'Region revealed',
      }
    case 3:
      return { level: 3, text: cityName, label: 'City revealed' }
  }
}

/**
 * Create initial hint state.
 */
export function createHintState(): HintState {
  return {
    currentLevel: 0,
    totalPenalty: 0,
    maxLevel: 3,
  }
}

/**
 * Advance to next hint level.
 * Returns new state or null if already at max.
 */
export function advanceHint(state: HintState): HintState | null {
  if (state.currentLevel >= state.maxLevel) return null
  return {
    ...state,
    currentLevel: (state.currentLevel + 1) as HintLevel,
    totalPenalty: state.totalPenalty + HINT_PENALTY,
  }
}
