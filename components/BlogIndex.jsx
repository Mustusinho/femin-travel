'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
export default function BlogIndex({ posts }) {
  const [query, setQuery] = useState(''),
    [category, setCategory] = useState('All')
  const filtered = posts.filter(
    (p) =>
      (category === 'All' || p.category === category) &&
      `${p.title} ${p.excerpt}`.toLowerCase().includes(query.toLowerCase())
  )
  return (
    <>
      <div className="flex flex-wrap gap-4 mb-8 items-end">
        <label className="field-label flex-1 min-w-[200px]">
          Search guides
          <input
            type="search"
            maxLength={120}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input-femin"
          />
        </label>
        <label className="field-label">
          Category
          <select
            className="input-femin"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {['All', 'Safety', 'Packing', 'Budget'].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="destination-grid">
        {filtered.map((p) => (
          <article key={p.slug} className="destination-card">
            <Link href={`/blog/${p.slug}`}>
              <div className="destination-image">
                <Image
                  src={p.image}
                  alt={`${p.category} travel preparation`}
                  fill
                  sizes="(max-width:600px) 90vw, (max-width:900px) 45vw, 360px"
                  className="object-cover"
                />
              </div>
              <div className="destination-copy">
                <p className="eyebrow">{p.category}</p>
                <h2 className="text-2xl my-3">{p.title}</h2>
                <p>{p.excerpt}</p>
                <p className="text-xs mt-5 text-gray-600">
                  FeminTravel · Updated{' '}
                  <time dateTime={p.updatedAt}>
                    {new Date(p.updatedAt).toLocaleDateString('en-GB')}
                  </time>
                </p>
              </div>
            </Link>
          </article>
        ))}
      </div>
      {!filtered.length && <p role="status">No guides match. Try another search.</p>}
    </>
  )
}
