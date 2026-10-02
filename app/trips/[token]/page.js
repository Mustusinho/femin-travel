import SavedTrip from '@/components/planner/SavedTrip'
export const metadata={title:'Saved trip',robots:{index:false,follow:false},referrer:'no-referrer'}
export default function Trip({params}){return <main id="main-content" className="page-shell"><SavedTrip token={params.token}/></main>}
