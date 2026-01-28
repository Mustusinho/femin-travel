'use client'

export default function AffiliateLink({
  href,
  children,
  utmContent = 'cta',
  eventType = 'affiliate_click',
  eventData = {},
  className = '',
}) {
  const withUtm = (url) => {
    try {
      const u = new URL(url)
      u.searchParams.set('utm_source', 'femintravel')
      u.searchParams.set('utm_medium', 'affiliate')
      u.searchParams.set('utm_campaign', 'book_it')
      u.searchParams.set('utm_content', utmContent)
      return u.toString()
    } catch {
      return url
    }
  }

  const onClick = () => {
    fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: eventType,
        event_data: { ...eventData, utm_content: utmContent },
      }),
    }).catch(() => {})
  }

  return (
    <a
      href={withUtm(href)}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={onClick}
      className={className}
    >
      {children}
    </a>
  )
}
