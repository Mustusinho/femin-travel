'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import 'mapbox-gl/dist/mapbox-gl.css'

const satelliteStyle = 'mapbox://styles/mapbox/standard-satellite'
const streetsStyle = 'mapbox://styles/mapbox/standard'

export default function CloseUpMap({ lat, lng, name }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const [point, setPoint] = useState({ lat, lng, name })
  const [view, setView] = useState('satellite')
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

  useEffect(() => {
    if (!token.startsWith('pk.') || !containerRef.current) return
    let active = true
    let map

    import('mapbox-gl/esm')
      .then((mapboxgl) => {
        if (!active) return
        if (!mapboxgl.supported()) {
          setError('This browser cannot display the detailed map.')
          return
        }

        map = new mapboxgl.Map({
          accessToken: token,
          container: containerRef.current,
          style: satelliteStyle,
          projection: 'globe',
          center: [lng, lat],
          zoom: 13,
          maxZoom: 20,
          attributionControl: true
        })
        mapRef.current = map
        const marker = new mapboxgl.Marker({ color: '#9b4c71' }).setLngLat([lng, lat]).addTo(map)
        map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right')
        map.on('style.load', () => map.setProjection('globe'))
        map.on('load', () => setReady(true))
        map.on('error', (event) => {
          if (event.error?.status === 401 || event.error?.status === 403) {
            setError('The map token cannot load this preview. Check its allowed website URLs.')
          }
        })
        map.on('click', (event) => {
          const { lat: nextLat, lng: nextLng } = event.lngLat
          marker.setLngLat([nextLng, nextLat])
          setPoint({ lat: nextLat, lng: nextLng, name: '' })
        })
      })
      .catch(() => {
        if (active) setError('The detailed map could not load. Try again later.')
      })

    return () => {
      active = false
      map?.remove()
      mapRef.current = null
    }
  }, [lat, lng, token])

  const changeView = (nextView) => {
    if (view === nextView || !mapRef.current) return
    setView(nextView)
    mapRef.current.setStyle(nextView === 'satellite' ? satelliteStyle : streetsStyle)
  }

  if (!token.startsWith('pk.')) {
    return (
      <main id="main-content" className="min-h-[60dvh] grid place-items-center px-4">
        <div className="max-w-md text-center">
          <h1 className="font-serif text-3xl mb-3">Explore closer</h1>
          <p className="text-gray-600 mb-5">Detailed maps are not enabled in this preview yet.</p>
          <Link className="btn-primary inline-block" href="/globe">
            Back to the globe
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main
      id="main-content"
      className="relative h-[calc(100dvh-76px)] min-h-[540px] overflow-hidden bg-[#171829]"
    >
      <div className="absolute inset-0">
        <div ref={containerRef} className="h-full w-full" aria-label="Interactive close-up map" />
      </div>
      {!ready && !error && (
        <p role="status" className="absolute bottom-10 left-4 z-10 bg-white p-3 rounded-xl">
          Loading the detailed map…
        </p>
      )}
      {error && (
        <p role="alert" className="absolute bottom-10 left-4 right-4 z-10 bg-white p-3 rounded-xl">
          {error}
        </p>
      )}
      <div className="absolute z-10 top-4 left-4 right-16 md:right-auto md:w-[300px] rounded-2xl bg-white/95 shadow-xl p-4 text-[#35283a]">
        <Link href="/globe" className="text-xs font-semibold text-[#894a69] underline">
          ← Back to the globe
        </Link>
        <h1 className="font-serif text-2xl mt-2">Explore closer</h1>
        <p className="text-sm mt-1 font-semibold truncate">{point.name || 'Selected point'}</p>
        <p className="text-xs text-gray-600 mt-1">
          {point.lat.toFixed(4)}°, {point.lng.toFixed(4)}° · Tap anywhere to move the pin.
        </p>
        <div className="flex gap-2 mt-3" role="group" aria-label="Map view">
          {[
            { id: 'satellite', label: 'Satellite' },
            { id: 'streets', label: 'Streets' }
          ].map(({ id, label }) => (
            <button
              key={id}
              type="button"
              aria-pressed={view === id}
              onClick={() => changeView(id)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold border ${
                view === id ? 'bg-[#8e4669] text-white border-[#8e4669]' : 'border-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <Link
          href={point.name ? `/plan?destination=${encodeURIComponent(point.name)}` : '/plan'}
          className="btn-primary block text-center mt-3"
        >
          {point.name ? `Plan a trip to ${point.name}` : 'Plan a nearby city'} →
        </Link>
        <p className="text-[11px] text-gray-600 mt-2">
          Imagery and place details vary by location. Check current information before travel.
        </p>
      </div>
    </main>
  )
}
