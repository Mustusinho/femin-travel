export function distanceKm(lat, lng, otherLat, otherLng) {
  const rad = (n) => (n * Math.PI) / 180
  const a =
    Math.sin(rad(otherLat - lat) / 2) ** 2 +
    Math.cos(rad(lat)) * Math.cos(rad(otherLat)) * Math.sin(rad(otherLng - lng) / 2) ** 2
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
export function classifyLocation(data, lat, lng) {
  const address = data?.address || {}
  const city = address.city || address.town
  const closeEnough =
    !Number.isFinite(Number(data?.lat)) ||
    !Number.isFinite(Number(data?.lon)) ||
    distanceKm(lat, lng, Number(data.lat), Number(data.lon)) <= 40
  const type = data?.addresstype || data?.type || ''
  const inhabited =
    Boolean(city) &&
    closeEnough &&
    !['ocean', 'sea', 'water', 'desert', 'county', 'state', 'region', 'administrative'].includes(
      type
    )
  return {
    name: inhabited ? city : address.state || address.region || data?.name || 'Selected region',
    country: address.country || '',
    lat,
    lng,
    kind: inhabited ? 'settlement' : 'region',
    planningEligible: inhabited,
    explanation: inhabited
      ? 'A named settlement was returned by the geocoder. This identifies a place, not its safety.'
      : 'We could not identify a travel city accurately. Search for a city or choose a curated destination.',
    source: 'OpenStreetMap / Nominatim'
  }
}
