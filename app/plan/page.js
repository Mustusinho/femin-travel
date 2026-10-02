import Planner from '@/components/planner/Planner'
import { pageMetadata } from '@/lib/metadata'
export const metadata = {
  ...pageMetadata(
    'Plan My Trip',
    'Create an itinerary around your dates, interests and practical safety preferences.',
    '/plan'
  ),
  robots: { index: false, follow: true }
}
export default async function Plan({ searchParams }) {
  searchParams = await searchParams
  return (
    <main id="main-content" className="page-shell">
      <Planner initialDestination={searchParams.destination || ''} />
    </main>
  )
}
