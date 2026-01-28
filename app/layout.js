import './globals.css'

export const metadata = {
  title: 'FeminTravel - Solo Female Travel Guide',
  description: 'AI-powered travel guides for solo female travelers. Safety tips, packing lists, budget planning, and smart travel advice.',
  keywords: 'solo female travel, women travel, travel safety, travel guide, AI travel assistant',
  openGraph: {
    title: 'FeminTravel - Solo Female Travel Guide',
    description: 'Explore the world safely & confidently with AI-powered travel guides.',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>✈️</text></svg>" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
