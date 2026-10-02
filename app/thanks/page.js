import Link from 'next/link'
export const metadata={title:'Free planning kit',robots:{index:false,follow:true}}
export default function Thanks(){return <main id="main-content" className="page-shell narrow"><p className="eyebrow">Preparation made simple</p><h1>Your general planning kit is here.</h1><p className="page-intro">Open the free checklists. This page does not confirm an email subscription or a saved request.</p><Link href="/free-kit" className="btn-secondary inline-block">Open Free Kit</Link><Link href="/plan" className="btn-primary inline-block ml-3">Plan My Trip</Link></main>}
