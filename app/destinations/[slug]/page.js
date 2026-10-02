import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { destinations } from '@/lib/destinations'
import { pageMetadata } from '@/lib/metadata'
import BookingCTAs from '@/components/BookingCTAs'
export function generateStaticParams() {
  return destinations.map((d) => ({ slug: d.slug }))
}
export async function generateMetadata({ params }) {
  params = await params
  const d = destinations.find((d) => d.slug === params.slug)
  return d
    ? pageMetadata(`${d.name} travel planning`, d.lead, `/destinations/${d.slug}`)
    : { title: 'Destination not found' }
}
export default async function Destination({ params }) {
  params = await params
  const d = destinations.find((d) => d.slug === params.slug)
  if (!d) notFound()
  return (
    <main id="main-content" className="page-shell">
      <nav className="text-sm mb-6" aria-label="Breadcrumb">
        <Link href="/destinations" className="underline">
          Destinations
        </Link>{' '}
        / {d.name}
      </nav>
      <div className="destination-hero">
        <div>
          <p className="eyebrow">{d.country} · Curated planning notes</p>
          <h1>{d.name}, at your pace.</h1>
          <p className="page-intro">{d.lead}</p>
          <Link
            href={`/plan?destination=${encodeURIComponent(d.name)}`}
            className="btn-primary inline-block"
          >
            Plan this trip
          </Link>
          <Link href={`/globe?focus=${d.slug}`} className="block underline mt-5 text-sm">
            Find {d.name} on the globe
          </Link>
        </div>
        <div className="relative aspect-[4/3] rounded-3xl overflow-hidden">
          <Image
            src={d.image}
            alt={`${d.name}, ${d.country}`}
            fill
            sizes="(max-width:900px) 90vw, 540px"
            priority
            className="object-cover"
          />
        </div>
      </div>
      <div className="result-sections">
        <section className="result-section">
          <h2>Areas to research</h2>
          <ul>
            {d.areas.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
          <p>
            These are starting points, not safety ratings. Check recent reviews and your individual
            needs.
          </p>
        </section>
        <section className="result-section">
          <h2>Make time for</h2>
          <ul>
            {d.experiences.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </section>
        <section className="result-section">
          <h2>Arrival preparation</h2>
          <p>{d.arrival}</p>
        </section>
        <section className="result-section">
          <h2>Planning considerations</h2>
          <ul>
            {d.considerations.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </section>
      </div>
      <section className="result-section mt-6">
        <h2>Before you book</h2>
        <p>
          Choose dates after comparing seasonal conditions and your priorities. These notes do not
          contain live weather, visa advice, fares or availability. Check official entry
          requirements for your passport and current travel advisories.
        </p>
        <a
          href={d.source}
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-sm inline-block mt-4"
        >
          Explore the official tourism resource ↗
        </a>
        <p className="text-xs text-gray-600 mt-2">
          Resource for further research; no current-information verification is implied.
        </p>
      </section>
      <section className="result-section mt-6">
        <h2>Explore booking options</h2>
        <BookingCTAs destination={d} placement="destination" />
      </section>
    </main>
  )
}
