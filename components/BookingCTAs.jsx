'use client'
import Link from 'next/link'
import { bookingLinks } from '@/lib/booking.mjs'
import { trackEvent } from '@/lib/events'
const env = {
  NEXT_PUBLIC_AFFILIATES_ENABLED: process.env.NEXT_PUBLIC_AFFILIATES_ENABLED,
  NEXT_PUBLIC_AFFILIATE_HOTEL_URL: process.env.NEXT_PUBLIC_AFFILIATE_HOTEL_URL,
  NEXT_PUBLIC_AFFILIATE_FLIGHT_URL: process.env.NEXT_PUBLIC_AFFILIATE_FLIGHT_URL,
  NEXT_PUBLIC_AFFILIATE_ACTIVITY_URL: process.env.NEXT_PUBLIC_AFFILIATE_ACTIVITY_URL,
  NEXT_PUBLIC_AFFILIATE_INSURANCE_URL: process.env.NEXT_PUBLIC_AFFILIATE_INSURANCE_URL
}
export default function BookingCTAs({ destination, compact = false, placement = 'globe', tripId }) {
  const links = bookingLinks(destination, env)
  return (
    <div className="booking-block">
      <div className={`grid grid-cols-2 ${compact ? '' : 'sm:grid-cols-4'} gap-2`}>
        {links.map((p) => (
          <a
            key={p.id}
            href={p.url}
            target="_blank"
            rel={p.affiliate ? 'sponsored noopener noreferrer' : 'noopener noreferrer'}
            className="booking-link"
            onClick={() =>
              trackEvent('affiliate_click', {
                provider: p.provider,
                category: p.category,
                destination: destination?.name,
                country: destination?.country,
                placement,
                trip_id: tripId,
                campaign: 'trip_planning',
                content: p.category
              })
            }
          >
            <span>{p.label} ↗</span>
            <small>{p.affiliate ? 'Affiliate link' : 'Provider search'}</small>
          </a>
        ))}
      </div>
      <p className="text-xs text-gray-600 mt-3">
        External providers set prices and availability.{' '}
        {links.some((p) => p.affiliate)
          ? 'We may earn a commission from labelled affiliate links.'
          : 'These are ordinary search links; no affiliate relationship is configured.'}{' '}
        <Link href="/affiliate-disclosure" className="underline">
          Disclosure
        </Link>
      </p>
    </div>
  )
}
