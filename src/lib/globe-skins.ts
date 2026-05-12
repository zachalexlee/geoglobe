/**
 * Globe skin definitions for cosmetic customization.
 * Each skin changes the globe texture, atmosphere, and background.
 */

export interface GlobeSkin {
  id: string
  name: string
  description: string
  icon: string
  globeImageUrl: string
  atmosphereColor: string
  backgroundStarColor: string
  /** Optional tile URL override — if set, uses tiles instead of static globeImageUrl */
  tileUrl?: (x: number, y: number, l: number) => string
  isPremium: boolean
}

export const GLOBE_SKINS: GlobeSkin[] = [
  {
    id: 'satellite',
    name: 'Satellite',
    description: 'Classic satellite imagery from space',
    icon: '🛰️',
    globeImageUrl: '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
    atmosphereColor: '#3a228a',
    backgroundStarColor: '#ffffff',
    tileUrl: (x, y, l) =>
      `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${l}/${y}/${x}`,
    isPremium: false,
  },
  {
    id: 'political',
    name: 'Political',
    description: 'Colored country borders and regions',
    icon: '🗺️',
    globeImageUrl: '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
    atmosphereColor: '#2563eb',
    backgroundStarColor: '#e0e7ff',
    tileUrl: (x, y, l) =>
      `https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/${l}/${y}/${x}`,
    isPremium: false,
  },
  {
    id: 'night',
    name: 'Night',
    description: 'Dark earth with glowing city lights',
    icon: '🌃',
    globeImageUrl: '//unpkg.com/three-globe/example/img/earth-night.jpg',
    atmosphereColor: '#1e1b4b',
    backgroundStarColor: '#fbbf24',
    isPremium: true,
  },
  {
    id: 'retro',
    name: 'Retro',
    description: 'Vintage old-world map aesthetic',
    icon: '📜',
    globeImageUrl: '//unpkg.com/three-globe/example/img/earth-water.png',
    atmosphereColor: '#92400e',
    backgroundStarColor: '#fde68a',
    tileUrl: (x, y, l) =>
      `https://tiles.stadiamaps.com/tiles/stamen_watercolor/${l}/${x}/${y}.jpg`,
    isPremium: true,
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean white and gray globe',
    icon: '⚪',
    globeImageUrl: '//unpkg.com/three-globe/example/img/earth-topology.png',
    atmosphereColor: '#6b7280',
    backgroundStarColor: '#9ca3af',
    tileUrl: (x, y, l) =>
      `https://tiles.stadiamaps.com/tiles/alidade_smooth_nolabels/${l}/${x}/${y}.png`,
    isPremium: true,
  },
]

export const DEFAULT_SKIN = GLOBE_SKINS[0]

export function getSkinById(id: string): GlobeSkin {
  return GLOBE_SKINS.find((s) => s.id === id) ?? DEFAULT_SKIN
}
