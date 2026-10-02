import { httpsUrl } from './config.mjs'
export const providers = [
  { id: 'booking', category: 'hotel', label: 'Hotels', env: 'HOTEL' },
  { id: 'google-flights', category: 'flight', label: 'Flights', env: 'FLIGHT' },
  { id: 'getyourguide', category: 'activity', label: 'Activities', env: 'ACTIVITY' },
  { id: 'safetywing', category: 'insurance', label: 'Insurance', env: 'INSURANCE' }
]
export function bookingLinks(destination = {}, env = {}) {
  const search = [destination.name, destination.country].filter(Boolean).join(', ') || 'travel'
  const defaults = {
    hotel: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(search)}`,
    flight: `https://www.google.com/travel/flights?q=${encodeURIComponent(`Flights to ${search}`)}`,
    activity: `https://www.getyourguide.com/s/?q=${encodeURIComponent(search)}`,
    insurance: 'https://safetywing.com/nomad-insurance/'
  }
  return providers.map((p) => {
    // Owner supplies a complete approved URL; no guessed partner IDs or parameters.
    const configured = httpsUrl(
      (env[`NEXT_PUBLIC_AFFILIATE_${p.env}_URL`] || '').replaceAll(
        '{destination}',
        encodeURIComponent(search)
      )
    )
    const affiliate = env.NEXT_PUBLIC_AFFILIATES_ENABLED === 'true' && Boolean(configured)
    const url = new URL(affiliate ? configured : defaults[p.category])
    url.searchParams.set('utm_source', 'femintravel')
    url.searchParams.set('utm_medium', affiliate ? 'affiliate' : 'referral')
    url.searchParams.set('utm_campaign', 'trip_planning')
    url.searchParams.set('utm_content', p.category)
    return { ...p, provider: url.hostname, url: url.toString(), affiliate }
  })
}
