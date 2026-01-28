'use client'

import { Hotel, Plane, Shield, Map } from 'lucide-react'
import AffiliateLink from './AffiliateLink'

function buildBookingLinks(destination) {
  const q = encodeURIComponent(
    destination?.country ? `${destination.name}, ${destination.country}` : destination?.name || 'travel'
  )

  return {
    hotels: `https://www.booking.com/searchresults.html?ss=${q}`,
    flights: `https://www.google.com/travel/flights?q=Flights%20to%20${q}`,
    tours: `https://www.getyourguide.com/s/?q=${q}`,
    insurance: `https://safetywing.com/nomad-insurance/`,
  }
}

export default function BookingCTAs({ destination, compact = false }) {
  const links = buildBookingLinks(destination)

  const btnBase =
    'flex flex-col items-center justify-center rounded-2xl bg-white/80 backdrop-blur border border-white/60 ' +
    'shadow-sm hover:shadow-md hover:-translate-y-[1px] transition-all'

  const pad = compact ? 'p-2' : 'p-3'
  const icon = compact ? 'w-5 h-5' : 'w-6 h-6'
  const text = compact ? 'text-[11px]' : 'text-xs'

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-4 gap-2">
        <AffiliateLink
          href={links.hotels}
          utmContent="hotels"
          eventData={{ destination: destination?.name, country: destination?.country }}
          className={`${btnBase} ${pad}`}
        >
          <Hotel className={`${icon} text-pink-500`} />
          <span className={`${text} mt-1 text-gray-800`}>Hotels</span>
        </AffiliateLink>

        <AffiliateLink
          href={links.flights}
          utmContent="flights"
          eventData={{ destination: destination?.name, country: destination?.country }}
          className={`${btnBase} ${pad}`}
        >
          <Plane className={`${icon} text-pink-500`} />
          <span className={`${text} mt-1 text-gray-800`}>Flights</span>
        </AffiliateLink>

        <AffiliateLink
          href={links.tours}
          utmContent="tours"
          eventData={{ destination: destination?.name, country: destination?.country }}
          className={`${btnBase} ${pad}`}
        >
          <Map className={`${icon} text-pink-500`} />
          <span className={`${text} mt-1 text-gray-800`}>Tours</span>
        </AffiliateLink>

        <AffiliateLink
          href={links.insurance}
          utmContent="insurance"
          eventData={{ destination: destination?.name, country: destination?.country }}
          className={`${btnBase} ${pad}`}
        >
          <Shield className={`${icon} text-pink-500`} />
          <span className={`${text} mt-1 text-gray-800`}>Insurance</span>
        </AffiliateLink>
      </div>

      <p className="text-[11px] text-gray-500 text-center">
        Disclosure: If you book through these links, we may earn a small commission at no extra cost to you. 💗
      </p>
    </div>
  )
}
