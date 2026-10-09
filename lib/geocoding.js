import 'server-only'
import { classifyLocation, distanceKm } from './location.mjs'
import { featuredDestinations } from './db/data'
import { getSupabase } from './db/supabase'
import { HttpError } from './server/http'
import { readConfig } from './config.mjs'
const cache = new Map(),
  inflight = new Map()
let lastRequest = 0
async function lookup(key, fn) {
  const hit = cache.get(key)
  if (hit && hit.until > Date.now()) return hit.value
  if (inflight.has(key)) return inflight.get(key)
  const p = fn()
    .then((value) => {
      if (cache.size > 300) cache.delete(cache.keys().next().value)
      cache.set(key, { value, until: Date.now() + 1800000 })
      return value
    })
    .finally(() => inflight.delete(key))
  inflight.set(key, p)
  return p
}
async function nominatim(path) {
  if (readConfig().previewChecklist)
    throw new HttpError(503, 'Location search is not configured. Choose a curated destination.')
  const { supabase } = getSupabase()
  if (supabase) {
    const { data, error } = await supabase.rpc('consume_rate_limit', {
      p_key: 'nominatim-global',
      p_limit: 1,
      p_window: 2
    })
    if (error || !data)
      throw new HttpError(429, 'Location search is busy. Please retry in a moment.')
  } else {
    if (process.env.NODE_ENV === 'production')
      throw new HttpError(503, 'Location search is not configured. Choose a curated destination.')
    if (Date.now() - lastRequest < 1200)
      throw new HttpError(429, 'Please wait a moment before searching again.')
    lastRequest = Date.now()
  }
  const r = await fetch(`https://nominatim.openstreetmap.org/${path}`, {
    headers: {
      'User-Agent': `FeminTravel/2.0${process.env.NEXT_PUBLIC_CONTACT_EMAIL ? ` (${process.env.NEXT_PUBLIC_CONTACT_EMAIL})` : ''}`
    },
    signal: AbortSignal.timeout(6500)
  })
  if (!r.ok) throw new HttpError(502, 'Location lookup is unavailable. Please try again.')
  return r.json()
}
export async function reverseGeocode(lat, lng) {
  return lookup(`rev:${lat.toFixed(4)},${lng.toFixed(4)}`, async () => {
    try {
      if (readConfig().mapbox) {
        const r = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${process.env.MAPBOX_TOKEN}&types=place,locality`,
          { signal: AbortSignal.timeout(6500) }
        )
        if (r.ok) {
          const data = await r.json()
          const f = data.features?.[0]
          if (
            f &&
            f.relevance >= 0.8 &&
            f.place_type?.includes('place') &&
            distanceKm(lat, lng, f.center[1], f.center[0]) <= 40
          )
            return {
              name: f.text,
              country: f.context?.find((c) => c.id.startsWith('country'))?.text || '',
              lat,
              lng,
              kind: 'settlement',
              planningEligible: true,
              source: 'Mapbox',
              explanation: 'The geocoder returned a named place; this is not a safety assessment.'
            }
        }
      }
      return classifyLocation(
        await nominatim(
          `reverse?lat=${lat}&lon=${lng}&format=jsonv2&zoom=10&addressdetails=1&accept-language=en`
        ),
        lat,
        lng
      )
    } catch (e) {
      if (e instanceof HttpError && e.status === 429) throw e
      return {
        name: 'Selected area',
        country: '',
        lat,
        lng,
        kind: 'unknown',
        planningEligible: false,
        explanation:
          'We could not identify this location accurately. Search for a city or choose another destination.'
      }
    }
  })
}
export async function searchLocations(query) {
  const local = featuredDestinations
    .filter((d) => `${d.name} ${d.country}`.toLowerCase().includes(query.toLowerCase()))
    .map((d) => ({
      ...d,
      kind: d.slug === 'bali' ? 'region' : 'settlement',
      planningEligible: true,
      source: 'FeminTravel curated destinations'
    }))
  if (local.length) return local.slice(0, 5)
  return lookup(`search:${query.toLowerCase()}`, async () => {
    if (readConfig().mapbox) {
      const r = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${process.env.MAPBOX_TOKEN}&types=place,locality,region,country&limit=5`,
        { signal: AbortSignal.timeout(6500) }
      )
      if (!r.ok) throw new HttpError(502, 'Search unavailable.')
      const data = await r.json()
      return (data.features || []).map((f) => ({
        name: f.text,
        country: f.context?.find((c) => c.id.startsWith('country'))?.text || '',
        lat: f.center[1],
        lng: f.center[0],
        kind: f.place_type.includes('place') ? 'settlement' : 'region',
        planningEligible: f.place_type.includes('place'),
        source: 'Mapbox'
      }))
    }
    const data = await nominatim(
      `search?q=${encodeURIComponent(query)}&format=jsonv2&limit=5&addressdetails=1&accept-language=en`
    )
    return data.map((d) => ({
      ...classifyLocation(d, Number(d.lat), Number(d.lon)),
      name: d.name || d.display_name.split(',')[0]
    }))
  })
}
export async function forwardGeocode(query) {
  return (await searchLocations(query))[0] || null
}
