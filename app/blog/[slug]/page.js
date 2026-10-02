import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { blogPosts } from '@/lib/db/data'
import { pageMetadata } from '@/lib/metadata'
import { readConfig } from '@/lib/config.mjs'
import ShareButton from '@/components/ShareButton'
export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }))
}
export async function generateMetadata({ params }) {
  params = await params
  const p = blogPosts.find((p) => p.slug === params.slug)
  return p ? pageMetadata(p.title, p.excerpt, `/blog/${p.slug}`) : { title: 'Guide not found' }
}
export default async function Article({ params }) {
  params = await params
  const p = blogPosts.find((p) => p.slug === params.slug)
  if (!p) notFound()
  const base = readConfig().appUrl
  const schema = base
    ? {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: p.title,
        datePublished: p.publishedAt,
        dateModified: p.updatedAt,
        author: { '@type': 'Organization', name: 'FeminTravel' },
        mainEntityOfPage: new URL(`/blog/${p.slug}`, base).toString()
      }
    : null
  return (
    <main id="main-content" className="page-shell narrow">
      <nav aria-label="Breadcrumb" className="text-sm mb-6">
        <Link href="/blog" className="underline">
          Travel guides
        </Link>{' '}
        / {p.category}
      </nav>
      <p className="eyebrow">{p.category} · FeminTravel</p>
      <h1>{p.title}</h1>
      <p className="page-intro">{p.excerpt}</p>
      <p className="text-xs text-gray-600 mb-6">
        Published <time dateTime={p.publishedAt}>{p.publishedAt}</time> · Updated{' '}
        <time dateTime={p.updatedAt}>{p.updatedAt}</time>
      </p>
      <div className="relative aspect-[16/9] rounded-3xl overflow-hidden mb-8">
        <Image
          src={p.image}
          alt={`${p.category} travel preparation`}
          fill
          sizes="(max-width:820px) 90vw, 760px"
          priority
          className="object-cover"
        />
      </div>
      <article className="prose-femin">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{p.content}</ReactMarkdown>
      </article>
      <div className="planner-note mt-8">
        General preparation guidance. Verify entry rules, advisories, opening hours and prices with
        official sources.
      </div>
      <ShareButton title={p.title} />
      <Link href="/plan" className="btn-primary inline-block mt-8">
        Plan My Trip
      </Link>
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\u003c') }}
        />
      )}
    </main>
  )
}
