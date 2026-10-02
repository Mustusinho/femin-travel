export function classifyLocation(data,lat,lng){
  const address=data?.address || {}
  const city=address.city || address.town || address.village
  const type=data?.addresstype || data?.type || ''
  const inhabited=Boolean(city) && !['ocean','sea','water','desert','county','state','region','administrative'].includes(type)
  return {name:inhabited?city:(address.state || address.region || data?.name || 'Selected region'),country:address.country || '',lat,lng,kind:inhabited?'settlement':'region',planningEligible:inhabited,explanation:inhabited?'A named settlement was returned by the geocoder. This identifies a place, not its safety.':'We could not identify a travel city accurately. Search for a city or choose a curated destination.',source:'OpenStreetMap / Nominatim'}
}
