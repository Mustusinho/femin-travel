import Link from 'next/link'
import Image from 'next/image'
import { destinations } from '@/lib/destinations'
import DestinationCard from '@/components/DestinationCard'
import LeadCapture from '@/components/LeadCapture'
import { pageMetadata } from '@/lib/metadata'
export const metadata = pageMetadata(
  'Thoughtful trips, beautifully planned',
  'Choose a destination, build a trip around your own pace, and prepare for your arrival.',
  '/'
)
export default function Home() {
  return (
    <main id="main-content">
      <section className="home-hero">
        <div>
          <p className="eyebrow">For women and friends, wherever you’re headed</p>
          <h1>
            Somewhere in mind?
            <br />
            <span>Let’s make it a journey.</span>
          </h1>
          <p>
            Start with a place you love, or pick a point on the globe. Shape the days, plan your
            arrival and take the practical details with you.
          </p>
          <form action="/plan" method="get" className="destination-start">
            <label htmlFor="home-destination">Where would you like to go?</label>
            <div className="destination-start-row">
              <input
                id="home-destination"
                name="destination"
                type="text"
                maxLength={120}
                placeholder="A city or place, anywhere in the world"
                autoComplete="off"
                required
              />
              <button type="submit" className="btn-primary">
                Plan my trip →
              </button>
            </div>
          </form>
          <div className="hero-explore">
            <span>Still deciding?</span>
            <Link href="/globe" className="btn-secondary">
              Explore the globe →
            </Link>
            <Link href="/free-kit" className="hero-kit-link">
              Get the free travel kit
            </Link>
          </div>
          <p className="hero-note">
            Your plan is a starting point. Check current details before booking.
          </p>
        </div>
        <div className="hero-editorial">
          <div className="hero-photo">
            <Image
              src={destinations.find((d) => d.slug === 'lisbon').image}
              alt="Lisbon rooftops and city scenery"
              fill
              priority
              sizes="(max-width:900px) 90vw, 560px"
              className="object-cover"
            />
          </div>
          <div className="hero-caption">
            <p className="eyebrow">A good journey starts before arrival</p>
            <p>
              One place in mind.
              <br />A whole trip to make yours.
            </p>
            <Link href="/plan?destination=Lisbon">Plan a Lisbon trip →</Link>
          </div>
        </div>
      </section>
      <section className="home-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">From idea to itinerary</p>
            <h2>A plan that makes sense for you.</h2>
          </div>
          <p>
            Choose your dates, companions, pace and interests. Keep the practical details beside the
            inspiring ones.
          </p>
        </div>
        <div className="how-grid">
          {[
            [
              '01',
              'Choose your place',
              'Type any destination or discover one on the globe. Then add dates, pace and what matters to you.'
            ],
            [
              '02',
              'Make the days yours',
              'Build an itinerary when AI is available, or a clearly labelled preparation checklist shaped by your choices.'
            ],
            [
              '03',
              'Take your plan along',
              'Print or save your plan as a PDF. Check current details and provider options before booking.'
            ]
          ].map(([n, title, copy]) => (
            <article key={n}>
              <span>{n}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="home-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">A few places to begin</p>
            <h2>Find a destination that draws you in.</h2>
          </div>
          <Link href="/destinations" className="underline text-sm">
            All destinations →
          </Link>
        </div>
        <div className="destination-grid">
          {destinations.slice(0, 3).map((d) => (
            <DestinationCard key={d.slug} destination={d} />
          ))}
        </div>
      </section>
      <section className="home-section">
        <div className="methodology">
          <div>
            <p className="eyebrow">Confidence comes from preparation</p>
            <h2>
              Helpful guidance.
              <br />
              Honest boundaries.
            </h2>
            <Link href="/about" className="underline inline-block mt-5">
              How FeminTravel works →
            </Link>
          </div>
          <div>
            {[
              [
                'AI, with context',
                'Suggestions reflect your choices. They can be incomplete and are not verified local intelligence.'
              ],
              [
                'Safety, without a score',
                'Arrival arrangements, transport choices and practical checklists help you prepare. We don’t rate your safety.'
              ],
              [
                'Check what changes',
                'Visa rules, advisories, prices and availability need current official checks.'
              ],
              [
                'Clear commercial links',
                'Provider searches and configured affiliate links are labelled. A click is never described as a booking.'
              ]
            ].map(([title, copy]) => (
              <article key={title}>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="home-section">
        <LeadCapture />
      </section>
      <section className="home-section">
        <div className="guide-promo">
          <div>
            <p className="eyebrow">Travel guides</p>
            <h2>Small details. Better prepared trips.</h2>
            <p>Practical reading on arrival planning, packing and budgets.</p>
          </div>
          <Link href="/blog" className="btn-secondary">
            Read the guides
          </Link>
        </div>
      </section>
      <section className="home-final">
        <p className="eyebrow">Start with the trip you have in mind</p>
        <h2>Your next journey, thoughtfully planned.</h2>
        <Link href="/plan" className="btn-primary inline-block mt-6">
          Plan My Trip
        </Link>
      </section>
    </main>
  )
}
