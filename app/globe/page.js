'use client'

import { useState, useEffect, useRef, useCallback, Suspense, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Search,
  X,
  Globe as GlobeIcon,
  MapPin,
  Shield,
  Luggage,
  DollarSign,
  MessageCircle,
  Send,
  Sparkles,
  ArrowLeft,
  AlertTriangle,
  Clock,
  CheckCircle,
  ArrowRight,
  Star,
  HelpCircle
} from 'lucide-react'

import BookingCTAs from '../../components/BookingCTAs'
import { fallbackBrief } from '@/lib/brief-fallback'
import { trackEvent as recordProductEvent } from '@/lib/events'

// ─── iOS Safari WebGPU polyfill ───────────────────────────────────────────────
function ensureWebGpuEnums() {
  if (typeof window === 'undefined') return
  window.GPUShaderStage ??= { VERTEX: 1, FRAGMENT: 2, COMPUTE: 4 }
  window.GPUBufferUsage ??= {
    MAP_READ: 1,
    MAP_WRITE: 2,
    COPY_SRC: 4,
    COPY_DST: 8,
    INDEX: 16,
    VERTEX: 32,
    UNIFORM: 64,
    STORAGE: 128,
    INDIRECT: 256,
    QUERY_RESOLVE: 512
  }
  window.GPUMapMode ??= { READ: 1, WRITE: 2 }
  window.GPUTextureUsage ??= {
    COPY_SRC: 1,
    COPY_DST: 2,
    TEXTURE_BINDING: 4,
    STORAGE_BINDING: 8,
    RENDER_ATTACHMENT: 16
  }
}

function hasWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
  } catch {
    return false
  }
}

// ─── Place name normalization ─────────────────────────────────────────────────
function normalizePlaceName({ name, country, planningEligible = true }) {
  return {
    displayName: name || 'Selected area',
    subtitle: country || '',
    country: country || '',
    isRemoteArea: !planningEligible
  }
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n))
}
function normalize(s) {
  return (s || '').toLowerCase().trim()
}

// ─── Fallback brief ───────────────────────────────────────────────────────────
// ─── Featured destinations ────────────────────────────────────────────────────
const featuredDestinations = [
  { id: '1', name: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503, slug: 'tokyo' },
  { id: '2', name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522, slug: 'paris' },
  { id: '3', name: 'Rome', country: 'Italy', lat: 41.9028, lng: 12.4964, slug: 'rome' },
  { id: '4', name: 'Bali', country: 'Indonesia', lat: -8.4095, lng: 115.1889, slug: 'bali' },
  { id: '5', name: 'Lisbon', country: 'Portugal', lat: 38.7223, lng: -9.1393, slug: 'lisbon' },
  { id: '6', name: 'New York', country: 'USA', lat: 40.7128, lng: -74.006, slug: 'new-york' },
  { id: '7', name: 'Barcelona', country: 'Spain', lat: 41.3851, lng: 2.1734, slug: 'barcelona' },
  { id: '8', name: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093, slug: 'sydney' },
  {
    id: '9',
    name: 'Cape Town',
    country: 'South Africa',
    lat: -33.9249,
    lng: 18.4241,
    slug: 'cape-town'
  },
  {
    id: '10',
    name: 'Reykjavik',
    country: 'Iceland',
    lat: 64.1466,
    lng: -21.9426,
    slug: 'reykjavik'
  }
]

// ─── Trip context helpers ─────────────────────────────────────────────────────
const STYLE_LABEL = { budget: 'Budget', comfortable: 'Comfortable', luxury: 'Luxury' }
const TYPE_LABEL = { solo: 'Solo', friend: 'With friend', couple: 'Couple' }
const WINDOW_LABEL = {
  soon: 'Soon',
  summer: 'This summer',
  winter: 'This winter',
  unsure: 'Not sure yet'
}
function getTripContextFromSearchParams(searchParams) {
  return {
    style: searchParams.get('style') || null,
    type: searchParams.get('type') || null,
    window: searchParams.get('window') || null
  }
}

function SectionLabel({ icon: Icon, label, color = 'text-pink-400' }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      {Icon && <Icon className={`w-4 h-4 ${color}`} />}
      <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">{label}</p>
    </div>
  )
}

// ─── PackingPrepChecklist (own state — MUST be defined outside DestinationPanel) ──
function PackingPrepChecklist({ items }) {
  const [checked, setChecked] = useState(new Set())
  return (
    <ul className="space-y-2">
      {(items || []).map((item, i) => (
        <li key={i}>
          <label className="flex gap-3 items-start bg-gray-50 rounded-xl p-3 text-sm">
            <input
              type="checkbox"
              checked={checked.has(i)}
              onChange={() =>
                setChecked((prev) => {
                  const next = new Set(prev)
                  next.has(i) ? next.delete(i) : next.add(i)
                  return next
                })
              }
              className="mt-1 accent-pink-600"
            />
            <span>{item}</span>
          </label>
        </li>
      ))}
    </ul>
  )
}

function LoadingSkeleton() {
  return (
    <div className="p-5 space-y-3 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-5/6" />
      <div className="h-4 bg-gray-200 rounded w-4/6" />
      <div className="h-20 bg-gray-200 rounded mt-2" />
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-2/3" />
      <div className="h-16 bg-gray-200 rounded" />
    </div>
  )
}

// ─── DestinationPanel ─────────────────────────────────────────────────────────
function DestinationPanel({
  destination,
  brief,
  isLoading,
  tripContext,
  onClose,
  onOpenChat,
  isMobile,
  onHeightPxChange
}) {
  const [vh, setVh] = useState(800)
  const closeRef = useRef(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  useEffect(() => {
    const previous = document.activeElement
    closeRef.current?.focus()
    const key = (e) => {
      if (e.key === 'Escape') onCloseRef.current()
    }
    document.addEventListener('keydown', key)
    return () => {
      document.removeEventListener('keydown', key)
      if (previous?.isConnected) previous.focus()
    }
  }, [destination?.name])
  const [heightPx, setHeightPx] = useState(0)
  const draggingRef = useRef(false)
  const movedRef = useRef(false)
  const dragHeightRef = useRef(0)
  const startY = useRef(0)
  const startH = useRef(0)

  useEffect(() => {
    const upd = () => setVh(window.innerHeight || 800)
    upd()
    window.addEventListener('resize', upd)
    return () => window.removeEventListener('resize', upd)
  }, [])

  const snapPx = useMemo(
    () => [Math.round(vh * 0.4), Math.round(vh * 0.65), Math.round(vh * 0.9)],
    [vh]
  )

  useEffect(() => {
    if (isMobile) setHeightPx(snapPx[0])
  }, [isMobile, snapPx])

  useEffect(() => {
    if (!isMobile) return
    onHeightPxChange?.(heightPx)
  }, [heightPx, isMobile, onHeightPxChange])

  const displayName = destination?.displayName || destination?.name
  const subtitle = destination?.subtitle || destination?.country

  const tripContextLine = [
    tripContext?.style && STYLE_LABEL[tripContext.style],
    tripContext?.type && TYPE_LABEL[tripContext.type],
    tripContext?.window && WINDOW_LABEL[tripContext.window]
  ]
    .filter(Boolean)
    .join(' · ')

  // Brief content — inline JSX (no inner function component, avoids unmount issue)
  const briefContent = brief ? (
    <div className="divide-y divide-gray-50">
      {/* Overview */}
      {brief.overview && (
        <div className="px-5 py-4">
          <p className="text-sm text-gray-600 leading-relaxed">{brief.overview}</p>
          {brief.best_time_to_visit && (
            <div className="flex items-start gap-2 mt-3 bg-blue-50 rounded-xl px-3 py-2.5">
              <Clock className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-gray-600 leading-relaxed">{brief.best_time_to_visit}</p>
            </div>
          )}
        </div>
      )}

      {/* Safety */}
      {brief.safety_tips?.length > 0 && (
        <div className="px-5 py-4">
          <SectionLabel icon={Shield} label="Safety overview" color="text-rose-400" />
          <ul className="space-y-2">
            {brief.safety_tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2.5 bg-rose-50 rounded-xl px-3 py-2.5">
                <Shield className="w-3.5 h-3.5 text-rose-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700 leading-relaxed">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Things to do */}
      {brief.things_to_do?.length > 0 && (
        <div className="px-5 py-4">
          <SectionLabel icon={Star} label="Things to do" color="text-pink-400" />
          <ol className="space-y-1.5">
            {brief.things_to_do.map((t, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                <span className="w-5 h-5 rounded-full bg-pink-100 text-pink-600 text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {t}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Where to stay */}
      {brief.neighborhoods_to_stay?.length > 0 && (
        <div className="px-5 py-4">
          <SectionLabel icon={MapPin} label="Where to stay" color="text-purple-400" />
          <ul className="space-y-2">
            {brief.neighborhoods_to_stay.map((n, i) => (
              <li key={i} className="flex items-start gap-2.5 bg-purple-50 rounded-xl px-3 py-2.5">
                <MapPin className="w-3.5 h-3.5 text-purple-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">{n}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Watch-outs */}
      {brief.cultural_tips?.length > 0 && (
        <div className="px-5 py-4">
          <SectionLabel
            icon={AlertTriangle}
            label="Watch-outs & cultural tips"
            color="text-amber-500"
          />
          <ul className="space-y-2">
            {brief.cultural_tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2.5 bg-amber-50 rounded-xl px-3 py-2.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700 leading-relaxed">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Packing checklist */}
      {brief.packing_list?.length > 0 && (
        <div className="px-5 py-4">
          <SectionLabel icon={Luggage} label="Packing checklist" color="text-indigo-400" />
          <PackingPrepChecklist items={brief.packing_list} />
        </div>
      )}

      {/* Budget */}
      {brief.budget_ranges && (
        <div className="px-5 py-4">
          <SectionLabel icon={DollarSign} label="Budget (per day)" color="text-emerald-500" />
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              {
                key: 'budget',
                label: 'Budget',
                value: brief.budget_ranges.low,
                colors: 'bg-green-50 border-green-200 text-green-800',
                highlight: tripContext?.style === 'budget'
              },
              {
                key: 'comfortable',
                label: 'Mid-range',
                value: brief.budget_ranges.mid,
                colors: 'bg-blue-50 border-blue-200 text-blue-800',
                highlight: tripContext?.style === 'comfortable'
              },
              {
                key: 'luxury',
                label: 'Luxury',
                value: brief.budget_ranges.high,
                colors: 'bg-purple-50 border-purple-200 text-purple-800',
                highlight: tripContext?.style === 'luxury'
              }
            ].map(({ key, label, value, colors, highlight }) => (
              <div
                key={key}
                className={`rounded-xl border p-3 ${colors} ${highlight ? 'ring-2 ring-offset-1 ring-blue-400' : ''}`}
              >
                <p className="text-xs font-semibold leading-tight mb-1">{label}</p>
                <p className="text-xs leading-tight">{value || '—'}</p>
              </div>
            ))}
          </div>
          {brief.transport_tips?.length > 0 && (
            <ul className="space-y-1">
              {brief.transport_tips.map((tip, i) => (
                <li key={i} className="text-xs text-gray-500 flex items-start gap-1.5">
                  <span className="text-pink-400 mt-0.5 flex-shrink-0">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Quick essentials */}
      {brief.quick_faq && (
        <div className="px-5 py-4">
          <SectionLabel icon={HelpCircle} label="Quick essentials" color="text-gray-400" />
          <div className="space-y-2">
            {[
              { icon: '🛂', label: 'Visa & Entry', value: brief.quick_faq.visa },
              { icon: '📱', label: 'SIM Card', value: brief.quick_faq.sim },
              { icon: '🔌', label: 'Plugs', value: brief.quick_faq.plugs },
              { icon: '✈️', label: 'Airport to City', value: brief.quick_faq.airport_to_city }
            ]
              .filter((f) => f.value)
              .map(({ icon, label, value }) => (
                <div key={label} className="bg-gray-50 rounded-xl px-3 py-2.5">
                  <p className="text-xs font-semibold text-gray-800">
                    {icon} {label}
                  </p>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">{value}</p>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="px-5 py-4">
        <p className="text-xs text-gray-600 italic leading-relaxed">
          AI guidance is a planning aid only. Always verify visa requirements, safety advisories,
          and entry rules through official government sources before travel.
        </p>
      </div>
    </div>
  ) : (
    <div className="px-5 py-8 text-center text-gray-500 text-sm">
      Failed to load travel brief. Please try again.
    </div>
  )

  // ── Desktop panel ──
  if (!isMobile) {
    return (
      <div
        role="region"
        aria-label="Destination planning panel"
        className="fixed top-[76px] right-0 h-[calc(100dvh-76px)] w-[420px] bg-white shadow-2xl z-[90] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-[#9b4c71] via-[#a86686] to-[#7b628d] px-5 pt-5 pb-4 flex-shrink-0">
          <button
            ref={closeRef}
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white/25 rounded-full flex items-center justify-center hover:bg-white/40 transition-colors"
            aria-label="Close panel"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-2">
            Travel planning notes
          </p>
          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-7 bg-white/30 rounded w-3/4 mb-2" />
              <div className="h-4 bg-white/30 rounded w-1/2" />
            </div>
          ) : (
            <>
              <div className="flex items-start gap-3 mb-2.5">
                <div className="flex-1 min-w-0">
                  <h2 className="font-serif text-2xl font-bold text-white leading-tight">
                    {displayName}
                  </h2>
                  {subtitle && <p className="text-white/85 text-sm mt-0.5">{subtitle}</p>}
                </div>
              </div>
              {tripContextLine && (
                <p className="text-white/75 text-xs font-medium mb-2.5">{tripContextLine}</p>
              )}
              <p className="text-xs text-gray-700 bg-white/90 rounded-xl p-2 mt-2">
                Planning assistance · verify before booking
              </p>
            </>
          )}
        </div>

        {/* Scrollable body */}
        <div
          className="flex-1 overflow-y-auto overscroll-contain"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {isLoading ? <LoadingSkeleton /> : briefContent}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 bg-gray-50 px-4 py-4 flex-shrink-0">
          <p className="text-xs text-gray-500 text-center mb-3">Plan your trip</p>
          {!destination?.isRemoteArea && (
            <>
              <Link
                href={`/plan?destination=${encodeURIComponent(destination.name)}`}
                className="btn-primary block text-center mb-3"
              >
                Plan this trip
              </Link>
              <BookingCTAs destination={destination} compact placement="globe" />
            </>
          )}
          {onOpenChat && (
            <button
              onClick={onOpenChat}
              className="mt-3 w-full flex items-center justify-center gap-2 text-sm text-pink-600 hover:text-pink-700 font-medium transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Ask AI about {displayName}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    )
  }

  // ── Mobile bottom sheet ──
  const onHandlePointerDown = (e) => {
    draggingRef.current = true
    movedRef.current = false
    dragHeightRef.current = heightPx
    startY.current = e.clientY
    startH.current = heightPx
    try {
      e.currentTarget.setPointerCapture?.(e.pointerId)
    } catch {}
  }
  const onHandlePointerMove = (e) => {
    if (!draggingRef.current) return
    const delta = startY.current - e.clientY
    if (Math.abs(delta) > 6) movedRef.current = true
    dragHeightRef.current = clamp(startH.current + delta, 240, snapPx[2])
    setHeightPx(dragHeightRef.current)
  }
  const onHandlePointerUp = () => {
    if (!draggingRef.current) return
    draggingRef.current = false
    const nearest = snapPx.reduce(
      (best, v) =>
        Math.abs(v - dragHeightRef.current) < Math.abs(best - dragHeightRef.current) ? v : best,
      snapPx[0]
    )
    setHeightPx(nearest)
  }

  return (
    <div
      role="region"
      aria-label="Destination planning panel"
      style={{ height: heightPx }}
      className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-[90] flex flex-col overflow-hidden transition-[height] duration-200 ease-out"
    >
      {/* Drag handle */}
      <button
        type="button"
        aria-label="Expand or collapse destination panel"
        aria-expanded={heightPx >= snapPx[1]}
        onClick={(e) => {
          if (e.detail > 0 && movedRef.current) {
            movedRef.current = false
            return
          }
          setHeightPx(heightPx < snapPx[1] ? snapPx[1] : snapPx[0])
        }}
        className="py-3 flex-shrink-0"
        style={{ touchAction: 'none' }}
        onPointerDown={onHandlePointerDown}
        onPointerMove={onHandlePointerMove}
        onPointerUp={onHandlePointerUp}
        onPointerCancel={onHandlePointerUp}
      >
        <span className="block w-12 h-1.5 bg-gray-300 rounded-full mx-auto" />
      </button>

      <button
        ref={closeRef}
        onClick={onClose}
        className="absolute top-3 right-4 w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center z-10"
        aria-label="Close panel"
      >
        <X className="w-5 h-5 text-gray-600" />
      </button>

      {/* Header */}
      <div className="px-4 pb-3 flex-shrink-0">
        <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-1">
          Travel planning notes
        </p>
        {isLoading ? (
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-1" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        ) : (
          <>
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <h2 className="font-serif text-xl font-bold leading-tight">{displayName}</h2>
                {subtitle && <p className="text-gray-500 text-sm mt-0.5">{subtitle}</p>}
              </div>
            </div>
            {tripContextLine && <p className="text-gray-500 text-xs mt-1.5">{tripContextLine}</p>}
            <p className="text-xs text-gray-700 bg-white/90 rounded-xl p-2 mt-2">
              Planning assistance · verify before booking
            </p>
          </>
        )}
      </div>

      {/* Scrollable content */}
      <div
        className="flex-1 overflow-y-auto overscroll-contain"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {isLoading ? <LoadingSkeleton /> : briefContent}
        {!destination?.isRemoteArea && (
          <div className="px-4 py-4">
            <BookingCTAs destination={destination} compact placement="globe" />
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="border-t border-gray-100 p-3 bg-gray-50 flex-shrink-0"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)' }}
      >
        {!destination?.isRemoteArea && (
          <>
            <Link
              href={`/plan?destination=${encodeURIComponent(destination.name)}`}
              className="btn-primary block text-center mb-3"
            >
              Plan this trip
            </Link>
          </>
        )}
        {onOpenChat && (
          <button
            onClick={onOpenChat}
            className="mt-2 w-full flex items-center justify-center gap-1.5 text-xs text-pink-600 font-medium"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            Ask AI about {displayName}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Chat Widget ──────────────────────────────────────────────────────────────
function ChatWidget({ destinationContext, isMobile, panelOpen, panelHeightPx, openTrigger }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const chatButtonRef = useRef(null)
  const chatInputRef = useRef(null)
  useEffect(() => {
    if (!isOpen) return
    chatInputRef.current?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
        chatButtonRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen])

  const [vh, setVh] = useState(800)
  useEffect(() => {
    const upd = () => setVh(window.innerHeight || 800)
    upd()
    window.addEventListener('resize', upd)
    return () => window.removeEventListener('resize', upd)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isOpen])

  // External open trigger (from panel "Ask AI" button)
  useEffect(() => {
    if (openTrigger > 0) setIsOpen(true)
  }, [openTrigger])

  const quickSuggestions = ['Is it safe?', 'What to pack?', 'Budget tips?', 'Best time?']

  const sendMessage = async (text) => {
    if (!text.trim() || isLoading) return
    const userMessage = { role: 'user', content: text }
    const nextMessages = [...messages, userMessage]
    setMessages(nextMessages)
    setInput('')
    setIsLoading(true)
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages.slice(-10), destinationContext })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'The assistant is unavailable. Please retry.')
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data?.response || 'Sorry—try again.' }
      ])
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: error.message || 'The assistant is unavailable. Please retry.'
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const baseRight = 24
  const desktopPanelW = 460
  const dynamicRight = !isMobile && panelOpen ? desktopPanelW + baseRight : baseRight

  let dynamicBottom = 24
  if (isMobile && panelOpen) {
    const raw = (panelHeightPx || 0) + 16
    dynamicBottom = clamp(raw, 16, vh - 180)
  }
  const chatWindowBottom = clamp(dynamicBottom + 72, 96, vh - 120)

  return (
    <>
      <button
        ref={chatButtonRef}
        onClick={() => setIsOpen((v) => !v)}
        style={{ right: dynamicRight, bottom: dynamicBottom }}
        className="fixed z-[110] w-14 h-14 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
      </button>

      {isOpen && (
        <div
          role="region"
          aria-label="Travel assistant"
          style={{ right: dynamicRight, bottom: chatWindowBottom }}
          className="fixed z-[110] w-[calc(100vw-48px)] max-w-sm bg-white rounded-3xl shadow-2xl max-h-[60vh] flex flex-col overflow-hidden"
        >
          <div className="bg-gradient-to-r from-pink-300 to-purple-300 p-4">
            <h3 className="font-serif text-lg font-semibold">Travel Assistant</h3>
            <p className="text-sm text-gray-700">
              {destinationContext?.name
                ? `Helping with ${destinationContext.displayName || destinationContext.name}`
                : 'Ask me anything!'}
            </p>
            <p className="text-xs text-gray-700 mt-2">
              AI planning assistance. Verify time-sensitive information with official sources.
            </p>
          </div>

          <div
            className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[150px] max-h-[280px] overscroll-contain"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-6">
                <Sparkles className="w-8 h-8 mx-auto mb-2 text-pink-400" />
                <p className="text-sm">
                  Ask about safety, packing, budgets, and best times to visit.
                </p>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[82%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user'
                      ? 'bg-pink-200 text-pink-900 rounded-br-md'
                      : 'bg-gray-100 text-gray-800 rounded-bl-md'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-2xl rounded-bl-md">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.1s' }}
                    />
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {messages.length === 0 && (
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              {quickSuggestions.map((s, i) => (
                <button
                  key={i}
                  disabled={isLoading}
                  onClick={() => sendMessage(s)}
                  className="text-xs px-3 py-1.5 bg-pink-100 text-pink-600 rounded-full hover:bg-pink-200"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="p-4 border-t">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                sendMessage(input)
              }}
              className="flex gap-2"
            >
              <input
                ref={chatInputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                aria-label="Ask the travel assistant"
                maxLength={2000}
                placeholder="Type your question..."
                className="flex-1 px-4 py-2 rounded-full border-2 border-gray-200 focus:border-pink-400 focus:outline-none text-sm"
              />
              <button
                type="submit"
                aria-label="Send question"
                disabled={isLoading || !input.trim()}
                className="w-10 h-10 bg-pink-400 rounded-full flex items-center justify-center hover:bg-pink-500 disabled:opacity-50"
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

// ─── Globe 2D fallback ────────────────────────────────────────────────────────
function GlobeFallback({ onSelectDestination }) {
  return (
    <div className="absolute inset-0 flex items-start justify-center overflow-y-auto pt-[220px] md:pt-[190px] pb-24 px-4">
      <div className="max-w-2xl w-full text-center">
        <div className="text-5xl mb-4">🌍</div>
        <h2 className="font-serif text-2xl font-bold text-white mb-2">3D Globe Unavailable</h2>
        <p className="text-white/70 text-sm mb-8 max-w-sm mx-auto">
          3D rendering isn&apos;t available in this browser right now. Explore destinations below.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-left">
          {featuredDestinations.map((dest) => (
            <button
              key={dest.id}
              onClick={() => onSelectDestination(dest)}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 hover:bg-white/20 transition-all text-left group"
            >
              <p className="font-semibold text-white text-sm">{dest.name}</p>
              <p className="text-white/60 text-xs mt-0.5">{dest.country}</p>
              <p className="text-pink-300 text-xs mt-2 group-hover:text-pink-200">View brief →</p>
            </button>
          ))}
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 mt-10 text-white/60 hover:text-white text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>
    </div>
  )
}

// ─── Main content ─────────────────────────────────────────────────────────────
function GlobePageContent() {
  const searchParams = useSearchParams()

  const containerRef = useRef(null)
  const globeRef = useRef(null)

  const [Globe, setGlobe] = useState(null)
  const [blocked, setBlocked] = useState(false)
  const [viewport, setViewport] = useState({ w: 0, h: 0 })
  const [isMobile, setIsMobile] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [searchError, setSearchError] = useState('')
  const [locationMessage, setLocationMessage] = useState('')
  const [reducedMotion, setReducedMotion] = useState(false)
  const [aiAvailable, setAiAvailable] = useState(false)
  const briefRequestId = useRef(0)
  const geoRequestId = useRef(0)
  useEffect(() => {
    fetch('/api/capabilities')
      .then((r) => r.json())
      .then((c) => setAiAvailable(c.ai))
      .catch(() => {})
  }, [])
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  const [showMarkers, setShowMarkers] = useState(true)
  const [tapAnywhere, setTapAnywhere] = useState(true)

  const [selectedDestination, setSelectedDestination] = useState(null)
  const [brief, setBrief] = useState(null)
  const [isLoadingBrief, setIsLoadingBrief] = useState(false)
  const [globeReady, setGlobeReady] = useState(false)
  const [panelHeightPx, setPanelHeightPx] = useState(0)
  const [chatOpenTrigger, setChatOpenTrigger] = useState(0)

  const tripContext = useMemo(() => getTripContextFromSearchParams(searchParams), [searchParams])

  const briefCacheRef = useRef(new Map())
  const briefAbortRef = useRef(null)
  const geoAbortRef = useRef(null)

  const briefKey = (d) => {
    const name = normalize(d?.name)
    const country = normalize(d?.country)
    if (!name || name === 'finding place…' || name === 'finding place...') return null
    return `brief:v3:${name}|${country}`
  }
  const getCachedBrief = useCallback((key) => {
    const mem = briefCacheRef.current.get(key)
    if (mem && Date.now() - mem.ts < 86400000) return mem.data
    let ls = null
    try {
      ls = JSON.parse(localStorage.getItem(key) || 'null')
    } catch {}
    if (ls && Date.now() - ls.ts < 86400000) {
      briefCacheRef.current.set(key, ls)
      return ls.data
    }
    return null
  }, [])
  const setCachedBrief = useCallback((key, data) => {
    const payload = { data, ts: Date.now() }
    briefCacheRef.current.set(key, payload)
    try {
      localStorage.setItem(key, JSON.stringify(payload))
    } catch {}
  }, [])
  useEffect(() => {
    const upd = () => setIsMobile(window.innerWidth < 768)
    upd()
    window.addEventListener('resize', upd)
    return () => window.removeEventListener('resize', upd)
  }, [])

  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver(([entry]) => {
      setViewport({
        w: Math.floor(entry.contentRect.width),
        h: Math.floor(entry.contentRect.height)
      })
    })
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!hasWebGL()) {
      setBlocked(true)
      return
    }
    ensureWebGpuEnums()
    let mounted = true
    import('react-globe.gl')
      .then((m) => {
        if (mounted) setGlobe(() => m.default)
      })
      .catch(() => {
        if (mounted) setBlocked(true)
      })
    return () => {
      mounted = false
    }
  }, [])

  const flyToLocation = useCallback(
    (lat, lng, altitude = 1.5) => {
      globeRef.current?.pointOfView({ lat, lng, altitude }, reducedMotion ? 0 : 900)
    },
    [reducedMotion]
  )

  const trackEvent = useCallback(
    (event_type, event_data) =>
      recordProductEvent(event_type, { ...event_data, placement: 'globe' }),
    []
  )

  const onGlobeReady = useCallback(() => {
    setGlobeReady(true)
    globeRef.current?.pointOfView({ lat: 20, lng: 10, altitude: isMobile ? 2 : 2.2 }, 0)
    try {
      const renderer = globeRef.current?.renderer?.()
      if (renderer && typeof window !== 'undefined') {
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2))
      }
      const controls = globeRef.current?.controls?.()
      if (controls) {
        controls.enableDamping = true
        controls.dampingFactor = 0.08
      }
    } catch {}
  }, [isMobile])

  const rendererConfig = useMemo(
    () => ({
      antialias: true,
      alpha: true,
      powerPreference: isMobile ? 'low-power' : 'high-performance'
    }),
    [isMobile]
  )

  const loadBrief = useCallback(
    async (destination) => {
      const id = ++briefRequestId.current
      briefAbortRef.current?.abort()
      setBrief(fallbackBrief(destination?.name))
      if (destination?.isRemoteArea || destination?.planningEligible === false) {
        setBrief({
          overview:
            destination.explanation ||
            'Explore this region by searching for a travel city. No city-specific brief has been generated.'
        })
        setIsLoadingBrief(false)
        return
      }
      const key = briefKey(destination)
      if (!key) return
      const cached = getCachedBrief(key)
      if (cached) {
        setBrief(cached)
        setIsLoadingBrief(false)
        return
      }
      const controller = new AbortController()
      briefAbortRef.current = controller
      setIsLoadingBrief(true)
      try {
        const response = await fetch('/api/ai/brief', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            placeName: destination.name,
            country: destination.country || '',
            lat: destination.lat,
            lng: destination.lng
          })
        })
        if (!response.ok) throw new Error('Brief unavailable')
        const data = await response.json()
        setCachedBrief(key, data)
        if (id === briefRequestId.current) setBrief(data)
      } catch {
        /* The labelled preparation checklist remains visible. */
      } finally {
        if (id === briefRequestId.current) setIsLoadingBrief(false)
      }
    },
    [getCachedBrief, setCachedBrief]
  )

  const selectDestination = useCallback(
    (destination, { track = true } = {}) => {
      setSelectedDestination(destination)
      loadBrief(destination)
      if (track)
        trackEvent('destination_clicked', {
          name: destination?.name,
          country: destination?.country
        })
    },
    [loadBrief, trackEvent]
  )

  useEffect(() => {
    const focus = searchParams.get('focus')
    if (!focus || (!globeReady && !blocked)) return
    const dest = featuredDestinations.find((d) => d.slug === focus)
    if (!dest) return
    setTimeout(() => {
      flyToLocation(dest.lat, dest.lng)
      selectDestination(dest, { track: true })
    }, 350)
  }, [searchParams, globeReady, blocked, flyToLocation, selectDestination])

  const handleMarkerClick = (point) => {
    geoRequestId.current++
    geoAbortRef.current?.abort()
    setLocationMessage('')
    flyToLocation(point.lat, point.lng)
    selectDestination(point, { track: true })
  }

  const handleGlobeClick = async ({ lat, lng }) => {
    if (!tapAnywhere) return
    const id = ++geoRequestId.current
    setLocationMessage('Identifying the selected area…')
    geoAbortRef.current?.abort()
    const controller = new AbortController()
    geoAbortRef.current = controller
    trackEvent('globe_location_selected', {})
    try {
      const response = await fetch('/api/geocode/reverse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({ lat, lng })
      })
      const data = await response.json()
      if (id !== geoRequestId.current) return
      if (!response.ok) throw new Error(data.error)
      const destination = { id: 'custom', ...data, ...normalizePlaceName(data), slug: 'custom' }
      selectDestination(destination)
      setLocationMessage(data.planningEligible ? '' : data.explanation)
    } catch (e) {
      if (e.name !== 'AbortError' && id === geoRequestId.current)
        setLocationMessage(
          e.message ||
            'We could not identify this location accurately. Search for a city or choose another destination.'
        )
    }
  }
  const chooseSearchResult = (data) => {
    geoRequestId.current++
    geoAbortRef.current?.abort()
    const destination = {
      id: 'search',
      ...data,
      ...normalizePlaceName(data),
      slug: data.slug || 'search'
    }
    flyToLocation(destination.lat, destination.lng)
    selectDestination(destination)
    setSearchResults([])
    setSearchQuery('')
    setSearchError('')
    setLocationMessage(
      data.planningEligible
        ? ''
        : data.explanation || 'Explore this region: search for a travel city.'
    )
  }
  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim() || searching) return
    setSearching(true)
    setSearchError('')
    setSearchResults([])
    trackEvent('destination_search', {})
    try {
      const response = await fetch('/api/geocode/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery.trim() })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      if (!data.length) setSearchError('No places found. Try a city and country.')
      else if (data.length === 1) chooseSearchResult(data[0])
      else setSearchResults(data)
    } catch (e) {
      setSearchError(e.message || 'Search unavailable. Please retry.')
    } finally {
      setSearching(false)
    }
  }

  return (
    <main
      id="main-content"
      ref={containerRef}
      className="relative h-[calc(100dvh-76px)] min-h-[580px] bg-[#0a0a1a]"
    >
      <h1 className="sr-only">Explore travel destinations on the globe</h1>
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-40 p-4 pointer-events-none">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/20 transition-colors pointer-events-auto"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
          <form onSubmit={handleSearch} className="flex-1 max-w-md pointer-events-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                aria-label="Search city, region or country"
                maxLength={120}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search city or country..."
                className="w-full pl-12 pr-10 py-3 bg-white/10 backdrop-blur-md text-white placeholder-gray-400 rounded-full border border-white/20 focus:border-pink-400 focus:outline-none"
              />
              {searching && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-pink-300 border-t-transparent rounded-full animate-spin" />
              )}
            </div>
            <button
              type="submit"
              disabled={searching}
              className="bg-white/15 text-white rounded-full px-4 py-2 mt-2 text-xs"
            >
              {searching ? 'Searching…' : 'Search places'}
            </button>
            {searchResults.length > 0 && (
              <ul
                className="bg-white rounded-2xl p-2 mt-2 text-gray-900 max-h-60 overflow-auto"
                aria-label="Place search results"
              >
                {searchResults.map((result, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      className="w-full text-left p-3 hover:bg-pink-50 rounded-xl text-sm"
                      onClick={() => chooseSearchResult(result)}
                    >
                      {result.name}
                      {result.country ? `, ${result.country}` : ''} <small>· {result.kind}</small>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <p role="status" className="text-white text-sm mt-2">
              {searchError}
            </p>
          </form>
        </div>

        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setTapAnywhere((v) => !v)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors pointer-events-auto ${
              tapAnywhere ? 'bg-pink-600 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            <MapPin className="w-4 h-4 inline mr-1" />
            Tap Anywhere {tapAnywhere ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={() => setShowMarkers((v) => !v)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors pointer-events-auto ${
              showMarkers
                ? 'bg-purple-600 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            Featured Markers {showMarkers ? 'ON' : 'OFF'}
          </button>
        </div>

        {tapAnywhere && (
          <p className="text-white/60 text-sm mt-2 bg-black/30 backdrop-blur-sm inline-block px-3 py-1 rounded-full">
            👆 Tap the globe to explore; place identification varies
          </p>
        )}
      </div>

      {locationMessage && (
        <p
          role="status"
          className="absolute left-4 right-4 top-[180px] z-40 text-sm text-white bg-black/70 rounded-xl p-3 max-w-sm pointer-events-none"
        >
          {locationMessage}
        </p>
      )}
      {/* Globe */}
      <div className="absolute inset-0">
        {blocked ? (
          <GlobeFallback onSelectDestination={selectDestination} />
        ) : !Globe || viewport.w === 0 ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center text-white">
              <div className="w-16 h-16 border-4 border-pink-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p>Loading Globe…</p>
            </div>
          </div>
        ) : (
          <Globe
            ref={globeRef}
            onGlobeReady={onGlobeReady}
            width={viewport.w}
            height={viewport.h}
            rendererConfig={rendererConfig}
            globeImageUrl={isMobile ? '/earth/earth-mobile.jpg' : '/earth/earth-day.jpg'}
            backgroundColor="#080c1c"
            atmosphereColor="#7fb6e8"
            atmosphereAltitude={0.16}
            pointsData={[
              ...(showMarkers
                ? featuredDestinations.map((d) => ({ ...d, _type: 'featured' }))
                : []),
              ...(selectedDestination ? [{ ...selectedDestination, _type: 'selected' }] : [])
            ]}
            pointLat={(d) => d.lat}
            pointLng={(d) => d.lng}
            pointColor={(d) => (d._type === 'selected' ? '#ffffff' : '#ff69b4')}
            pointAltitude={(d) => (d._type === 'selected' ? 0.06 : 0.02)}
            pointRadius={(d) => (d._type === 'selected' ? 0.6 : 0.35)}
            pointLabel={(d) => {
              const el = document.createElement('span')
              el.textContent = `${d.name}, ${d.country}`
              return el
            }}
            pointsMerge={false}
            onPointClick={handleMarkerClick}
            onGlobeClick={handleGlobeClick}
            enablePointerInteraction={true}
            ringsData={
              !reducedMotion && !isMobile && selectedDestination ? [selectedDestination] : []
            }
            ringLat={(d) => d.lat}
            ringLng={(d) => d.lng}
            ringColor={() => 'rgba(255,255,255,0.75)'}
            ringMaxRadius={3.5}
            ringPropagationSpeed={3}
            ringRepeatPeriod={900}
          />
        )}
      </div>

      <details className="absolute bottom-4 left-4 z-40 bg-black/75 text-white rounded-xl p-3 max-w-[220px]">
        <summary className="cursor-pointer text-xs">Choose a destination</summary>
        <div className="grid grid-cols-2 gap-1 mt-3">
          {featuredDestinations.map((d) => (
            <button
              className="text-xs text-left p-2 hover:bg-white/15 rounded"
              key={d.slug}
              onClick={() => handleMarkerClick(d)}
            >
              {d.name}
            </button>
          ))}
        </div>
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] underline block mt-3"
        >
          Geocoding © OpenStreetMap contributors
        </a>
      </details>
      {/* Selected place label (desktop, when no panel open) */}
      {selectedDestination && !isMobile && (
        <div className="absolute top-[88px] left-4 z-40 pointer-events-none">
          <div className="bg-black/50 backdrop-blur-md rounded-2xl px-4 py-2.5 border border-white/20 max-w-[220px]">
            <p className="text-white text-xs font-medium opacity-60 uppercase tracking-wide mb-0.5">
              Selected
            </p>
            <p className="text-white font-semibold text-sm leading-tight truncate">
              {selectedDestination.displayName || selectedDestination.name}
            </p>
            {(selectedDestination.subtitle || selectedDestination.country) && (
              <p className="text-white/70 text-xs mt-0.5 truncate">
                {selectedDestination.subtitle || selectedDestination.country}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Panel */}
      {selectedDestination && (
        <DestinationPanel
          destination={selectedDestination}
          brief={brief}
          isLoading={isLoadingBrief}
          tripContext={tripContext}
          onClose={() => {
            briefRequestId.current++
            briefAbortRef.current?.abort()
            setSelectedDestination(null)
            setBrief(null)
            setPanelHeightPx(0)
          }}
          onOpenChat={aiAvailable ? () => setChatOpenTrigger((t) => t + 1) : undefined}
          isMobile={isMobile}
          onHeightPxChange={setPanelHeightPx}
        />
      )}

      {aiAvailable && (
        <ChatWidget
          destinationContext={selectedDestination}
          isMobile={isMobile}
          panelOpen={!!selectedDestination}
          panelHeightPx={panelHeightPx}
          openTrigger={chatOpenTrigger}
        />
      )}
    </main>
  )
}

export default function GlobePage() {
  return (
    <Suspense
      fallback={
        <div
          id="main-content"
          className="relative h-[calc(100dvh-76px)] bg-[#0a0a1a] flex items-center justify-center"
        >
          <div className="text-center text-white">
            <div className="w-16 h-16 border-4 border-pink-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p>Loading Globe…</p>
          </div>
        </div>
      }
    >
      <GlobePageContent />
    </Suspense>
  )
}
