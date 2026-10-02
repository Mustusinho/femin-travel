import BlogIndex from '@/components/BlogIndex'
import { blogPosts } from '@/lib/db/data'
import { pageMetadata } from '@/lib/metadata'
export const metadata = pageMetadata(
  'Travel guides',
  'Practical reading on arrival planning, packing and travel budgets.',
  '/blog'
)
export default function Blog() {
  return (
    <main id="main-content" className="page-shell">
      <p className="eyebrow">Before you go</p>
      <h1>Small details. Better prepared trips.</h1>
      <p className="page-intro">
        Practical guides from FeminTravel. Start here, then check current information with official
        sources for your trip.
      </p>
      <BlogIndex posts={blogPosts} />
    </main>
  )
}
