import { destinations } from '@/lib/destinations'
import DestinationCard from '@/components/DestinationCard'
import { pageMetadata } from '@/lib/metadata'
export const metadata = pageMetadata(
  'Explore destinations',
  'Curated starting points for thoughtful travel planning.',
  '/destinations'
)
export default function Destinations() {
  return (
    <main id="main-content" className="page-shell">
      <p className="eyebrow">Find your starting point</p>
      <h1>Where will your next chapter begin?</h1>
      <p className="page-intro">
        Six curated destination introductions. Explore the practical questions worth asking, then
        build a trip around your choices.
      </p>
      <div className="destination-grid">
        {destinations.map((d) => (
          <DestinationCard key={d.slug} destination={d} />
        ))}
      </div>
    </main>
  )
}
