import TrustPage from '@/components/layout/TrustPage'
import { pageMetadata } from '@/lib/metadata'
export const metadata = pageMetadata(
  'Storage & Cookies',
  'Browser storage and optional first-party measurement.',
  '/cookies'
)
export default function Cookies() {
  return (
    <TrustPage title="Storage & cookies">
      <p>
        FeminTravel does not load advertising trackers or third-party analytics scripts. No optional
        analytics or marketing cookies are set by this application. We therefore do not display a
        cookie consent banner.
      </p>
      <p>
        The planner uses session storage to preserve your draft on this browser tab. Globe briefs
        and location lookups use local storage with a freshness limit. You can clear these through
        your browser settings; the planner also offers a Clear draft action. Free-kit checkboxes are
        not saved.
      </p>
      <p>
        If enabled by the site owner, first-party product events record limited actions such as trip
        generation and outbound search clicks. They do not include names, email addresses or full
        trip preferences. This is separate from hashed request identifiers used to limit abuse.
      </p>
      <p>
        External booking websites have their own cookies and privacy practices after you follow a
        link. A future optional tracker requires an updated policy and working consent controls
        before it is loaded.
      </p>
    </TrustPage>
  )
}
