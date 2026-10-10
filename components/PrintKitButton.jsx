'use client'

export default function PrintKitButton() {
  return (
    <button type="button" onClick={() => window.print()} className="btn-primary">
      Print or save kit as PDF
    </button>
  )
}
