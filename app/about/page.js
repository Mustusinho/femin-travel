import Link from 'next/link'
import TrustPage from '@/components/layout/TrustPage'
import { pageMetadata } from '@/lib/metadata'
export const metadata = pageMetadata(
  'About FeminTravel',
  'Thoughtful AI planning for women and friends.',
  '/about'
)
export default function About() {
  return (
    <TrustPage
      title="A more thoughtful way to plan"
      intro="FeminTravel helps women and friends turn a trip idea into a practical plan."
    >
      <h2>From inspiration to preparation</h2>
      <p>
        Choose your destination, dates, pace and priorities. Build an itinerary alongside arrival
        arrangements, accommodation considerations, packing and budget preparation. The globe and
        guides help you explore; the planner brings your choices together.
      </p>
      <h2>How AI fits in</h2>
      <p>
        When configured, AI suggests an itinerary using your preferences. It can make mistakes and
        does not check live availability or current travel rules. If AI is unavailable, you receive
        a clearly labelled planning checklist. Neither is a safety rating.
      </p>
      <h2>Recommendations with context</h2>
      <p>
        Curated destination notes provide starting points for research. Consider recent traveler
        reviews, official tourism resources and your individual needs before making decisions. No
        area or activity is guaranteed safe.
      </p>
      <h2>Commercial transparency</h2>
      <p>
        Booking searches open on external providers. Affiliate links appear only when configured and
        are labelled. Providers control prices, availability and booking terms.
      </p>
      <Link href="/plan" className="btn-primary inline-block">
        Plan My Trip
      </Link>
    </TrustPage>
  )
}
