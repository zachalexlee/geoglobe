export type MapStyle = {
  id: string
  label: string
  icon: string
  tileUrl: (x: number, y: number, l: number) => string
  attribution?: string
}

// Free tile providers — no API key required
export const MAP_STYLES: MapStyle[] = [
  {
    id: 'osm-standard',
    label: 'Street Map',
    icon: '🗺️',
    tileUrl: (x, y, l) => `https://tile.openstreetmap.org/${l}/${x}/${y}.png`,
    attribution: '© OpenStreetMap contributors',
  },
  {
    id: 'satellite',
    label: 'Satellite',
    icon: '🛰️',
    tileUrl: (x, y, l) =>
      `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${l}/${y}/${x}`,
    attribution: '© Esri, Maxar, Earthstar Geographics',
  },
  {
    id: 'topo',
    label: 'Terrain',
    icon: '⛰️',
    tileUrl: (x, y, l) =>
      `https://tile.opentopomap.org/${l}/${x}/${y}.png`,
    attribution: '© OpenTopoMap (CC-BY-SA)',
  },
  {
    id: 'watercolor',
    label: 'Watercolor',
    icon: '🎨',
    tileUrl: (x, y, l) =>
      `https://tiles.stadiamaps.com/tiles/stamen_watercolor/${l}/${x}/${y}.jpg`,
    attribution: '© Stadia Maps, Stamen Design',
  },
  {
    id: 'dark',
    label: 'Dark',
    icon: '🌑',
    tileUrl: (x, y, l) =>
      `https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/${l}/${x}/${y}.png`,
    attribution: '© Stadia Maps',
  },
]

export const DEFAULT_MAP_STYLE = MAP_STYLES[0]

export const GLOBE_CONFIG = {
  // Fallback static textures (used if tile engine isn't supported)
  imageUrl: '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
  bumpImageUrl: '//unpkg.com/three-globe/example/img/earth-topology.png',
  backgroundImageUrl: '//unpkg.com/three-globe/example/img/night-sky.png',
  atmosphereColor: '#3a228a',
  atmosphereAltitude: 0.25,
  defaultPov: { lat: 20, lng: 0, altitude: 2.5 },
} as const

export type LatLng = { lat: number; lng: number }

export type Pin = {
  id: string
  lat: number
  lng: number
  color: string
  label?: string
  isCorrect?: boolean
  isGuess?: boolean
}

export type ArcData = {
  startLat: number
  startLng: number
  endLat: number
  endLng: number
  color: string
}
