import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { readConfig } from '@/lib/config.mjs'
import { Playfair_Display, Inter } from 'next/font/google'

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-playfair',
  display: 'swap'
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
})

const config = readConfig()
export const metadata = {
  metadataBase: config.appUrl ? new URL(config.appUrl) : undefined,
  title: {
    default: 'FeminTravel — Thoughtful trips, beautifully planned',
    template: '%s | FeminTravel'
  },
  description:
    'AI-powered travel planning for women and friends. Itineraries, arrival preparation and practical safety checklists.',
  robots: { index: config.indexable, follow: config.indexable },
  openGraph: {
    title: 'FeminTravel',
    description: 'Thoughtful trips, beautifully planned.',
    type: 'website'
  },
  twitter: { card: 'summary_large_image' }
}
export const viewport = { width: 'device-width', initialScale: 1 }

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="antialiased">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  )
}
