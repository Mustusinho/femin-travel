import TrustPage from '@/components/layout/TrustPage'
import { pageMetadata } from '@/lib/metadata'
export const metadata = pageMetadata(
  'Affiliate Disclosure',
  'How external booking links and commissions work.',
  '/affiliate-disclosure'
)
export default function Disclosure() {
  return (
    <TrustPage title="Affiliate disclosure" intro="Know where a booking link takes you.">
      <p>
        Some outbound hotel, flight, activity or insurance links may be affiliate links when a real
        commercial relationship is configured. Those links are labelled “Affiliate link”. Other
        links are ordinary provider searches.
      </p>
      <p>
        FeminTravel may earn a commission from a qualifying purchase through an affiliate link. In
        typical partner arrangements this does not add to your price; check the provider’s actual
        terms and quote.
      </p>
      <p>
        A commercial relationship does not guarantee the quality or suitability of a recommendation.
        Compare alternatives and read recent reviews. We do not represent search clicks as bookings.
      </p>
      <p>
        Third-party providers control prices, availability, cancellation terms and coverage. These
        can change. A search link is not a reservation or a live offer.
      </p>
    </TrustPage>
  )
}
