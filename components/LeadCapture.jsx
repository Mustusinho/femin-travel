'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { trackEvent } from '@/lib/events'
export default function LeadCapture({ placement = 'homepage' }) {
  const [cap, setCap] = useState(null),
    [busy, setBusy] = useState(false),
    [status, setStatus] = useState(''),
    [success, setSuccess] = useState(false)
  useEffect(() => {
    fetch('/api/capabilities')
      .then((r) => r.json())
      .then(setCap)
      .catch(() => {})
  }, [])
  async function submit(e) {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setStatus('')
    const data = new FormData(e.currentTarget)
    try {
      const r = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          email: data.get('email'),
          website: data.get('website'),
          consent: data.get('consent') === 'on',
          emailRequested: data.get('emailRequested') === 'on',
          source: 'free_kit'
        })
      })
      const b = await r.json()
      if (!r.ok) throw new Error(b.error)
      setSuccess(true)
      trackEvent('lead_captured', { placement })
      setStatus(
        b.emailSent
          ? 'Request saved. Your kit email was accepted for delivery.'
          : 'Request saved. Open the kit below; no email delivery is confirmed.'
      )
    } catch (err) {
      trackEvent('lead_capture_failed', { placement })
      setStatus(err.message || 'Please try again.')
    } finally {
      setBusy(false)
    }
  }
  return (
    <section id="free-kit" className="kit-capture">
      <div>
        <p className="eyebrow">A little preparation goes a long way</p>
        <h2>Free Solo Travel Planning Kit</h2>
        <p>
          General checklists for packing, arrival, documents, budget prep and emergency preparation.
          Use the planner for an itinerary based on your choices.
        </p>
        <Link
          href="/free-kit"
          className="btn-secondary inline-block mt-5"
          onClick={() => trackEvent('free_kit_requested', { placement })}
        >
          Open the free kit
        </Link>
      </div>
      {cap?.leads && (
        <form onSubmit={submit} className="space-y-3">
          <h3>Request your kit</h3>
          <label className="field-label">
            Name
            <input
              name="name"
              className="input-femin"
              maxLength={80}
              required
              autoComplete="given-name"
              disabled={busy || success}
            />
          </label>
          <label className="field-label">
            Email
            <input
              name="email"
              type="email"
              className="input-femin"
              maxLength={254}
              required
              autoComplete="email"
              disabled={busy || success}
            />
          </label>
          <label className="honeypot" aria-hidden="true">
            Website
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
          <label className="checkbox-label">
            <input name="consent" type="checkbox" required disabled={busy || success} /> Save my
            name and email for this request. See the <Link href="/privacy">Privacy Policy</Link>.
          </label>
          {cap.email && (
            <label className="checkbox-label">
              <input name="emailRequested" type="checkbox" disabled={busy || success} /> Send a
              one-time email with the kit link.
            </label>
          )}
          <p className="text-xs text-gray-600">This does not subscribe you to marketing.</p>
          <button className="btn-primary" disabled={busy || success}>
            {busy ? 'Saving…' : success ? 'Request saved' : 'Request kit'}
          </button>
          <p role="status" className="text-sm">
            {status}
          </p>
        </form>
      )}
    </section>
  )
}
