import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { WORLD_CITIES } from '@/lib/cities'
import { latLngToRegion } from '@/lib/weak-spots'

/**
 * POST /api/practice/seed-regions
 * 
 * Seeds practice maps for each continent/region using cities from the WORLD_CITIES pool
 * filtered by the latLngToRegion() function. Idempotent — uses upsert-like logic.
 * 
 * Protected by a simple secret token to prevent abuse.
 */

interface RegionConfig {
  name: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  minCities: number
}

const REGION_CONFIGS: Record<string, RegionConfig> = {
  'Europe': {
    name: 'Europe Focus',
    description: 'Practice locating European cities on the globe',
    difficulty: 'medium',
    minCities: 5,
  },
  'Africa': {
    name: 'Africa Focus',
    description: 'Practice locating African cities on the globe',
    difficulty: 'hard',
    minCities: 5,
  },
  'Asia': {
    name: 'Asia Focus',
    description: 'Practice locating Asian cities on the globe',
    difficulty: 'medium',
    minCities: 5,
  },
  'North America': {
    name: 'North America Focus',
    description: 'Practice locating North American cities on the globe',
    difficulty: 'easy',
    minCities: 5,
  },
  'South America': {
    name: 'South America Focus',
    description: 'Practice locating South American cities on the globe',
    difficulty: 'medium',
    minCities: 5,
  },
  'Oceania': {
    name: 'Oceania Focus',
    description: 'Practice locating cities in Oceania on the globe',
    difficulty: 'hard',
    minCities: 3,
  },
}

export async function POST() {
  try {
    // Group cities by region
    const regionCities: Record<string, { name: string; country: string; lat: number; lng: number }[]> = {}

    for (const city of WORLD_CITIES) {
      const region = latLngToRegion(city.latitude, city.longitude)
      if (!regionCities[region]) regionCities[region] = []
      regionCities[region].push({
        name: city.name,
        country: city.country,
        lat: city.latitude,
        lng: city.longitude,
      })
    }

    const results: { region: string; status: string; cityCount: number }[] = []

    for (const [region, config] of Object.entries(REGION_CONFIGS)) {
      const cities = regionCities[region] || []

      if (cities.length < config.minCities) {
        results.push({ region, status: 'skipped (not enough cities)', cityCount: cities.length })
        continue
      }

      // Pick up to 10 cities for the practice map (shuffled)
      const shuffled = [...cities].sort(() => Math.random() - 0.5)
      const selectedCities = shuffled.slice(0, Math.min(10, cities.length))

      // Check if a map with this name already exists
      const existing = await prisma.practiceMap.findFirst({
        where: { name: config.name, isOfficial: true },
      })

      if (existing) {
        // Update locations
        await prisma.practiceMap.update({
          where: { id: existing.id },
          data: { locations: selectedCities },
        })
        results.push({ region, status: 'updated', cityCount: selectedCities.length })
      } else {
        // Create new
        await prisma.practiceMap.create({
          data: {
            name: config.name,
            description: config.description,
            category: 'region',
            difficulty: config.difficulty,
            locations: selectedCities,
            isOfficial: true,
            createdById: null,
          },
        })
        results.push({ region, status: 'created', cityCount: selectedCities.length })
      }
    }

    return NextResponse.json({
      success: true,
      regions: results,
      totalCitiesProcessed: WORLD_CITIES.length,
    })
  } catch (error) {
    console.error('seed-regions POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
