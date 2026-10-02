const aliases = {
  destination_clicked: 'destination_selected',
  homepage_preview_generated: 'destination_selected',
  homepage_quick_destination_clicked: 'destination_selected',
  homepage_full_brief_clicked: 'trip_started',
  homepage_free_kit_clicked: 'free_kit_requested'
}
export function trackEvent(type, data = {}) {
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== 'true') return
  const event_type = aliases[type] || type
  const allowed = [
    'provider',
    'category',
    'destination',
    'country',
    'placement',
    'trip_id',
    'campaign',
    'content',
    'step',
    'mode'
  ]
  const event_data = Object.fromEntries(
    Object.entries(data).filter(([k, v]) => allowed.includes(k) && v !== undefined)
  )
  if (!event_data.destination && data.name) event_data.destination = data.name
  fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event_type, event_data }),
    keepalive: true
  }).catch(() => {})
}
