'use client'
export default function ErrorPage({ reset }) {
  return (
    <main id="main-content" className="page-shell narrow">
      <h1>Let’s try that again</h1>
      <p className="page-intro">
        This page couldn’t load. Your browser draft may still be available.
      </p>
      <button className="btn-primary" onClick={reset}>
        Try again
      </button>
    </main>
  )
}
