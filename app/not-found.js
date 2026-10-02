import Link from 'next/link'
export default function NotFound() {
  return (
    <main id="main-content" className="page-shell narrow text-center">
      <p className="eyebrow">A small detour</p>
      <h1>We couldn’t find that page</h1>
      <p className="page-intro">Your next trip can still start here.</p>
      <Link href="/plan" className="btn-primary inline-block">
        Plan My Trip
      </Link>
      <Link href="/destinations" className="block mt-6">
        Explore destinations
      </Link>
    </main>
  )
}
