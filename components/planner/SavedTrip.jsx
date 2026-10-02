'use client'
import { useEffect, useState } from 'react'
import TripResult from './TripResult'
export default function SavedTrip({ token }) {
  const [trip, setTrip] = useState(null),
    [error, setError] = useState(''),
    [cap, setCap] = useState({})
  useEffect(() => {
    let active = true
    fetch(`/api/trips/${token}`)
      .then(async (r) => {
        const b = await r.json()
        if (!r.ok) throw new Error(b.error)
        if (active) setTrip(b)
      })
      .catch((e) => {
        if (active) setError(e.message)
      })
    fetch('/api/capabilities')
      .then((r) => r.json())
      .then(setCap)
      .catch(() => {})
    return () => {
      active = false
    }
  }, [token])
  if (error)
    return (
      <>
        <h1>Trip unavailable</h1>
        <p role="alert">{error}</p>
        <a href="/plan" className="btn-primary inline-block mt-6">
          Plan a new trip
        </a>
      </>
    )
  if (!trip) return <p role="status">Loading your saved trip…</p>
  return (
    <>
      <h1>Your {trip.preferences.destination} trip</h1>
      <p className="text-sm mb-5">
        Available until {new Date(trip.expires_at).toLocaleDateString('en-GB')}.
      </p>
      <TripResult
        plan={trip.plan}
        input={trip.preferences}
        mode={trip.mode}
        capabilities={cap}
        existingToken={token}
        existingId={trip.id}
      />
    </>
  )
}
