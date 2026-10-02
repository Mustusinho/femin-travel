import { readConfig } from '@/lib/config.mjs'
import { destinations } from '@/lib/destinations'
import { blogPosts } from '@/lib/db/data'
export default function sitemap() {
  const c = readConfig()
  if (!c.indexable || !c.appUrl) return []
  const paths = [
    '/',
    '/about',
    '/contact',
    '/destinations',
    '/globe',
    '/blog',
    '/free-kit',
    '/privacy',
    '/terms',
    '/affiliate-disclosure',
    '/cookies',
    '/accessibility',
    ...destinations.map((d) => `/destinations/${d.slug}`),
    ...blogPosts.map((p) => `/blog/${p.slug}`)
  ]
  return paths.map((path) => ({ url: new URL(path, c.appUrl).toString() }))
}
