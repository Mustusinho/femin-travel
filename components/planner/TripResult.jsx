'use client'
import { useState } from 'react'
import Link from 'next/link'
import BookingCTAs from '@/components/BookingCTAs'
import LeadCapture from '@/components/LeadCapture'
import { trackEvent } from '@/lib/events'
export default function TripResult({
  plan,
  input,
  mode,
  capabilities = {},
  existingToken,
  existingId
}) {
  const [token, setToken] = useState(existingToken || ''),
    [busy, setBusy] = useState(false),
    [status, setStatus] = useState(''),
    [emailStatus, setEmailStatus] = useState(''),
    [tripId, setTripId] = useState(existingId)
  async function save() {
    if (busy || token) return
    setBusy(true)
    setStatus('')
    try {
      const r = await fetch('/api/trips/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, input, mode })
      })
      const b = await r.json()
      if (!r.ok) throw new Error(b.error)
      setToken(b.token)
      setTripId(b.id)
      setStatus('Trip saved for 30 days. Keep the recovery link.')
      trackEvent('trip_saved', { placement: 'trip_result', trip_id: b.id })
    } catch (err) {
      setStatus(err.message || 'The trip was not saved. Please retry.')
    } finally {
      setBusy(false)
    }
  }
  const url = token
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/trips/${token}`
    : ''
  async function share() {
    try {
      if (navigator.share)
        await navigator.share({ title: `${input.destination} · FeminTravel`, url })
      else {
        await navigator.clipboard.writeText(url)
        setStatus('Trip link copied.')
      }
    } catch (e) {
      if (e.name !== 'AbortError')
        setStatus('Sharing is unavailable. Select and copy the recovery link below.')
    }
  }
  async function email(e) {
    e.preventDefault()
    if (emailStatus === 'Sending…') return
    setEmailStatus('Sending…')
    try {
      const r = await fetch('/api/trips/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email: new FormData(e.currentTarget).get('email') })
      })
      const b = await r.json()
      if (!r.ok) throw new Error(b.error)
      setEmailStatus('Trip email accepted for delivery.')
    } catch (err) {
      setEmailStatus(err.message || 'Email delivery failed.')
    }
  }
  const sections = [
    ['Arrival strategy', 'arrival'],
    ['Areas to consider', 'areas'],
    ['Transport guidance', 'transport'],
    ['Night planning', 'night'],
    ['Practical safety checklist', 'safety'],
    ['Packing suggestions', 'packing'],
    ['Food & activities', 'food'],
    ['Check before booking', 'verification']
  ]
  return (
    <div>
      <div className="result-banner">
        <span className="eyebrow">
          {mode === 'ai' ? 'AI-generated suggestions' : 'Personalized preparation checklist'}
        </span>
        <p>
          {mode === 'ai'
            ? 'These suggestions have not been checked against live sources.'
            : 'Destination-specific AI suggestions are unavailable. This framework reflects your choices and uses general preparation guidance.'}{' '}
          No safety rating or live prices are provided.
        </p>
      </div>
      <p className="page-intro mt-6">{plan.overview}</p>
      <div className="result-layout">
        <section>
          <h2 className="result-title">Your days, thoughtfully arranged</h2>
          <div className="itinerary">
            {plan.days.map((d) => (
              <article key={d.day} className="day-card">
                <p className="eyebrow">Day {d.day}</p>
                <h3>{d.title}</h3>
                {[
                  ['Morning', d.morning],
                  ['Afternoon', d.afternoon],
                  ['Evening', d.evening]
                ].map(([t, content]) => (
                  <div key={t}>
                    <h4>{t}</h4>
                    <p>{content}</p>
                  </div>
                ))}
              </article>
            ))}
          </div>
        </section>
        <aside className="result-sidebar">
          <h2>Keep your plan</h2>
          {capabilities.save && !token && (
            <>
              <p>
                Save an anonymous recovery link for 30 days. Anyone with the link can view the plan.
                Avoid private details.
              </p>
              <button className="btn-primary w-full mt-4" disabled={busy} onClick={save}>
                {busy ? 'Saving…' : 'Save & get recovery link'}
              </button>
            </>
          )}
          {!capabilities.save && !token && (
            <p>
              Cloud saving is unavailable on this deployment. This planner draft stays in the
              current browser tab. You can print or download the plan.
            </p>
          )}
          {token && (
            <>
              <label className="field-label mt-4">
                Recovery link
                <input
                  readOnly
                  value={url}
                  className="input-femin"
                  onFocus={(e) => e.target.select()}
                />
              </label>
              <button className="btn-secondary w-full mt-3" onClick={share}>
                Share or copy link
              </button>
              {capabilities.email && (
                <form className="mt-4 space-y-3" onSubmit={email}>
                  <label className="field-label">
                    Email this saved trip
                    <input
                      type="email"
                      name="email"
                      className="input-femin"
                      maxLength={254}
                      required
                    />
                  </label>
                  <p className="text-xs">One-time delivery only; no marketing subscription.</p>
                  <button className="btn-secondary" disabled={emailStatus === 'Sending…'}>
                    Send trip link
                  </button>
                  <p role="status">{emailStatus}</p>
                </form>
              )}
            </>
          )}
          <p role="status" className="text-sm mt-3">
            {status}
          </p>
          <button className="underline text-sm mt-4" onClick={() => window.print()}>
            Print / save as PDF
          </button>
          <Link href="/globe" className="block mt-5 text-sm underline">
            Explore the globe
          </Link>
          <Link href="/free-kit" className="block mt-3 text-sm underline">
            Open general planning kit
          </Link>
        </aside>
      </div>
      <div className="result-sections">
        {sections.map(([title, key]) => (
          <section className="result-section" key={key}>
            <h2>{title}</h2>
            <ul>
              {plan[key].map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <section className="result-section my-6">
        <h2>Budget overview</h2>
        <p>{plan.budget}</p>
        <p className="text-xs text-gray-600 mt-3">
          Estimates and preferences are planning guidance. Obtain current quotes before booking.
        </p>
      </section>
      <section className="result-section my-6">
        <h2>Book your trip</h2>
        <BookingCTAs
          destination={{ name: input.destination, country: input.country }}
          placement="trip_result"
          tripId={tripId}
        />
      </section>
      <LeadCapture placement="trip_result" />
    </div>
  )
}
