import Link from 'next/link'
import {
  ShieldCheck, MapPin, Luggage, DollarSign, PhoneCall,
  CheckSquare, ArrowRight, Globe, BookOpen,
} from 'lucide-react'

export const metadata = {
  title: 'Free Solo Travel Kit — FeminTravel',
  description: 'Your complete solo travel kit: safety checklists, packing lists, budget prep, and emergency planning.',
}

const checklists = [
  {
    id: 'pre-trip',
    Icon: ShieldCheck,
    color: 'from-pink-100 to-pink-50',
    border: 'border-pink-200',
    iconColor: 'text-pink-500',
    title: 'Pre-Trip Safety',
    subtitle: 'Before you book and pack',
    items: [
      'Research entry requirements and visa rules (official government source)',
      'Check travel advisories for your destination',
      'Save embassy and consulate contact for your destination country',
      'Share your full itinerary with a trusted person at home',
      'Set up international data — eSIM, roaming plan, or local SIM plan',
      'Download offline maps for your destination (Google Maps or Maps.me)',
      'Save photo copies of passport, insurance, and cards to secure cloud storage',
      'Research your destination\'s emergency number (112 or local equivalent)',
    ],
  },
  {
    id: 'arrival',
    Icon: MapPin,
    color: 'from-purple-100 to-purple-50',
    border: 'border-purple-200',
    iconColor: 'text-purple-500',
    title: 'Arrival Checklist',
    subtitle: 'For your first hours in-destination',
    items: [
      'Arrive in daylight when possible — especially for an unfamiliar city',
      'Pre-decide your airport transport: metro, official taxi, or pre-booked transfer',
      'Save hotel or accommodation address offline before landing',
      'Identify the nearest hospital, clinic, or pharmacy to your accommodation',
      'Connect to working SIM or wifi before leaving the airport',
      'Withdraw local cash if needed (airport ATM is usually safe)',
      'Confirm that your backup contacts know you\'ve arrived safely',
    ],
  },
  {
    id: 'packing',
    Icon: Luggage,
    color: 'from-rose-100 to-rose-50',
    border: 'border-rose-200',
    iconColor: 'text-rose-500',
    title: 'Packing Checklist',
    subtitle: 'Smart packing for solo travel',
    items: [
      'Comfortable, well-tested walking shoes',
      'Layers — temperature varies more than forecasts suggest',
      'Crossbody or anti-theft bag for daily use',
      'Portable charger / power bank (10,000mAh+)',
      'Universal travel adapter for your destination\'s plug type',
      'Personal alarm (small keychain type)',
      'Small first aid kit: plasters, pain relief, antidiarrheal',
      'Backup payment card stored separately from main wallet',
      'Headphones for transport and focus',
      'Lightweight packable rain layer',
    ],
  },
  {
    id: 'budget',
    Icon: DollarSign,
    color: 'from-amber-100 to-amber-50',
    border: 'border-amber-200',
    iconColor: 'text-amber-600',
    title: 'Budget Prep',
    subtitle: 'Financial planning before you go',
    items: [
      'Estimate daily costs: accommodation + food + transport + one experience',
      'Always carry at least 2 payment methods (card + backup card or cash)',
      'Notify your bank about travel dates and destination',
      'Research tipping customs for your destination',
      'Set aside an emergency buffer — at least 15–20% above your planned total',
      'Research which local ATMs are safe and fee-free for your card',
      'Know your card\'s foreign transaction fees before you go',
    ],
  },
  {
    id: 'emergency',
    Icon: PhoneCall,
    color: 'from-teal-100 to-teal-50',
    border: 'border-teal-200',
    iconColor: 'text-teal-600',
    title: 'Emergency Info',
    subtitle: 'Save this before every trip',
    items: [
      'Local emergency number (112 EU, 911 USA, or research your specific destination)',
      'Embassy / consulate address and phone number',
      'Travel insurance policy number and emergency helpline',
      'Your own blood type noted on your phone lock screen or info card',
      'Any allergy or medical info in the local language (use a translation app)',
      'Two trusted home contacts who have your itinerary and accommodation details',
      'Hotel or host\'s phone number saved offline',
    ],
  },
]

const tripStarter = [
  { label: 'Choose your base neighborhood', detail: 'Central, well-reviewed, good transport links' },
  { label: 'Plan your airport arrival', detail: 'Know your route before you land' },
  { label: 'Save emergency numbers', detail: 'Local police, hospital, embassy' },
  { label: 'Prepare backup payment', detail: 'Second card stored separately' },
  { label: 'Download offline map', detail: 'Google Maps or Maps.me offline area' },
  { label: 'Check local customs', detail: 'Dress, tipping, etiquette basics' },
  { label: 'Share itinerary', detail: 'Send to someone trusted at home' },
]

function ChecklistCard({ checklist }) {
  const { Icon, color, border, iconColor, title, subtitle, items } = checklist
  return (
    <div className={`rounded-3xl border ${border} bg-gradient-to-br ${color} overflow-hidden`}>
      <div className="px-5 pt-5 pb-4 flex items-start gap-3 border-b border-white/50">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <div>
          <h2 className="font-['Playfair_Display'] font-bold text-gray-900 text-lg leading-tight">{title}</h2>
          <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
        </div>
      </div>
      <ul className="divide-y divide-white/40 px-5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3 py-3">
            <input
              type="checkbox"
              className="mt-0.5 w-4 h-4 flex-shrink-0 accent-pink-500 cursor-pointer"
              aria-label={item}
            />
            <span className="text-sm text-gray-700 leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function FreeKitPage() {
  return (
    <main className="min-h-screen bg-[hsl(30,33%,98%)] pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-[hsl(346,74%,92%)] via-[hsl(300,40%,96%)] to-[hsl(270,50%,92%)] px-4 pt-8 pb-12">
        <div className="max-w-2xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-[hsl(346,74%,45%)] hover:underline mb-6">
            ← Back to FeminTravel
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
              <CheckSquare className="w-6 h-6 text-[hsl(346,74%,55%)]" />
            </div>
            <div>
              <h1 className="font-['Playfair_Display'] text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                Solo Travel Kit
              </h1>
              <p className="text-[hsl(346,74%,45%)] text-sm font-medium">Your free planning resource</p>
            </div>
          </div>
          <p className="text-gray-600 max-w-lg leading-relaxed">
            Five practical checklists to plan, pack, and arrive safely — for any destination worldwide. Tick each item as you go.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-6 space-y-5">
        {/* Checklists */}
        {checklists.map((list) => (
          <ChecklistCard key={list.id} checklist={list} />
        ))}

        {/* Trip Starter Checklist */}
        <div className="rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-100 to-indigo-50 overflow-hidden">
          <div className="px-5 pt-5 pb-4 flex items-start gap-3 border-b border-white/50">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
              <Globe className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <h2 className="font-['Playfair_Display'] font-bold text-gray-900 text-lg leading-tight">
                Trip Starter Checklist
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">The 7 things to sort before any trip</p>
            </div>
          </div>
          <ul className="divide-y divide-white/40 px-5">
            {tripStarter.map(({ label, detail }, i) => (
              <li key={i} className="flex items-start gap-3 py-3">
                <input
                  type="checkbox"
                  className="mt-0.5 w-4 h-4 flex-shrink-0 accent-indigo-500 cursor-pointer"
                  aria-label={label}
                />
                <div>
                  <p className="text-sm font-medium text-gray-800">{label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-gray-400 text-center px-2 leading-relaxed">
          These checklists are practical planning guides. Always verify entry requirements, visa rules, and advisories with official government and embassy sources before travel.
        </p>

        {/* CTAs */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 text-center">
          <p className="font-['Playfair_Display'] font-semibold text-lg text-gray-900 mb-1">
            Ready to explore?
          </p>
          <p className="text-gray-500 text-sm mb-5">
            Use the globe to generate an AI travel brief for any destination.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/globe"
              className="btn-primary inline-flex items-center justify-center gap-2 py-3 px-6"
            >
              <Globe className="w-4 h-4" />
              Explore the Globe
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/blog"
              className="btn-secondary inline-flex items-center justify-center gap-2 py-3 px-6"
            >
              <BookOpen className="w-4 h-4" />
              Read Safety Guides
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
