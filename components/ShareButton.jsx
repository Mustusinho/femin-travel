'use client'
import { useState } from 'react'
export default function ShareButton({ title }) {
  const [status, setStatus] = useState('')
  async function share() {
    try {
      const url = window.location.href
      if (navigator.share) await navigator.share({ title, url })
      else {
        await navigator.clipboard.writeText(url)
        setStatus('Link copied.')
      }
    } catch (e) {
      if (e.name !== 'AbortError')
        setStatus('Sharing is unavailable in this browser. Copy the address from your address bar.')
    }
  }
  return (
    <div className="mt-8">
      <button onClick={share} className="btn-secondary">
        Share this guide
      </button>
      <p role="status" className="text-sm mt-2">
        {status}
      </p>
    </div>
  )
}
