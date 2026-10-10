'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
const links = [
  ['Explore Globe', '/globe'],
  ['Destinations', '/destinations'],
  ['Travel Guides', '/blog'],
  ['Free Kit', '/free-kit'],
  ['About', '/about'],
  ['Contact', '/contact']
]
export default function Header() {
  const [open, setOpen] = useState(false),
    path = usePathname(),
    button = useRef(null)
  useEffect(() => setOpen(false), [path])
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
        button.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])
  return (
    <header className="site-header">
      <div className="site-nav">
        <Link href="/" className="brand" aria-label="FeminTravel home">
          <span aria-hidden="true">✦</span> FeminTravel
        </Link>
        <span className="brand-line">Explore with intention</span>
        <nav aria-label="Main navigation" className="desktop-nav">
          {links.slice(0, 4).map(([label, href]) => (
            <Link key={href} href={href} aria-current={path === href ? 'page' : undefined}>
              {label}
            </Link>
          ))}
        </nav>
        <Link
          href="/plan"
          className="btn-primary nav-cta"
          aria-current={path === '/plan' ? 'page' : undefined}
        >
          Build my trip →
        </Link>
        <button
          ref={button}
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="mobile-navigation"
          onClick={() => setOpen(!open)}
        >
          {open ? 'Close' : 'Menu'}
        </button>
      </div>
      {open && (
        <nav id="mobile-navigation" aria-label="Mobile navigation" className="mobile-nav">
          {links.map(([label, href]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}>
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}
