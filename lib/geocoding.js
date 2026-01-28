import 'server-only'

// Geocoding utilities - Nominatim (free) with optional Mapbox

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org'
const MAPBOX_BASE = 'https://api.mapbox.com/geocoding/v5/mapbox.places'

// tiny in-memory cache to reduce rate limits
const cache = new Map()
const TTL = 1000 * 60 * 30 // 30 min

function getCached(key) {
  const hit = cache.get(key)
  if (!hit) return null
  if (Date.now() - hit.t > TTL) {
    cache.delete(key)
    return null
  }
  return hit.v
}
function setCached(key, v) {
  cache.set(key, { v, t: Date.now() })
}

async function fetchWithTimeout(url, opts = {}, ms = 6500) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), ms)
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal })
    return res
  } finally {
    clearTimeout(id)
  }
}

function mapboxToken() {
  return process.env.MAPBOX_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''
}

export async function reverseGeocode(lat, lng) {
  const key = `rev:${lat.toFixed(4)},${lng.toFixed(4)}`
  const cached = getCached(key)
  if (cached) return cached

  const token = mapboxToken()
  if (token) {
    try {
      const result = await mapboxReverseGeocode(lat, lng, token)
      if (result) {
        setCached(key, result)
        return result
      }
    } catch {
      // fall back
    }
  }

  const result = await nominatimReverseGeocode(lat, lng)
  setCached(key, result)
  return result
}

export async function forwardGeocode(query) {
  const q = query.trim()
  const key = `fwd:${q.toLowerCase()}`
  const cached = getCached(key)
  if (cached) return cached

  const token = mapboxToken()
  if (token) {
    try {
      const result = await mapboxForwardGeocode(q, token)
      if (result) {
        setCached(key, result)
        return result
      }
    } catch {
      // fall back
    }
  }

  const result = await nominatimForwardGeocode(q)
  if (result) setCached(key, result)
  return result
}

async function nominatimReverseGeocode(lat, lng) {
  try {
    const response = await fetchWithTimeout(
      `${NOMINATIM_BASE}/reverse?lat=${lat}&lon=${lng}&format=json&zoom=10`,
      { headers: { 'User-Agent': 'FeminTravel/1.0' } }
    )
    if (!response.ok) throw new Error('Nominatim request failed')

    const data = await response.json()
    const address = data.address || {}

    const name =
      address.city ||
      address.town ||
      address.village ||
      address.county ||
      address.state ||
      data.name ||
      `Location (${lat.toFixed(2)}, ${lng.toFixed(2)})`

    const country = address.country || 'Unknown'
    return { name, country, lat, lng }
  } catch {
    return { name: `Location (${lat.toFixed(2)}, ${lng.toFixed(2)})`, country: 'Unknown', lat, lng }
  }
}

async function nominatimForwardGeocode(query) {
  try {
    const response = await fetchWithTimeout(
      `${NOMINATIM_BASE}/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
      { headers: { 'User-Agent': 'FeminTravel/1.0' } }
    )
    if (!response.ok) throw new Error('Nominatim request failed')

    const data = await response.json()
    if (!data.length) return null

    const result = data[0]
    return {
      name: result.display_name.split(',')[0],
      country: result.display_name.split(',').pop().trim(),
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
    }
  } catch {
    return null
  }
}

async function mapboxReverseGeocode(lat, lng, token) {
  const url = `${MAPBOX_BASE}/${lng},${lat}.json?access_token=${token}&types=place,locality,region`
  const response = await fetchWithTimeout(url)
  if (!response.ok) throw new Error('Mapbox request failed')
  const data = await response.json()
  if (!data.features?.length) return null

  const feature = data.features[0]
  const country = feature.context?.find((c) => c.id.startsWith('country'))?.text || 'Unknown'

  return { name: feature.text, country, lat, lng }
}

async function mapboxForwardGeocode(query, token) {
  const url = `${MAPBOX_BASE}/${encodeURIComponent(query)}.json?access_token=${token}&types=place,locality,region&limit=1`
  const response = await fetchWithTimeout(url)
  if (!response.ok) throw new Error('Mapbox request failed')
  const data = await response.json()
  if (!data.features?.length) return null

  const feature = data.features[0]
  const country = feature.context?.find((c) => c.id.startsWith('country'))?.text || 'Unknown'

  return { name: feature.text, country, lat: feature.center[1], lng: feature.center[0] }
}
