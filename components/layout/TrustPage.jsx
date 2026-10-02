export default function TrustPage({ title, intro, children }) {
  return (
    <main id="main-content" className="page-shell narrow">
      <p className="eyebrow">FeminTravel · transparency</p>
      <h1>{title}</h1>
      {intro && <p className="page-intro">{intro}</p>}
      <div className="prose-femin">{children}</div>
    </main>
  )
}
