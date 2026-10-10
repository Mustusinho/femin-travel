'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Globe3D from '@/components/Globe3D'

const places = [
  { name: 'Lisbon', country: 'Portugal', lat: 38.7223, lng: -9.1393, slug: 'lisbon' },
  { name: 'Barcelona', country: 'Spain', lat: 41.3851, lng: 2.1734, slug: 'barcelona' },
  { name: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503, slug: 'tokyo' },
  { name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522, slug: 'paris' },
  { name: 'Rome', country: 'Italy', lat: 41.9028, lng: 12.4964, slug: 'rome' },
  { name: 'Reykjavik', country: 'Iceland', lat: 64.1466, lng: -21.9426, slug: 'reykjavik' }
]

export default function HomeGlobe() {
  const router = useRouter()
  const globe = useRef(null)
  const [selected, setSelected] = useState(null)

  const choosePlace = (place) => {
    setSelected(place)
    globe.current?.pointOfView({ lat: place.lat, lng: place.lng, altitude: 1.8 }, 650)
  }

  const onReady = () => {
    globe.current?.pointOfView({ lat: 25, lng: 10, altitude: 2.35 }, 0)
    const controls = globe.current?.controls?.()
    if (controls) {
      controls.minDistance = 185
      controls.maxDistance = 500
      controls.enableDamping = true
      controls.dampingFactor = 0.08
    }
  }

  return (
    <div className="home-globe-stage">
      <div className="home-globe-top">
        <span className="eyebrow">The world is yours to explore</span>
        <span>Drag to spin · tap to choose</span>
      </div>
      <Globe3D
        ref={globe}
        className="home-globe-canvas"
        globeImageUrl="/earth/earth-day.jpg"
        backgroundColor="#241b30"
        atmosphereColor="#f6b7cf"
        atmosphereAltitude={0.14}
        pointsData={places}
        pointLat={(d) => d.lat}
        pointLng={(d) => d.lng}
        pointColor={() => '#f3a7bf'}
        pointAltitude={0}
        pointRadius={0.48}
        pointLabel={(d) => `${d.name}, ${d.country}`}
        pointsMerge={false}
        onPointClick={choosePlace}
        onGlobeClick={({ lat, lng }) =>
          router.push(`/globe?lat=${lat.toFixed(4)}&lng=${lng.toFixed(4)}`)
        }
        onGlobeReady={onReady}
      />
      <div className="home-globe-bottom">
        <p>{selected ? `${selected.name}, ${selected.country}` : 'Choose a place to begin'}</p>
        {selected ? (
          <div className="home-globe-actions">
            <Link href={`/globe?focus=${selected.slug}`}>Explore place →</Link>
            <Link href={`/plan?destination=${encodeURIComponent(selected.name)}`}>
              Plan this trip →
            </Link>
          </div>
        ) : (
          <Link href="/globe">Open the full globe →</Link>
        )}
        <div className="home-globe-choices" aria-label="Featured places">
          {places.slice(0, 3).map((place) => (
            <button key={place.slug} type="button" onClick={() => choosePlace(place)}>
              {place.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
