'use client'
import { useEffect, useRef, useState } from 'react'
import { tripSchema } from '@/lib/validation.mjs'
import { trackEvent } from '@/lib/events'
import TripResult from './TripResult'
const defaults = {
  destination: '',
  country: '',
  flexible: true,
  startDate: '',
  endDate: '',
  days: 5,
  budget: 'comfortable',
  companions: 'solo',
  style: 'mixed',
  interests: [],
  safety: [],
  accommodation: 'flexible',
  pace: 'balanced',
  passportNotes: ''
}
const steps = ['Where & when', 'Your travel rhythm', 'What matters to you', 'Review & create']
const interests = [
  'Food',
  'Art & museums',
  'Nature',
  'Architecture',
  'Local culture',
  'Beaches',
  'Shopping',
  'Walking'
]
const safety = [
  'Avoid late arrivals',
  'Prefer staffed accommodation',
  'Plan return transport',
  'Keep trusted contacts updated',
  'Allow extra rest time'
]
function Choice({ label, name, value, options, onChange }) {
  return (
    <label className="field-label">
      {label}
      <select
        className="input-femin"
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </label>
  )
}
export default function Planner({ initialDestination }) {
  const [input, setInput] = useState({
      ...defaults,
      destination: initialDestination.slice(0, 120)
    }),
    [step, setStep] = useState(0),
    [ready, setReady] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [result, setResult] = useState(null),
    [cap, setCap] = useState({}),
    heading = useRef(null)
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem('femintravel-draft') || 'null')
      if (saved) {
        setInput({
          ...defaults,
          ...saved.input,
          ...(initialDestination ? { destination: initialDestination, passportNotes: '' } : {})
        })
        if (!initialDestination || initialDestination === saved.input?.destination) {
          setStep(saved.step || 0)
          if (saved.result) setResult(saved.result)
        }
      }
    } catch {}
    setReady(true)
    fetch('/api/capabilities')
      .then((r) => r.json())
      .then(setCap)
      .catch(() => {})
  }, [initialDestination])
  useEffect(() => {
    if (ready)
      try {
        sessionStorage.setItem(
          'femintravel-draft',
          JSON.stringify({ input: { ...input, passportNotes: '' }, step, result })
        )
      } catch {}
  }, [ready, input, step, result])
  useEffect(() => {
    if (ready) heading.current?.focus()
  }, [step, result, ready])
  function update(k, v) {
    setInput((prev) => ({ ...prev, [k]: v }))
    setError('')
  }
  function toggle(k, v) {
    update(k, input[k].includes(v) ? input[k].filter((x) => x !== v) : [...input[k], v])
  }
  function next() {
    const parsed = tripSchema.safeParse(input)
    if (step === 0 && !parsed.success) {
      setError(parsed.error.issues[0].message)
      return
    }
    trackEvent('trip_step_completed', { step, placement: 'plan' })
    setStep(step + 1)
  }
  async function generate(e) {
    e.preventDefault()
    if (step < 3) {
      next()
      return
    }
    if (busy) return
    const parsed = tripSchema.safeParse(input)
    if (!parsed.success) {
      setError(parsed.error.issues[0].message)
      return
    }
    setBusy(true)
    setError('')
    trackEvent('trip_started', { destination: input.destination, placement: 'plan' })
    try {
      const r = await fetch('/api/trips/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data)
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error)
      setResult(data)
      trackEvent('trip_generated', {
        destination: input.destination,
        mode: data.mode,
        placement: 'plan'
      })
    } catch (err) {
      setError(err.message || 'Could not create your plan. Please retry.')
      trackEvent('trip_generation_failed', { placement: 'plan' })
    } finally {
      setBusy(false)
    }
  }
  function clear() {
    try {
      sessionStorage.removeItem('femintravel-draft')
    } catch {}
    setInput({ ...defaults })
    setResult(null)
    setStep(0)
    setError('')
  }
  if (result)
    return (
      <>
        <h1 ref={heading} tabIndex={-1}>
          Your {input.destination} trip
        </h1>
        <TripResult plan={result.plan} input={input} mode={result.mode} capabilities={cap} />
        <div className="flex gap-4 flex-wrap mt-8">
          <button
            className="btn-secondary"
            onClick={() => {
              setResult(null)
              setStep(3)
            }}
          >
            Edit your choices
          </button>
          <button className="underline text-sm" onClick={clear}>
            Clear draft
          </button>
        </div>
      </>
    )
  return (
    <div className="planner-layout">
      <aside className="planner-aside">
        <p className="eyebrow">Your trip, your priorities</p>
        <h1>Make room for the journey.</h1>
        <p className="page-intro">
          Tell us a little about the trip you have in mind. We’ll bring the days, arrival
          arrangements and practical preparation together.
        </p>
        <div className="planner-note">
          <strong>Thoughtful planning, honest limits</strong>
          <p>
            {cap.ai
              ? 'AI suggestions need your review.'
              : 'AI generation is unavailable on this deployment. You can create a preparation checklist tailored to your choices.'}{' '}
            Check current rules and availability with official sources.
          </p>
        </div>
        <p className="text-xs text-gray-600 mt-6">
          Your draft stays on this browser tab. Passport notes are excluded from the stored draft.{' '}
          <button className="underline" onClick={clear}>
            Clear draft
          </button>
        </p>
      </aside>
      <section className="planner-card">
        <ol aria-label="Planning progress" className="step-progress">
          {steps.map((label, i) => (
            <li key={label} aria-current={step === i ? 'step' : undefined}>
              <span>{i + 1}</span>
              <small>{label}</small>
            </li>
          ))}
        </ol>
        <progress
          value={step + 1}
          max={4}
          aria-label={`Step ${step + 1} of 4`}
          className="planner-progress"
        />
        <h2 ref={heading} tabIndex={-1}>
          {steps[step]}
        </h2>
        <form onSubmit={generate}>
          {step === 0 && (
            <div className="space-y-5">
              <label className="field-label">
                Destination
                <input
                  className="input-femin"
                  value={input.destination}
                  onChange={(e) => update('destination', e.target.value)}
                  maxLength={120}
                  autoComplete="off"
                  placeholder="City or region, e.g. Lisbon"
                  required
                />
              </label>
              <label className="field-label">
                Country (optional)
                <input
                  className="input-femin"
                  value={input.country}
                  onChange={(e) => update('country', e.target.value)}
                  maxLength={80}
                />
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={input.flexible}
                  onChange={(e) => update('flexible', e.target.checked)}
                />{' '}
                My dates are flexible
              </label>
              {input.flexible ? (
                <label className="field-label">
                  Trip length (1–14 days)
                  <input
                    className="input-femin"
                    type="number"
                    min={1}
                    max={14}
                    value={input.days}
                    onChange={(e) => update('days', Number(e.target.value))}
                  />
                </label>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="field-label">
                    Arrival date
                    <input
                      className="input-femin"
                      type="date"
                      value={input.startDate}
                      onChange={(e) => update('startDate', e.target.value)}
                    />
                  </label>
                  <label className="field-label">
                    Departure date
                    <input
                      className="input-femin"
                      type="date"
                      min={input.startDate}
                      value={input.endDate}
                      onChange={(e) => update('endDate', e.target.value)}
                    />
                  </label>
                </div>
              )}
              <p className="text-xs text-gray-600">
                Plan up to 14 days at a time. Exact dates don’t imply checked availability.
              </p>
            </div>
          )}
          {step === 1 && (
            <div className="grid sm:grid-cols-2 gap-5">
              <Choice
                label="Travel companions"
                value={input.companions}
                options={['solo', 'friends', 'couple', 'family'].map((x) => [x, x])}
                onChange={(v) => update('companions', v)}
              />
              <Choice
                label="Budget level"
                value={input.budget}
                options={['budget', 'comfortable', 'luxury'].map((x) => [x, x])}
                onChange={(v) => update('budget', v)}
              />
              <Choice
                label="Travel style"
                value={input.style}
                options={['mixed', 'culture', 'relaxation', 'adventure'].map((x) => [x, x])}
                onChange={(v) => update('style', v)}
              />
              <Choice
                label="Pace"
                value={input.pace}
                options={['slow', 'balanced', 'active'].map((x) => [x, x])}
                onChange={(v) => update('pace', v)}
              />
              <Choice
                label="Accommodation preference"
                value={input.accommodation}
                options={['flexible', 'hotel', 'hostel', 'apartment'].map((x) => [x, x])}
                onChange={(v) => update('accommodation', v)}
              />
            </div>
          )}
          {step === 2 && (
            <div className="space-y-6">
              <fieldset>
                <legend className="field-label mb-3">Interests (optional)</legend>
                <div className="choice-grid">
                  {interests.map((v) => (
                    <label key={v} className="choice-chip">
                      <input
                        type="checkbox"
                        checked={input.interests.includes(v)}
                        onChange={() => toggle('interests', v)}
                      />
                      {v}
                    </label>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className="field-label mb-3">
                  Practical safety preferences (optional)
                </legend>
                <div className="space-y-3">
                  {safety.map((v) => (
                    <label key={v} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={input.safety.includes(v)}
                        onChange={() => toggle('safety', v)}
                      />
                      {v}
                    </label>
                  ))}
                </div>
              </fieldset>
              <label className="field-label">
                Passport or visa planning constraints (optional)
                <textarea
                  className="input-femin"
                  rows={3}
                  maxLength={300}
                  value={input.passportNotes}
                  onChange={(e) => update('passportNotes', e.target.value)}
                  placeholder="For example: I need to check transit visa requirements."
                />
              </label>
              <p className="text-xs text-gray-600">
                Do not enter passport numbers, medical details or other sensitive information. When
                AI is enabled, these notes are sent to OpenAI for generation only. AI does not
                verify visa eligibility.
              </p>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-5">
              <dl className="review-grid">
                {[
                  ['Destination', [input.destination, input.country].filter(Boolean).join(', ')],
                  [
                    'Dates',
                    input.flexible
                      ? `${input.days} days, flexible`
                      : `${input.startDate} to ${input.endDate}`
                  ],
                  ['Travel', `${input.companions} · ${input.budget} · ${input.pace}`],
                  ['Interests', input.interests.join(', ') || input.style],
                  ['Accommodation', input.accommodation],
                  ['Planning priorities', input.safety.join(', ') || 'General preparation']
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
              <p className="planner-note">
                {cap.ai
                  ? 'Your choices are sent to AI for itinerary suggestions.'
                  : 'You’ll receive a planning checklist; destination-specific AI suggestions are unavailable.'}{' '}
                Review every suggestion before booking. Saving is optional and only available when
                configured.
              </p>
            </div>
          )}
          <p role="alert" className="form-error">
            {error}
          </p>
          <div className="planner-actions">
            {step > 0 && (
              <button
                type="button"
                className="btn-secondary"
                disabled={busy}
                onClick={() => setStep(step - 1)}
              >
                Back
              </button>
            )}
            {step < 3 ? (
              <button
                type="button"
                className="btn-primary"
                onClick={(e) => {
                  e.preventDefault()
                  next()
                }}
              >
                Continue
              </button>
            ) : (
              <button type="submit" className="btn-primary" disabled={busy}>
                {busy
                  ? 'Creating your plan…'
                  : cap.ai
                    ? 'Create my itinerary'
                    : 'Create my planning checklist'}
              </button>
            )}
          </div>
          {busy && (
            <p role="status" className="text-sm mt-4">
              Preparing your plan. This may take a moment.
            </p>
          )}
        </form>
      </section>
    </div>
  )
}
