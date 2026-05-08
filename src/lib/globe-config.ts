export const GLOBE_CONFIG = {
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
