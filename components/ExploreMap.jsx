'use client'

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import 'mapbox-gl/dist/mapbox-gl.css'

const styles = {
  satellite: 'mapbox://styles/mapbox/standard-satellite',
  streets: 'mapbox://styles/mapbox/standard'
}

const ExploreMap = forwardRef(function ExploreMap(
  { destinations, selectedDestination, showMarkers, onPointClick, onDestinationClick, onReady },
  ref
) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const mapboxRef = useRef(null)
  const callbacksRef = useRef({ onPointClick, onDestinationClick, onReady })
  const markersRef = useRef([])
  const [view, setView] = useState('satellite')
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

  callbacksRef.current = { onPointClick, onDestinationClick, onReady }

  useImperativeHandle(
    ref,
    () => ({
      flyTo(lat, lng, { reducedMotion = false, zoom = 8 } = {}) {
        mapRef.current?.flyTo({
          center: [lng, lat],
          zoom,
          duration: reducedMotion ? 0 : 1400,
          essential: false
        })
      }
    }),
    []
  )

  useEffect(() => {
    if (!containerRef.current || !token.startsWith('pk.')) return
    let active = true
    let map

    import('mapbox-gl/esm')
      .then((mapboxgl) => {
        if (!active) return
        if (!mapboxgl.supported()) {
          setError('This browser cannot display the interactive map.')
          return
        }
        mapboxRef.current = mapboxgl
        map = new mapboxgl.Map({
          accessToken: token,
          container: containerRef.current,
          style: styles.satellite,
          projection: 'globe',
          center: [10, 20],
          zoom: 1.65,
          minZoom: 0.7,
          maxZoom: 20,
          attributionControl: true
        })
        mapRef.current = map
        map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right')
        map.on('style.load', () => map.setProjection('globe'))
        map.on('load', () => {
          if (!active) return
          setReady(true)
          callbacksRef.current.onReady()
        })
        map.on('error', (event) => {
          const status = event.error?.status
          if (status === 401 || status === 403) {
            setError(
              'The map token cannot load this site. Check its allowed URLs and styles:read scope.'
            )
          }
        })
        map.on('click', (event) => {
          callbacksRef.current.onPointClick({ lat: event.lngLat.lat, lng: event.lngLat.lng })
        })
      })
      .catch(() => {
        if (active)
          setError('The map could not load. Please try another browser or refresh the page.')
      })

    return () => {
      active = false
      map?.remove()
      mapRef.current = null
      mapboxRef.current = null
    }
  }, [token])

  useEffect(() => {
    const map = mapRef.current
    const mapboxgl = mapboxRef.current
    if (!ready || !map || !mapboxgl) return
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []

    const addMarker = (destination, selected) => {
      if (!Number.isFinite(destination.lat) || !Number.isFinite(destination.lng)) return
      const marker = new mapboxgl.Marker({ color: selected ? '#983d68' : '#f3a7bf' })
        .setLngLat([destination.lng, destination.lat])
        .addTo(map)
      const element = marker.getElement()
      element.setAttribute('role', 'button')
      element.setAttribute('tabindex', '0')
      element.setAttribute('aria-label', 'Explore ' + destination.name)
      const select = (event) => {
        event.stopPropagation()
        callbacksRef.current.onDestinationClick(destination)
      }
      element.addEventListener('click', select)
      element.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          select(event)
        }
      })
      markersRef.current.push(marker)
    }

    if (showMarkers) destinations.forEach((destination) => addMarker(destination, false))
    if (selectedDestination) addMarker(selectedDestination, true)
    return () => {
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []
    }
  }, [destinations, selectedDestination, showMarkers, ready])

  const changeView = (nextView) => {
    if (view === nextView || !mapRef.current) return
    setView(nextView)
    mapRef.current.setStyle(styles[nextView])
  }

  return (
    <div className="absolute inset-0">
      <div ref={containerRef} className="h-full w-full" aria-label="Interactive travel globe" />
      {!ready && !error && (
        <p
          role="status"
          className="absolute bottom-16 left-4 z-30 rounded-xl bg-white px-4 py-2 text-sm"
        >
          Loading the globe…
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="absolute bottom-16 left-4 right-4 z-30 max-w-md rounded-xl bg-white px-4 py-2 text-sm"
        >
          {error}
        </p>
      )}
      {ready && (
        <div
          className="absolute right-4 top-24 z-30 flex gap-1 rounded-full bg-white/95 p-1 shadow-lg"
          role="group"
          aria-label="Map view"
        >
          {[
            { id: 'satellite', label: 'Satellite' },
            { id: 'streets', label: 'Streets' }
          ].map(({ id, label }) => (
            <button
              key={id}
              type="button"
              aria-pressed={view === id}
              onClick={() => changeView(id)}
              className={
                'rounded-full px-3 py-1.5 text-xs font-semibold ' +
                (view === id ? 'bg-[#8e4669] text-white' : 'text-[#35283a]')
              }
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
})

export default ExploreMap
