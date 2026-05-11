'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Menu, X, Globe as GlobeIcon, BookOpen, Gift, Send, MessageCircle,
  Shield, Sparkles, MapPin, Heart, ChevronRight, Mail,
  CheckCircle, DollarSign, ArrowRight, Users, Search, Luggage,
  Clock, Zap, AlertTriangle, Star,
} from 'lucide-react'

// ─── Destination Preset Data ──────────────────────────────────────────────────

const PRESETS = {
  barcelona: {
    city: 'Barcelona', country: 'Spain', flag: '🇪🇸',
    baseScore: 82,
    confidence: 'good',
    safetySummary: 'Barcelona is very well-traveled and welcoming to solo women. The main concern is petty theft in tourist areas — stay alert and keep bags in front.',
    bestAreas: ['Eixample', 'Gràcia', 'El Born'],
    cautionNotes: ['Las Ramblas pickpockets — keep phone out of sight', 'Beware distraction scams near tourist sites', 'Avoid the Gothic Quarter late at night alone'],
    budget: { budget: '€65–90/day', comfortable: '€110–160/day', luxury: '€200+/day' },
    first24Hours: ['Book airport bus or train (Aerobus or R2 Nord) — skip unofficial taxi touts', 'Check in and locate nearest metro stop', 'Walk Eixample to get oriented — wide, safe streets', 'Eat at a lunch menu near Passeig de Gràcia'],
    checklist: ['Offline map with metro lines saved', 'Anti-theft crossbody bag', 'Backup payment card', 'Download Google Translate for Catalan signs', 'Hotel address in local language'],
    packingTip: 'Light layers — summers are very hot, winters mild. Comfortable walking shoes essential for cobblestones.',
    bookFirst: ['Central hotel in Eixample (safest, most convenient)', 'Skip Hop tours for orientation', 'Sagrada Família tickets in advance'],
    slug: 'barcelona',
  },
  lisbon: {
    city: 'Lisbon', country: 'Portugal', flag: '🇵🇹',
    baseScore: 85,
    confidence: 'good',
    safetySummary: 'Lisbon is one of Europe\'s most solo-travel-friendly capitals. Genuinely safe, walkable, and affordable. Stay alert on crowded tram 28 for pickpockets.',
    bestAreas: ['Chiado', 'Baixa', 'Príncipe Real', 'Alfama (daytime)'],
    cautionNotes: ['Pickpockets on tram No. 28 and crowded viewpoints', 'Hills can be deceptive — steep and slippery when wet', 'Alfama alleys at night — stick to busier streets'],
    budget: { budget: '€55–80/day', comfortable: '€100–140/day', luxury: '€190+/day' },
    first24Hours: ['Metro or Uber from airport — avoid unofficial taxis', 'Walk from Chiado down to the waterfront', 'Grab a pastel de nata at a local café', 'Evening in Príncipe Real — safe and lively'],
    checklist: ['Offline maps downloaded', 'eSIM or local SIM set up', 'Backup payment card', 'Comfortable shoes for hills', 'Hotel address printed or saved'],
    packingTip: 'Layers even in summer — evenings get cool. Grippy-soled shoes for the steep cobbled streets.',
    bookFirst: ['Central accommodation in Chiado or Baixa', 'Day trip to Sintra (book train early)', 'Fado dinner experience'],
    slug: 'lisbon',
  },
  paris: {
    city: 'Paris', country: 'France', flag: '🇫🇷',
    baseScore: 78,
    confidence: 'good',
    safetySummary: 'Paris is very manageable for solo women with a bit of street sense. Tourist areas see scams and pickpockets. The metro is safe during the day; avoid empty carriages late at night.',
    bestAreas: ['Le Marais', '7th Arrondissement', 'Montmartre (daytime)', 'Saint-Germain-des-Prés'],
    cautionNotes: ['Friendship bracelet scams near Sacré-Cœur', 'Pickpockets on metro lines 1 and 4', 'Avoid Gare du Nord late at night', 'Northern arrondissements (18–20) need more care at night'],
    budget: { budget: '€80–110/day', comfortable: '€150–220/day', luxury: '€300+/day' },
    first24Hours: ['CDG: take RER B to city — fastest, safest', 'Check in and walk your neighborhood first', 'Evening stroll along the Seine — well-lit, lively', 'Avoid flashing phone maps at stations'],
    checklist: ['Validated transport card (Navigo)', 'Offline maps', 'Backup card', 'French phrasebook app', 'Light scarf (dress code for churches)'],
    packingTip: 'Layers year-round. Smart-casual clothing blends in better. Comfortable shoes — the city is built for walking.',
    bookFirst: ['Hotel in Le Marais or 7th for best solo safety', 'Museum pass if doing major sights', 'Day trip to Versailles (book early)'],
    slug: 'paris',
  },
  tokyo: {
    city: 'Tokyo', country: 'Japan', flag: '🇯🇵',
    baseScore: 95,
    confidence: 'good',
    safetySummary: 'Tokyo is widely considered one of the safest major cities in the world for solo women. Crime is very low. The main challenge is navigation and language — easily solved with apps.',
    bestAreas: ['Shinjuku', 'Shibuya', 'Ginza', 'Asakusa', 'Nakameguro'],
    cautionNotes: ['Chikan (groping) on crowded trains — women-only carriages available', 'Nightlife areas like Roppongi can be aggressive — use judgment', 'Always carry some cash — many places don\'t accept cards'],
    budget: { budget: '¥7,000–10,000/day (~$50–70)', comfortable: '¥15,000–25,000/day (~$100–170)', luxury: '¥40,000+/day (~$270+)' },
    first24Hours: ['Narita/Haneda: IC card or Suica from airport — use women-only carriages during rush hour', 'Set up Google Maps offline before leaving airport', 'Visit convenience store (7-Eleven, FamilyMart) — safe, cheap, essential', 'Evening walk in Shinjuku or Shibuya'],
    checklist: ['IC card (Suica/Pasmo) for transport and payments', 'Pocket wifi or SIM card', 'Cash in yen', 'Google Translate with Japanese downloaded', 'Compact umbrella'],
    packingTip: 'Pack light — laundromats everywhere. Layers essential. Remove shoes often — slip-ons help.',
    bookFirst: ['Hotel near a major metro hub (Shinjuku, Shibuya)', 'JR Pass if traveling beyond Tokyo', 'Mt. Fuji day trip reservation in advance'],
    slug: 'tokyo',
  },
  bali: {
    city: 'Bali', country: 'Indonesia', flag: '🇮🇩',
    baseScore: 74,
    confidence: 'medium',
    safetySummary: 'Bali is very popular with solo women and has a strong safety track record in its main areas. Traffic is the biggest real risk. Be selective about areas and transport.',
    bestAreas: ['Canggu (digital nomad hub)', 'Seminyak (upscale, safe)', 'Ubud (cultural, calmer)', 'Sanur (relaxed, family-friendly)'],
    cautionNotes: ['Traffic is chaotic — avoid renting scooters until experienced', 'Kuta can be loud and hassly — better alternatives exist', 'Drink only bottled or filtered water', 'Respect temple dress codes — carry a sarong'],
    budget: { budget: '$35–55/day', comfortable: '$75–120/day', luxury: '$180+/day' },
    first24Hours: ['Pre-arrange airport pickup through your accommodation', 'Don\'t use metered taxis from DPS airport — use Grab or fixed-price counters', 'First meal at a warung (local restaurant) is safe and delicious', 'Get oriented in Canggu or Seminyak before exploring further'],
    checklist: ['Sarong for temple visits', 'Reef-safe sunscreen', 'Mosquito repellent (DEET)', 'Grab app installed', 'Bottled water daily', 'Travel insurance with medical cover'],
    packingTip: 'Light cotton or linen clothing. A light rain jacket for afternoon showers. Sandals and one pair of walking shoes.',
    bookFirst: ['Accommodation with good reviews in Canggu or Ubud', 'Private driver for day trips (safer than scooter)', 'Cooking class in Ubud (popular solo activity)'],
    slug: 'bali',
  },
  rome: {
    city: 'Rome', country: 'Italy', flag: '🇮🇹',
    baseScore: 79,
    confidence: 'good',
    safetySummary: 'Rome is lively and well-traveled. Solo women are common here. The main issues are petty theft, aggressive vendors near monuments, and scooter-riding bag snatchers in some areas.',
    bestAreas: ['Trastevere', 'Prati', 'Testaccio', 'Parioli'],
    cautionNotes: ['Bag-snatching by scooters — wear bag crossbody with strap across body', 'Tourist traps near Colosseum and Trevi Fountain', 'Avoid Termini station late at night', 'Rose seller scams near monuments'],
    budget: { budget: '€65–90/day', comfortable: '€120–180/day', luxury: '€250+/day' },
    first24Hours: ['Leonardo Express from FCO to Termini is safest option', 'Walk to your accommodation if possible — orienting on foot is best', 'Evening passeggiata in Trastevere', 'Avoid street food at tourist monuments — find a side street'],
    checklist: ['Crossbody anti-theft bag', 'Offline maps', 'Comfortable walking shoes', 'Light scarf for church visits', 'Rome Pass if doing multiple museums'],
    packingTip: 'Smart-casual clothes — Romans dress up. Cover shoulders and knees for churches. Cobblestones ruin thin-soled shoes.',
    bookFirst: ['Hotel in Trastevere or Prati for best experience', 'Vatican and Colosseum tickets weeks in advance', 'Food tour in Testaccio'],
    slug: 'rome',
  },
  'new york': {
    city: 'New York', country: 'USA', flag: '🇺🇸',
    baseScore: 76,
    confidence: 'good',
    safetySummary: 'New York is very manageable for solo women. Manhattan is generally safe with normal city awareness. The subway is safe most of the day — use busier carriages at night.',
    bestAreas: ['Upper West Side', 'West Village', 'SoHo', 'Midtown (daytime)', 'Brooklyn Heights'],
    cautionNotes: ['Avoid empty subway carriages late at night', 'Stay alert around Penn Station and Port Authority at night', 'East New York and some parts of the Bronx need more care', 'Rideshares are generally safer than hailing taxis late at night'],
    budget: { budget: '$120–160/day', comfortable: '$200–300/day', luxury: '$400+/day' },
    first24Hours: ['JFK/LGA: take AirTrain + subway or Lyft — avoid unlicensed cabs', 'Get a MetroCard or tap-to-pay set up', 'Walk one neighborhood fully to orient — Central Park area is excellent', 'Dinner in West Village — safe, lively, great food'],
    checklist: ['MetroCard or contactless card', 'Offline maps', 'Backup payment card', 'Portable charger', 'Comfortable walking shoes'],
    packingTip: 'Layer heavily — city blocks create wind tunnels. Layers work year-round. Comfortable shoes: you\'ll walk 15,000+ steps/day.',
    bookFirst: ['Hotel in Midtown or Brooklyn for best value+safety', 'Museum tickets booked online', 'Broadway show if that\'s your thing — discount apps exist'],
    slug: 'new-york',
  },
  istanbul: {
    city: 'Istanbul', country: 'Turkey', flag: '🇹🇷',
    baseScore: 70,
    confidence: 'medium',
    safetySummary: 'Istanbul is a remarkable city for solo female travel with awareness. The tourist areas are well-patrolled. You\'ll get attention but genuine danger is low in main tourist zones.',
    bestAreas: ['Sultanahmet (tourist hub)', 'Beyoğlu / Galata', 'Karaköy', 'Çihangir'],
    cautionNotes: ['Carpet and tea shop touts are persistent — a firm "no" works', 'Research current FCO/State Dept advisories before travel', 'Dress more conservatively in mosque neighborhoods', 'Avoid isolated areas and political demonstrations'],
    budget: { budget: '$40–65/day', comfortable: '$80–130/day', luxury: '$200+/day' },
    first24Hours: ['Metro or Havaist bus from SAW/IST airport to city', 'Check into accommodation before exploring', 'Afternoon walk in Karaköy or Galata area', 'Evening in Beyoğlu — lively and very walkable'],
    checklist: ['Scarf for mosque visits', 'Offline maps (city can be complex)', 'Cash in Turkish lira', 'Travel insurance', 'Dress code layers'],
    packingTip: 'Modest clothing works best — you\'ll blend in and get less attention. Comfortable shoes for steep hills and cobblestones.',
    bookFirst: ['Hotel in Beyoğlu or Sultanahmet with good reviews', 'Bosphorus cruise', 'Hagia Sophia and Topkapi (free entry some periods)'],
    slug: 'istanbul',
  },
  tbilisi: {
    city: 'Tbilisi', country: 'Georgia', flag: '🇬🇪',
    baseScore: 80,
    confidence: 'good',
    safetySummary: 'Tbilisi is one of the most underrated solo travel destinations in Europe/Central Asia. Genuinely safe, very affordable, and Georgians are famously hospitable. Research the political climate before traveling.',
    bestAreas: ['Old Town', 'Vera', 'Vake', 'Saburtalo'],
    cautionNotes: ['Check current news before travel (regional instability can shift)', 'Some Old Town streets are steep and dark at night — stick to main lanes', 'Driving can be chaotic — use Yandex Go or Bolt for rides', 'Some areas outside central Tbilisi are less tourist-ready'],
    budget: { budget: '$30–50/day', comfortable: '$65–100/day', luxury: '$150+/day' },
    first24Hours: ['Bolt or pre-booked taxi from airport (avoid unmarked vehicles)', 'Walk the Old Town in daylight first', 'Try khinkali (dumplings) at a local restaurant', 'Evening walk on Shota Rustaveli Avenue'],
    checklist: ['Bolt/Yandex Go installed', 'Cash in GEL (lari)', 'Offline maps', 'Power adapter (Type C/F)', 'Light layers for variable weather'],
    packingTip: 'Layers essential — weather changes fast. Comfortable shoes for cobblestones in Old Town. A light waterproof jacket.',
    bookFirst: ['Boutique hotel in Old Town for best location', 'Day trip to Mtskheta (ancient capital)', 'Wine tour to Kakheti region'],
    slug: 'tbilisi',
  },
  london: {
    city: 'London', country: 'UK', flag: '🇬🇧',
    baseScore: 83,
    confidence: 'good',
    safetySummary: 'London is highly solo-travel-friendly and easy to navigate. English-speaking, well-organized, and with extensive late-night transport. Normal city awareness applies.',
    bestAreas: ['Covent Garden', 'Notting Hill', 'South Bank', 'Islington', 'Shoreditch'],
    cautionNotes: ['Phone theft is rising — don\'t use phone while walking', 'Some outer boroughs require more awareness at night', 'Oxford Street area can be very crowded — pickpocket risk', 'Night buses are generally safe but can be rowdy on weekends'],
    budget: { budget: '£85–110/day', comfortable: '£150–220/day', luxury: '£300+/day' },
    first24Hours: ['Heathrow: Elizabeth Line to Paddington is fastest', 'Get Oyster card or contactless tap-and-go', 'Walk along the South Bank from Tate Modern to Borough Market', 'Dinner in Covent Garden or Soho area'],
    checklist: ['Oyster card or contactless card', 'Offline maps', 'Umbrella (always)', 'Backup card', 'Comfortable walking shoes'],
    packingTip: 'Layers every day — London weather is unpredictable. A packable rain jacket is essential. Smart-casual dress code in nicer areas.',
    bookFirst: ['Central hotel in Zone 1–2 for convenience', 'Free museums (most are free!)', 'Evening theatre or West End show'],
    slug: 'london',
  },
}

const BUDGET_SCORE_MODIFIER = { budget: 0, comfortable: 3, luxury: 5 }
const TRAVELER_MODIFIER = { solo: 0, friend: 5, couple: 7 }
const CONFIDENCE_LABEL = {
  good: { text: 'Good for solo planning', color: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-500' },
  medium: { text: 'Medium — plan carefully', color: 'bg-amber-100 text-amber-800', dot: 'bg-amber-500' },
  low: { text: 'Needs extra research', color: 'bg-rose-100 text-rose-800', dot: 'bg-rose-500' },
}

function findPreset(raw) {
  if (!raw) return null
  const key = raw.trim().toLowerCase()
  if (PRESETS[key]) return PRESETS[key]
  return Object.values(PRESETS).find(
    (p) => p.city.toLowerCase() === key || p.slug === key
  ) || null
}

function buildResult(preset, travelStyle, travelerType, travelWindow) {
  const score = Math.min(100, preset.baseScore + (BUDGET_SCORE_MODIFIER[travelStyle] || 0) + (TRAVELER_MODIFIER[travelerType] || 0))
  const budgetLine = preset.budget[travelStyle] || preset.budget.comfortable
  return { ...preset, score, budgetLine }
}

function buildFallback(destination, travelStyle) {
  const budgets = { budget: '$40–70/day', comfortable: '$80–140/day', luxury: '$200+/day' }
  return {
    city: destination,
    country: null,
    flag: '🌍',
    score: 65,
    confidence: 'low',
    safetySummary: `We don't have a curated brief for ${destination} yet. Use this as a starting point and verify details with official government travel advisories.`,
    bestAreas: ['Central/tourist district', 'Areas near your accommodation with good reviews'],
    cautionNotes: ['Check your government\'s official travel advisory', 'Research local transport options before arriving', 'Verify current entry/visa requirements', 'Read recent traveler reviews for your specific area'],
    budgetLine: budgets[travelStyle] || budgets.comfortable,
    first24Hours: ['Arrange airport transport in advance', 'Check in and orient yourself before exploring', 'Identify the nearest pharmacy and hospital', 'Save your accommodation address offline'],
    checklist: ['Offline maps downloaded', 'Travel insurance active', 'Emergency numbers saved', 'Backup payment method', 'Accommodation address in local language'],
    packingTip: 'Research climate before packing. Always bring layers, a rain cover, and comfortable walking shoes.',
    bookFirst: ['Accommodation with strong recent reviews', 'Airport transfer booked in advance', 'Check if visa on arrival is available or must pre-apply'],
  }
}

function trackEvent(eventType, data = {}) {
  fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event_type: eventType, event_data: data }),
  }).catch(() => {})
}

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

      {isMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50 md:hidden" onClick={close} aria-hidden="true" />
          <div className="fixed top-0 right-0 h-full w-72 bg-white z-50 shadow-2xl md:hidden flex flex-col">
            <div className="flex items-center justify-between px-5 h-16 border-b border-gray-100">
              <span className="font-['Playfair_Display'] font-bold text-gradient text-lg">FeminTravel</span>
              <button onClick={close} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100" aria-label="Close menu">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
              {[
                { href: '/globe', label: 'Explore Globe', Icon: GlobeIcon },
                { href: '/blog', label: 'Blog', Icon: BookOpen },
                { href: '/contact', label: 'Contact', Icon: Mail },
              ].map(({ href, label, Icon }) => (
                <Link key={href} href={href} onClick={close}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[hsl(346,74%,96%)] transition-colors">
                  <Icon className="w-5 h-5 text-[hsl(346,74%,58%)]" />
                  <span className="font-medium text-gray-800">{label}</span>
                </Link>
              ))}
              <a href="#free-kit" onClick={close}
                className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[hsl(346,74%,96%)] transition-colors">
                <Gift className="w-5 h-5 text-[hsl(346,74%,58%)]" />
                <span className="font-medium text-gray-800">Free Kit</span>
              </a>
            </nav>
            <div className="p-4 border-t border-gray-100">
              <a href="#free-kit" onClick={close} className="btn-primary block text-center w-full">Get Free Kit</a>
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
      <div className="max-w-3xl mx-auto px-4 pt-12 pb-10 md:pt-16 md:pb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur border border-white/80 rounded-full px-3 py-1.5 text-xs font-medium text-gray-500 mb-5">
          <Sparkles className="w-3.5 h-3.5 text-[hsl(346,74%,60%)]" />
          Safety-first AI travel intelligence
        </div>

        <h1 className="font-['Playfair_Display'] text-4xl sm:text-5xl md:text-6xl font-bold leading-tight text-gray-900 mb-4">
          Explore the World{' '}
          <span className="text-gradient">Safely &amp; Confidently</span>
        </h1>

        <p className="text-base md:text-lg text-gray-600 max-w-xl mx-auto mb-7 leading-relaxed">
          AI-powered travel guidance for solo female travelers — safety tips, packing lists, budgets, and smarter arrival planning.
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
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white to-transparent" />
    </section>
  )
}

// ─── Solo Trip Readiness Preview ──────────────────────────────────────────────

const STYLE_OPTIONS = [
  { value: 'budget', label: 'Budget', icon: '🎒' },
  { value: 'comfortable', label: 'Comfortable', icon: '🏨' },
  { value: 'luxury', label: 'Luxury', icon: '✨' },
]
const TRAVELER_OPTIONS = [
  { value: 'solo', label: 'Solo', icon: '🧍‍♀️' },
  { value: 'friend', label: 'With friend', icon: '👯‍♀️' },
  { value: 'couple', label: 'Couple', icon: '💑' },
]
const WINDOW_OPTIONS = [
  { value: 'soon', label: 'Soon' },
  { value: 'summer', label: 'This summer' },
  { value: 'winter', label: 'This winter' },
  { value: 'unsure', label: 'Not sure' },
]

function ScoreDial({ score }) {
  const color = score >= 80 ? 'text-emerald-600' : score >= 65 ? 'text-amber-600' : 'text-rose-600'
  const ring = score >= 80 ? 'border-emerald-400' : score >= 65 ? 'border-amber-400' : 'border-rose-400'
  const bg = score >= 80 ? 'bg-emerald-50' : score >= 65 ? 'bg-amber-50' : 'bg-rose-50'
  return (
    <div className={`w-20 h-20 rounded-full border-4 ${ring} ${bg} flex flex-col items-center justify-center flex-shrink-0`}>
      <span className={`text-2xl font-bold ${color} leading-none`}>{score}</span>
      <span className="text-[10px] text-gray-400 mt-0.5">/ 100</span>
    </div>
  )
}

function ResultCard({ result, travelStyle, onFullBrief }) {
  const conf = CONFIDENCE_LABEL[result.confidence] || CONFIDENCE_LABEL.low

  return (
    <div className="rounded-2xl border border-gray-100 shadow-lg overflow-hidden bg-white mt-5">
      {/* Header */}
      <div className="bg-gradient-to-r from-[hsl(346,74%,93%)] to-[hsl(270,50%,93%)] px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-3xl flex-shrink-0">{result.flag}</span>
            <div className="min-w-0">
              <h3 className="font-['Playfair_Display'] font-bold text-gray-900 text-xl leading-tight truncate">
                {result.city}
              </h3>
              {result.country && <p className="text-gray-500 text-sm">{result.country}</p>}
            </div>
          </div>
          <ScoreDial score={result.score} />
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${conf.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${conf.dot}`} />
            {conf.text}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-white/70 text-gray-700">
            <DollarSign className="w-3 h-3" />
            {result.budgetLine}
          </span>
        </div>
      </div>

      {/* Content grid */}
      <div className="divide-y divide-gray-50">
        {/* Safety summary */}
        <div className="px-5 py-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-[hsl(346,74%,55%)]" />
            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Safety overview</p>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">{result.safetySummary}</p>
        </div>

        {/* Two-col row: best areas + caution */}
        <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-50">
          <div className="px-5 py-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-[hsl(270,50%,60%)]" />
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Best areas to stay</p>
            </div>
            <ul className="space-y-1">
              {result.bestAreas.map((a, i) => (
                <li key={i} className="text-sm text-gray-600 flex items-start gap-1.5">
                  <span className="text-[hsl(346,74%,65%)] mt-0.5 flex-shrink-0">•</span>
                  {a}
                </li>
              ))}
            </ul>
          </div>

          <div className="px-5 py-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Watch-outs</p>
            </div>
            <ul className="space-y-1">
              {result.cautionNotes.map((n, i) => (
                <li key={i} className="text-sm text-gray-600 flex items-start gap-1.5">
                  <span className="text-amber-400 mt-0.5 flex-shrink-0">•</span>
                  {n}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* First 24h */}
        <div className="px-5 py-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-blue-500" />
            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">First 24 hours</p>
          </div>
          <ol className="space-y-1.5">
            {result.first24Hours.map((step, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        {/* Checklist + packing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-50">
          <div className="px-5 py-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Smart checklist</p>
            </div>
            <ul className="space-y-1.5">
              {result.checklist.map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="px-5 py-4">
            <div className="flex items-center gap-2 mb-2">
              <Luggage className="w-4 h-4 text-purple-500" />
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Packing tip</p>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">{result.packingTip}</p>
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-4 h-4 text-[hsl(346,74%,55%)]" />
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Book first</p>
            </div>
            <ul className="space-y-1">
              {result.bookFirst.map((item, i) => (
                <li key={i} className="text-sm text-gray-600 flex items-start gap-1.5">
                  <span className="text-[hsl(346,74%,65%)] mt-0.5 flex-shrink-0">→</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* CTA footer */}
      <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
        <button
          onClick={onFullBrief}
          className="btn-primary flex-1 flex items-center justify-center gap-2 py-3"
        >
          <Zap className="w-4 h-4" />
          Generate full AI brief
          <ArrowRight className="w-4 h-4" />
        </button>
        <a href="#free-kit"
          className="btn-secondary flex-1 flex items-center justify-center gap-2 py-3">
          <Gift className="w-4 h-4" />
          Get {result.city} travel kit
        </a>
      </div>
    </div>
  )
}

function ReadinessPreview({ onPreviewGenerated }) {
  const router = useRouter()
  const [destination, setDestination] = useState('')
  const [travelStyle, setTravelStyle] = useState('comfortable')
  const [travelerType, setTravelerType] = useState('solo')
  const [travelWindow, setTravelWindow] = useState('unsure')
  const [result, setResult] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const resultRef = useRef(null)

  const generate = useCallback((dest, style, type, window) => {
    if (!dest.trim()) return
    setIsGenerating(true)
    setTimeout(() => {
      const preset = findPreset(dest)
      const res = preset
        ? buildResult(preset, style, type, window)
        : buildFallback(dest, style)
      setResult(res)
      setIsGenerating(false)
      onPreviewGenerated?.(res, { travelStyle: style, travelerType: type, travelWindow: window })
      trackEvent('homepage_preview_generated', {
        destination: dest,
        travelStyle: style,
        travelerType: type,
        travelWindow: window,
        isPreset: !!preset,
      })
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
    }, 400)
  }, [onPreviewGenerated])

  const handleSubmit = (e) => {
    e.preventDefault()
    generate(destination, travelStyle, travelerType, travelWindow)
  }

  const handleQuickDestination = (dest) => {
    setDestination(dest.city)
    generate(dest.city, travelStyle, travelerType, travelWindow)
    trackEvent('homepage_quick_destination_clicked', { destination: dest.city })
  }

  const handleFullBrief = () => {
    const slug = result?.slug || result?.city?.toLowerCase().replace(/\s+/g, '-')
    trackEvent('homepage_full_brief_clicked', {
      destination: result?.city, slug,
      travelStyle, travelerType, travelWindow,
    })
    router.push(`/globe?focus=${slug}&style=${travelStyle}&type=${travelerType}&window=${travelWindow}`)
  }

  const quickDests = ['Barcelona', 'Lisbon', 'Tokyo', 'Paris', 'Bali', 'Rome'].map(
    (c) => findPreset(c)
  ).filter(Boolean)

  return (
    <section className="py-10 md:py-14 bg-white">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-6">
          <h2 className="font-['Playfair_Display'] text-2xl md:text-3xl font-bold mb-1.5">
            Check your solo trip readiness
          </h2>
          <p className="text-gray-500 text-sm">
            Instant preview for any destination — safety score, areas, budget, and arrival plan.
          </p>
        </div>

        {/* Input card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Destination input */}
            <div>
              <label htmlFor="destination-input" className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                Destination
              </label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="destination-input"
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="City or country — e.g. Barcelona, Japan"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[hsl(346,74%,72%)] focus:outline-none text-sm bg-gray-50 focus:bg-white transition-colors"
                  aria-label="Enter destination"
                />
              </div>
            </div>

            {/* Three selectors row */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Travel style</p>
                <div className="flex flex-col gap-1.5">
                  {STYLE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setTravelStyle(opt.value)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                        travelStyle === opt.value
                          ? 'bg-[hsl(346,74%,93%)] border-[hsl(346,74%,72%)] text-[hsl(346,74%,35%)]'
                          : 'bg-gray-50 border-transparent text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {opt.icon} {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Traveling</p>
                <div className="flex flex-col gap-1.5">
                  {TRAVELER_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setTravelerType(opt.value)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                        travelerType === opt.value
                          ? 'bg-[hsl(270,50%,93%)] border-[hsl(270,50%,65%)] text-[hsl(270,50%,35%)]'
                          : 'bg-gray-50 border-transparent text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {opt.icon} {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">When</p>
                <div className="flex flex-col gap-1.5">
                  {WINDOW_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setTravelWindow(opt.value)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                        travelWindow === opt.value
                          ? 'bg-gray-200 border-gray-400 text-gray-800'
                          : 'bg-gray-50 border-transparent text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isGenerating || !destination.trim()}
              className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Generating preview…
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Readiness Preview
                </>
              )}
            </button>
          </form>

          {/* Quick destinations */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-2">Quick preview:</p>
            <div className="flex flex-wrap gap-2">
              {quickDests.map((d) => (
                <button
                  key={d.slug}
                  onClick={() => handleQuickDestination(d)}
                  className="inline-flex items-center gap-1 text-xs px-3 py-1.5 bg-gray-100 hover:bg-[hsl(346,74%,93%)] text-gray-700 hover:text-[hsl(346,74%,40%)] rounded-full transition-colors font-medium"
                >
                  {d.flag} {d.city}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Result card */}
        <div ref={resultRef}>
          {result && (
            <ResultCard
              result={result}
              travelStyle={travelStyle}
              onFullBrief={handleFullBrief}
            />
          )}
        </div>

        {!result && (
          <p className="text-center text-xs text-gray-400 mt-3">
            Previews are curated — not from OpenAI. Full AI briefs available on the globe.
          </p>
        )}
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
    body: 'Helpful for solo women, friends, first-time solo travelers, and safety-conscious explorers.',
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
  { n: '01', title: 'Choose a destination', desc: 'Preview any city instantly above, or tap the globe to explore worldwide.' },
  { n: '02', title: 'Get an AI safety brief', desc: 'Safety tips, budget ranges, packing suggestions, and local tips in seconds.' },
  { n: '03', title: 'Plan smarter', desc: 'Use your checklist, find the right neighborhoods, and book with confidence.' },
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
            <div key={i} className="relative flex gap-4 p-4 rounded-2xl bg-[hsl(30,33%,98%)] border border-gray-100">
              <span className="font-['Playfair_Display'] text-4xl font-bold text-[hsl(346,74%,88%)] leading-none flex-shrink-0 mt-0.5">{n}</span>
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

function FeaturedDestinations({ onPreviewDestination }) {
  const router = useRouter()

  const handleCard = (dest) => {
    const preset = findPreset(dest.name)
    if (preset) {
      onPreviewDestination?.(dest.name)
      trackEvent('homepage_quick_destination_clicked', { destination: dest.name, source: 'featured_card' })
      document.getElementById('readiness-preview')?.scrollIntoView({ behavior: 'smooth' })
    } else {
      router.push(`/globe?focus=${dest.slug}`)
    }
  }

  return (
    <section className="py-12 md:py-16 bg-[hsl(30,33%,98%)]">
      <div className="max-w-6xl mx-auto">
        <div className="px-4 mb-6">
          <h2 className="font-['Playfair_Display'] text-2xl md:text-3xl font-bold mb-1">
            Start with a destination
          </h2>
          <p className="text-gray-500 text-sm">Tap a city to preview your readiness brief instantly.</p>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 px-4 snap-x snap-mandatory md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-visible md:pb-0 md:gap-5 md:px-4">
          {destinations.map((dest) => (
            <button
              key={dest.slug}
              onClick={() => handleCard(dest)}
              aria-label={`Preview travel brief for ${dest.name}, ${dest.country}`}
              className="flex-none w-[200px] snap-start md:w-auto group relative overflow-hidden rounded-2xl aspect-[3/2] md:aspect-[4/3] cursor-pointer"
            >
              <img src={dest.image} alt={dest.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 text-left">
                <p className="font-['Playfair_Display'] font-bold text-white text-sm md:text-lg leading-tight">{dest.name}</p>
                <p className="text-white/75 text-xs mb-1.5">{dest.country}</p>
                <span className="inline-flex items-center gap-1 text-xs text-white bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5 group-hover:bg-[hsl(346,74%,68%)] transition-colors">
                  <Sparkles className="w-3 h-3" /> Preview brief
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

function LeadMagnetSection({ previewCity, previewMeta }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const ctaCopy = previewCity ? `Get my ${previewCity} travel kit` : 'Get the free solo travel kit'
  const subCopy = previewCity
    ? `Packing checklist and safety notes tailored to your ${previewCity} trip.`
    : 'Packing checklist, safety planning notes, and budget prep for your next trip.'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    trackEvent('homepage_free_kit_clicked', { destination: previewCity, ...previewMeta })
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          destination: previewCity || null,
          ...previewMeta,
          source: 'homepage_readiness_preview',
        }),
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
    <section id="free-kit" className="py-12 md:py-16 bg-gradient-to-br from-[hsl(346,74%,92%)] via-[hsl(300,40%,96%)] to-[hsl(270,50%,92%)]">
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-[hsl(346,74%,88%)] to-[hsl(270,50%,88%)] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Gift className="w-6 h-6 text-[hsl(346,74%,45%)]" />
            </div>
            <h2 className="font-['Playfair_Display'] text-2xl font-bold mb-2">{ctaCopy}</h2>
            <p className="text-gray-500 text-sm leading-relaxed">{subCopy}</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              aria-label="Your name"
              className="input-femin"
            />
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-label="Your email"
              className="input-femin"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full py-3.5 text-base disabled:opacity-50"
            >
              {isSubmitting ? 'Saving…' : previewCity ? `Get ${previewCity} Kit →` : 'Get My Free Kit →'}
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
          <p className="font-['Playfair_Display'] font-semibold text-lg text-gray-900 mb-1">Travel safety guides &amp; tips</p>
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
            © 2026 FeminTravel. Made with <Heart className="w-3.5 h-3.5 inline text-[hsl(346,74%,65%)]" /> for solo travelers.
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
        className="fixed bottom-5 right-4 md:bottom-6 md:right-6 z-40
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
        <div className="fixed bottom-20 right-4 md:bottom-24 md:right-6 z-40
                        w-[calc(100vw-32px)] max-w-[320px]
                        bg-white rounded-3xl shadow-2xl max-h-[60vh] flex flex-col overflow-hidden">
          <div className="bg-gradient-to-r from-[hsl(346,74%,88%)] to-[hsl(270,50%,88%)] px-4 py-3">
            <h3 className="font-['Playfair_Display'] font-semibold text-base text-gray-800">Travel Assistant</h3>
            <p className="text-xs text-gray-500 mt-0.5">Ask about destinations, safety, or packing</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[120px] max-h-[220px]">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 py-4">
                <Sparkles className="w-6 h-6 mx-auto mb-2 text-[hsl(346,74%,72%)]" />
                <p className="text-xs">Ask about any destination, safety tips, or packing.</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[82%] px-3 py-2 text-sm rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-[hsl(346,74%,88%)] text-[hsl(346,74%,25%)] rounded-br-sm'
                    : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-3 py-2 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1">
                    {[0, 0.1, 0.2].map((delay, i) => (
                      <div key={i} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${delay}s` }} />
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
                <button key={i} onClick={() => sendMessage(s)}
                  className="text-xs px-2.5 py-1.5 bg-[hsl(346,74%,95%)] text-[hsl(346,74%,45%)] rounded-full hover:bg-[hsl(346,74%,90%)] transition-colors">
                  {s}
                </button>
              ))}
            </div>
          )}
          <div className="p-3 border-t border-gray-100">
            <form onSubmit={(e) => { e.preventDefault(); sendMessage(input) }} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything…"
                disabled={isLoading}
                aria-label="Chat input"
                className="flex-1 px-3 py-2 rounded-full border-2 border-gray-200 focus:border-[hsl(346,74%,72%)] focus:outline-none text-sm"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="w-9 h-9 bg-[hsl(346,74%,72%)] rounded-full flex items-center justify-center hover:bg-[hsl(346,74%,60%)] transition-colors disabled:opacity-50"
                aria-label="Send message"
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
  const [previewCity, setPreviewCity] = useState(null)
  const [previewMeta, setPreviewMeta] = useState({})
  const previewRef = useRef(null)

  const handlePreviewGenerated = useCallback((result, meta) => {
    setPreviewCity(result.city)
    setPreviewMeta({
      travelStyle: meta.travelStyle,
      travelerType: meta.travelerType,
      travelWindow: meta.travelWindow,
    })
  }, [])

  const handleFeaturedClick = useCallback((cityName) => {
    if (previewRef.current) {
      previewRef.current.triggerPreview(cityName)
    }
  }, [])

  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <div id="readiness-preview">
        <ReadinessPreview onPreviewGenerated={handlePreviewGenerated} />
      </div>
      <WhySection />
      <HowItWorks />
      <FeaturedDestinations onPreviewDestination={(cityName) => {
        setPreviewCity(null)
        document.getElementById('readiness-preview')?.scrollIntoView({ behavior: 'smooth' })
        const input = document.getElementById('destination-input')
        if (input) {
          input.value = cityName
          input.dispatchEvent(new Event('input', { bubbles: true }))
        }
      }} />
      <LeadMagnetSection previewCity={previewCity} previewMeta={previewMeta} />
      <BlogCTA />
      <Footer />
      <ChatWidget />
    </main>
  )
}
