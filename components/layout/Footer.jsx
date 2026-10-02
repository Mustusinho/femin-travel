import Link from 'next/link'
import { socialLinks } from '@/lib/config.mjs'
export default function Footer() {
  const socials = socialLinks()
  return (
    <footer className="trust-footer">
      <div className="footer-grid">
        <div>
          <Link href="/" className="brand">
            ✦ FeminTravel
          </Link>
          <p>AI-powered travel planning for safer, smarter trips.</p>
          <p>
            Thoughtful preparation for women and friends, from the first idea to the journey home.
          </p>
        </div>
        <div>
          <h2>Plan</h2>
          {[
            ['Plan a trip', '/plan'],
            ['Explore destinations', '/destinations'],
            ['Explore globe', '/globe'],
            ['Free Travel Kit', '/free-kit'],
            ['Travel guides', '/blog']
          ].map(([label, href]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </div>
        <div>
          <h2>Company</h2>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          {socials.length > 0 && (
            <>
              <h2 className="mt-6">Follow FeminTravel</h2>
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`FeminTravel on ${s.label} (opens in new tab)`}
                >
                  {s.label}
                </a>
              ))}
            </>
          )}
        </div>
        <div>
          <h2>Legal &amp; support</h2>
          {[
            ['Privacy Policy', '/privacy'],
            ['Terms of Use', '/terms'],
            ['Affiliate Disclosure', '/affiliate-disclosure'],
            ['Storage & Cookies', '/cookies'],
            ['Accessibility', '/accessibility']
          ].map(([label, href]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </div>
      </div>
      <div className="footer-notes">
        <p>
          AI guidance is planning assistance. Verify entry requirements, travel advisories,
          schedules and health guidance with official sources before booking.
        </p>
        <p>
          Some booking links may be affiliate links. Where configured, FeminTravel may earn a
          commission. Links are labelled so you can tell.
        </p>
        <p>© {new Date().getFullYear()} FeminTravel</p>
      </div>
    </footer>
  )
}
