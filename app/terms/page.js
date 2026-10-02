import TrustPage from '@/components/layout/TrustPage'
import { pageMetadata } from '@/lib/metadata'
export const metadata = pageMetadata(
  'Terms of Use',
  'Terms for AI planning and external booking searches.',
  '/terms'
)
export default function Terms() {
  return (
    <TrustPage title="Terms of Use">
      <h2>Planning assistance</h2>
      <p>
        FeminTravel provides AI suggestions, curated notes and general planning checklists.
        Information may be incomplete, inaccurate or out of date. An itinerary is a starting point
        to review, not a booking or a guarantee.
      </p>
      <h2>Verify before traveling</h2>
      <p>
        Check entry and visa requirements with official immigration sources for your passport. Check
        current advisories, weather, health rules, transport schedules and local conditions with
        official sources. Our guidance does not provide an objective safety rating.
      </p>
      <h2>External providers</h2>
      <p>
        Booking searches open third-party websites. Providers control prices, availability, payment,
        cancellation and insurance terms. Review their terms and coverage before buying. Some
        configured links may earn FeminTravel a commission and are labelled accordingly.
      </p>
      <h2>Your choices and saved links</h2>
      <p>
        You remain responsible for evaluating recommendations against your needs. Do not submit
        sensitive identity or payment information. Anyone with a saved-trip link can view that plan
        until it expires; share it with care.
      </p>
      <h2>Reasonable use</h2>
      <p>
        Do not automate excessive requests or submit harmful or unlawful content. We limit requests
        to protect availability and may disable integrations when they are unavailable. Use the
        Contact page for available support methods.
      </p>
    </TrustPage>
  )
}
