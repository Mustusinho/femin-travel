'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Menu, X, Globe as GlobeIcon, BookOpen, Gift, Send, MessageCircle,
  Shield, Sparkles, MapPin, Heart, ChevronRight, Mail,
  CheckCircle, DollarSign, ArrowRight, Users,
} from 'lucide-react'

// ─── Header ──────────────────────────────────────────────────────────────────

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isMenuOpen])

  const close = () => setIsMenuOpen(false)

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 md:h-20 px-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">✈️</span>
            <span className="font-['Playfair_Display'] text-xl md:text-2xl font-bold text-gradient">
              FeminTravel
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7">
            <Link href="/globe" className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-[hsl(346,74%,55%)] transition-colors">
              <GlobeIcon className="w-4 h-4" /> Explore Globe
            </Link>
            <Link href="/blog" className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-[hsl(346,74%,55%)] transition-colors">
              <BookOpen className="w-4 h-4" /> Blog
            </Link>
            <Link href="/contact" className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-[hsl(346,74%,55%)] transition-colors">
              <Mail className="w-4 h-4" /> Contact
            </Link>
            <a href="#free-kit" className="btn-primary text-sm py-2.5 px-5">
              <Gift className="w-3.5 h-3.5 inline mr-1.5" />
              Get Free Kit
            </a>
          </nav>

          <button
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {isMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-50 md:hidden"
            onClick={close}
            aria-hidden="true"
          />
          <div className="fixed top-0 right-0 h-full w-72 bg-white z-50 shadow-2xl md:hidden flex flex-col">
            <div className="flex items-center justify-between px-5 h-16 border-b border-gray-100">
              <span className="font-['Playfair_Display'] font-bold text-gradient text-lg">FeminTravel</span>
              <button
                onClick={close}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                aria-label="Close menu"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
              {[
                { href: '/globe', label: 'Explore Globe', Icon: GlobeIcon },
                { href: '/blog', label: 'Blog', Icon: BookOpen },
                { href: '/contact', label: 'Contact', Icon: Mail },
              ].map(({ href, label, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={close}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[hsl(346,74%,96%)] transition-colors"
                >
                  <Icon className="w-5 h-5 text-[hsl(346,74%,58%)]" />
                  <span className="font-medium text-gray-800">{label}</span>
                </Link>
              ))}
              <a
                href="#free-kit"
                onClick={close}
                className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[hsl(346,74%,96%)] transition-colors"
              >
                <Gift className="w-5 h-5 text-[hsl(346,74%,58%)]" />
                <span className="font-medium text-gray-800">Free Kit</span>
              </a>
            </nav>

            <div className="p-4 border-t border-gray-100">
              <a href="#free-kit" onClick={close} className="btn-primary block text-center w-full">
                Get Free Kit
              </a>
            </div>
          </div>
        </>
      )}
    </>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="relative bg-gradient-femin pt-16">
      <div className="max-w-4xl mx-auto px-4 pt-14 pb-14 md:pt-20 md:pb-16 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur border border-white/80 rounded-full px-3 py-1.5 text-xs font-medium text-gray-500 mb-6">
          <Sparkles className="w-3.5 h-3.5 text-[hsl(346,74%,60%)]" />
          Safety-first AI travel intelligence
        </div>

        <h1 className="font-['Playfair_Display'] text-4xl sm:text-5xl md:text-6xl font-bold leading-tight text-gray-900 mb-5">
          AI travel intelligence{' '}
          <span className="text-gradient">for safer, smarter</span>{' '}
          solo trips.
        </h1>

        <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto mb-3 leading-relaxed">
          Explore destinations, get practical safety briefs, budget guidance, packing tips, and local travel advice before you go.
        </p>

        <p className="text-sm text-gray-400 mb-8">
          Built for solo female travelers, first-time solo trips, friends, and safety-conscious explorers.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/globe" className="btn-primary text-base py-3.5 px-8">
            <GlobeIcon className="w-5 h-5 inline mr-2" />
            Explore the Globe
          </Link>
          <a href="#free-kit" className="btn-secondary text-base py-3.5 px-8">
            <Gift className="w-5 h-5 inline mr-2" />
            Get Free Travel Kit
          </a>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent" />
    </section>
  )
}

// ─── Travel Intelligence Preview ──────────────────────────────────────────────

function TravelIntelligencePreview() {
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="font-['Playfair_Display'] text-2xl md:text-3xl font-bold mb-2">
            See what you get before you go
          </h2>
          <p className="text-gray-400 text-sm">Live example — Lisbon, Portugal.</p>
        </div>

        <div className="rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
          {/* Card header */}
          <div className="bg-gradient-to-r from-[hsl(346,74%,90%)] to-[hsl(270,50%,90%)] px-5 py-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-white/70 flex items-center justify-center text-2xl shadow-sm">
                  🇵🇹
                </div>
                <div>
                  <p className="font-['Playfair_Display'] font-bold text-gray-900 text-lg leading-tight">Lisbon</p>
                  <p className="text-xs text-gray-500">Portugal · Example brief</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-white/70 rounded-full px-3 py-1 text-xs font-semibold text-[hsl(346,74%,45%)] shadow-sm">
                <Sparkles className="w-3 h-3" />
                AI Intelligence
              </div>
            </div>

            {/* 3 quick badges */}
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1.5 bg-green-100 text-green-700 rounded-full px-3 py-1 text-xs font-semibold">
                <CheckCircle className="w-3.5 h-3.5" />
                Solo confidence: Good
              </div>
              <div className="flex items-center gap-1.5 bg-white/70 text-gray-700 rounded-full px-3 py-1 text-xs font-medium">
                <DollarSign className="w-3.5 h-3.5" />
                €65–€120 / day
              </div>
              <div className="flex items-center gap-1.5 bg-white/70 text-gray-700 rounded-full px-3 py-1 text-xs font-medium">
                <MapPin className="w-3.5 h-3.5" />
                Chiado / Baixa
              </div>
            </div>
          </div>

          {/* 3 intelligence cards */}
          <div className="grid sm:grid-cols-3 gap-px bg-gray-100">
            <div className="bg-white px-4 py-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-[hsl(346,74%,94%)] flex items-center justify-center">
                  <MapPin className="w-3.5 h-3.5 text-[hsl(346,74%,55%)]" />
                </div>
                <p className="text-xs font-semibold text-gray-900 uppercase tracking-wide">Arrival plan</p>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Arrive in daylight when possible. Metro or official taxi from airport — skip informal offers.
              </p>
            </div>

            <div className="bg-white px-4 py-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Shield className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <p className="text-xs font-semibold text-gray-900 uppercase tracking-wide">Watch-outs</p>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Pickpockets on crowded tram routes. Keep bag in front, stay aware in Alfama alleys.
              </p>
            </div>

            <div className="bg-white px-4 py-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center">
                  <CheckCircle className="w-3.5 h-3.5 text-purple-500" />
                </div>
                <p className="text-xs font-semibold text-gray-900 uppercase tracking-wide">Smart checklist</p>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Offline maps, backup card, eSIM, hotel address saved. Metro day pass = best value.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
            <Link
              href="/globe"
              className="btn-primary flex items-center justify-center gap-2 w-full py-3"
            >
              Generate my brief
              <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-center text-xs text-gray-400 mt-2">
              Any city worldwide — tap the globe or search by name
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Why FeminTravel ──────────────────────────────────────────────────────────

const whyCards = [
  {
    Icon: Shield,
    title: 'Safety-first briefs',
    body: 'Practical arrival, transport, neighborhood, and scam-awareness guidance — without fear-mongering.',
  },
  {
    Icon: Sparkles,
    title: 'AI trip intelligence',
    body: 'Budget, packing, local customs, itinerary ideas, and travel style — all in one AI-generated brief.',
  },
  {
    Icon: Users,
    title: 'Built for real travelers',
    body: 'Helpful for solo women, friends, first-time solo travelers, and safety-conscious explorers of all backgrounds.',
  },
]

function WhySection() {
  return (
    <section className="py-12 md:py-16 bg-gradient-femin">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="font-['Playfair_Display'] text-2xl md:text-3xl font-bold text-center mb-1">
          Why <span className="text-gradient">FeminTravel</span>
        </h2>
        <p className="text-gray-500 text-sm text-center mb-8">Travel smarter, not just safer.</p>

        <div className="grid gap-3 md:grid-cols-3">
          {whyCards.map(({ Icon, title, body }, i) => (
            <div key={i} className="flex items-start gap-3 bg-white rounded-2xl p-4 shadow-sm">
              <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-[hsl(346,74%,93%)] flex items-center justify-center">
                <Icon className="w-5 h-5 text-[hsl(346,74%,55%)]" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-900 mb-1">{title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── How It Works ─────────────────────────────────────────────────────────────

const steps = [
  {
    n: '01',
    title: 'Choose a destination',
    desc: 'Tap the globe, search any city, or pick from our featured destinations.',
  },
  {
    n: '02',
    title: 'Get an AI safety brief',
    desc: 'Practical safety tips, budget ranges, packing suggestions, and local tips in seconds.',
  },
  {
    n: '03',
    title: 'Plan smarter',
    desc: 'Use your checklist, find the right neighborhoods, and book with confidence.',
  },
]

function HowItWorks() {
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="font-['Playfair_Display'] text-2xl md:text-3xl font-bold text-center mb-1">
          How it works
        </h2>
        <p className="text-gray-500 text-sm text-center mb-8">Three steps to a smarter trip.</p>

        <div className="grid gap-4 md:grid-cols-3">
          {steps.map(({ n, title, desc }, i) => (
            <div
              key={i}
              className="relative flex gap-4 p-4 rounded-2xl bg-[hsl(30,33%,98%)] border border-gray-100"
            >
              <span className="font-['Playfair_Display'] text-4xl font-bold text-[hsl(346,74%,88%)] leading-none flex-shrink-0 mt-0.5">
                {n}
              </span>
              <div>
                <h3 className="font-semibold text-sm text-gray-900 mb-1">{title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
              {i < steps.length - 1 && (
                <ChevronRight className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 text-[hsl(346,74%,80%)] z-10" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Featured Destinations ────────────────────────────────────────────────────

const destinations = [
  { name: 'Tokyo', country: 'Japan', slug: 'tokyo', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600' },
  { name: 'Paris', country: 'France', slug: 'paris', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600' },
  { name: 'Lisbon', country: 'Portugal', slug: 'lisbon', image: 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=600' },
  { name: 'Bali', country: 'Indonesia', slug: 'bali', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600' },
  { name: 'Barcelona', country: 'Spain', slug: 'barcelona', image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600' },
  { name: 'Cape Town', country: 'South Africa', slug: 'cape-town', image: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=600' },
]

function FeaturedDestinations() {
  const router = useRouter()

  return (
    <section className="py-12 md:py-16 bg-[hsl(30,33%,98%)]">
      <div className="max-w-6xl mx-auto">
        <div className="px-4 mb-6">
          <h2 className="font-['Playfair_Display'] text-2xl md:text-3xl font-bold mb-1">
            Start with a destination
          </h2>
          <p className="text-gray-500 text-sm">
            Tap a city to open it on the globe and generate your travel brief.
          </p>
        </div>

        {/* Mobile: horizontal scroll | Desktop: grid */}
        <div
          className="flex gap-3 overflow-x-auto no-scrollbar pb-2 px-4 snap-x snap-mandatory
                      md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-visible md:pb-0 md:gap-5 md:px-4"
        >
          {destinations.map((dest) => (
            <button
              key={dest.slug}
              onClick={() => router.push(`/globe?focus=${dest.slug}`)}
              aria-label={`View travel brief for ${dest.name}, ${dest.country}`}
              className="flex-none w-[200px] snap-start md:w-auto group relative overflow-hidden rounded-2xl
                         aspect-[3/2] md:aspect-[4/3] cursor-pointer"
            >
              <img
                src={dest.image}
                alt={dest.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 text-left">
                <p className="font-['Playfair_Display'] font-bold text-white text-sm md:text-lg leading-tight">
                  {dest.name}
                </p>
                <p className="text-white/75 text-xs mb-1.5">{dest.country}</p>
                <span
                  className="inline-flex items-center gap-1 text-xs text-white bg-white/20 backdrop-blur-sm
                             rounded-full px-2 py-0.5 group-hover:bg-[hsl(346,74%,68%)] transition-colors"
                >
                  <MapPin className="w-3 h-3" /> View brief
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Lead Magnet ──────────────────────────────────────────────────────────────

function LeadMagnetSection() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      })
      if (res.ok) {
        router.push('/free-kit')
      } else {
        const data = await res.json()
        setError(data.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setError('Connection error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section
      id="free-kit"
      className="py-12 md:py-16 bg-gradient-to-br from-[hsl(346,74%,92%)] via-[hsl(300,40%,96%)] to-[hsl(270,50%,92%)]"
    >
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-[hsl(346,74%,88%)] to-[hsl(270,50%,88%)] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Gift className="w-6 h-6 text-[hsl(346,74%,45%)]" />
            </div>
            <h2 className="font-['Playfair_Display'] text-2xl font-bold mb-2">
              Get the free solo travel kit
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              Packing checklist, safety planning notes, and budget prep for your next trip.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="input-femin"
            />
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-femin"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full py-3.5 text-base disabled:opacity-50"
            >
              {isSubmitting ? 'Sending…' : 'Send My Free Kit'}
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-3">No spam. Unsubscribe anytime.</p>
        </div>
      </div>
    </section>
  )
}

// ─── Blog CTA ─────────────────────────────────────────────────────────────────

function BlogCTA() {
  return (
    <section className="py-10 bg-white border-t border-gray-100">
      <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-['Playfair_Display'] font-semibold text-lg text-gray-900 mb-1">
            Travel safety guides &amp; tips
          </p>
          <p className="text-gray-500 text-sm">Packing, budgeting, safety, and more.</p>
        </div>
        <Link href="/blog" className="btn-secondary flex items-center gap-2 flex-shrink-0 whitespace-nowrap">
          <BookOpen className="w-4 h-4" />
          Read the Blog
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">✈️</span>
              <span className="font-['Playfair_Display'] text-xl font-bold">FeminTravel</span>
            </div>
            <p className="text-gray-400 text-sm max-w-xs leading-relaxed">
              AI travel intelligence for safer, smarter solo trips. Practical briefs for every destination.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/globe" className="text-gray-400 hover:text-white transition-colors">Globe</Link></li>
              <li><Link href="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
              <li><a href="#free-kit" className="text-gray-400 hover:text-white transition-colors">Free Kit</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy</Link></li>
              <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-gray-500 text-sm">
            © 2026 FeminTravel. Made with{' '}
            <Heart className="w-3.5 h-3.5 inline text-[hsl(346,74%,65%)]" />{' '}
            for solo travelers.
          </p>
          <a href="mailto:hello@femintravel.com" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
            hello@femintravel.com
          </a>
        </div>
      </div>
    </footer>
  )
}

// ─── Chat Widget ──────────────────────────────────────────────────────────────

function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const quickSuggestions = ['Is it safe?', 'What to pack?', 'Budget tips?', 'Best time to visit?']

  const sendMessage = async (text) => {
    if (!text.trim()) return
    const userMessage = { role: 'user', content: text }
    const nextMessages = [...messages, userMessage]
    setMessages(nextMessages)
    setInput('')
    setIsLoading(true)
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages }),
      })
      const data = await res.json()
      setMessages((prev) => [...prev, { role: 'assistant', content: data.response }])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "I'm having trouble connecting. Please try again!" },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-label="Open travel assistant"
        className="fixed bottom-5 right-4 md:bottom-6 md:right-6 z-50
                   w-12 h-12 md:w-14 md:h-14
                   bg-gradient-to-r from-[hsl(346,74%,72%)] to-[hsl(270,50%,72%)]
                   rounded-full shadow-lg flex items-center justify-center
                   hover:scale-110 transition-transform"
      >
        {isOpen
          ? <X className="w-5 h-5 md:w-6 md:h-6 text-white" />
          : <MessageCircle className="w-5 h-5 md:w-6 md:h-6 text-white" />}
      </button>

      {isOpen && (
        <div
          className="fixed bottom-20 right-4 md:bottom-24 md:right-6 z-50
                     w-[calc(100vw-32px)] max-w-[340px]
                     bg-white rounded-3xl shadow-2xl max-h-[65vh] flex flex-col overflow-hidden"
        >
          <div className="bg-gradient-to-r from-[hsl(346,74%,88%)] to-[hsl(270,50%,88%)] px-4 py-3">
            <h3 className="font-['Playfair_Display'] font-semibold text-base text-gray-800">Travel Assistant</h3>
            <p className="text-xs text-gray-500 mt-0.5">Ask about destinations, safety, or packing!</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[140px] max-h-[240px]">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 py-5">
                <Sparkles className="w-7 h-7 mx-auto mb-2 text-[hsl(346,74%,72%)]" />
                <p className="text-xs">Ask about any destination, safety tips, or packing.</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[82%] px-3 py-2 text-sm rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-[hsl(346,74%,88%)] text-[hsl(346,74%,25%)] rounded-br-sm'
                      : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-3 py-2 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1">
                    {[0, 0.1, 0.2].map((delay, i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${delay}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {messages.length === 0 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {quickSuggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s)}
                  className="text-xs px-2.5 py-1.5 bg-[hsl(346,74%,95%)] text-[hsl(346,74%,45%)] rounded-full hover:bg-[hsl(346,74%,90%)] transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="p-3 border-t border-gray-100">
            <form
              onSubmit={(e) => { e.preventDefault(); sendMessage(input) }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything…"
                disabled={isLoading}
                className="flex-1 px-3 py-2 rounded-full border-2 border-gray-200 focus:border-[hsl(346,74%,72%)] focus:outline-none text-sm"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="w-9 h-9 bg-[hsl(346,74%,72%)] rounded-full flex items-center justify-center hover:bg-[hsl(346,74%,60%)] transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <TravelIntelligencePreview />
      <WhySection />
      <HowItWorks />
      <FeaturedDestinations />
      <LeadMagnetSection />
      <BlogCTA />
      <Footer />
      <ChatWidget />
    </main>
  )
}
