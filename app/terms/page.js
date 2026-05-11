import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service — FeminTravel',
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[hsl(30,33%,98%)] py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-sm text-[hsl(346,74%,55%)] hover:underline mb-8 inline-block">
          ← Back to FeminTravel
        </Link>

        <h1 className="font-['Playfair_Display'] text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-gray-400 text-sm mb-8">Last updated: May 2026</p>

        <div className="space-y-5 text-gray-600 leading-relaxed">
          <p>
            By using FeminTravel you agree to these terms. If you do not agree, please do not use the service.
          </p>
          <p>
            <strong className="text-gray-800">Use of content.</strong> AI-generated travel briefs, safety tips, and itineraries are provided for informational purposes only. Always verify safety and entry requirements with official government sources before traveling.
          </p>
          <p>
            <strong className="text-gray-800">Affiliate links.</strong> Some links on FeminTravel are affiliate links. We may earn a commission if you book through them at no extra cost to you. We only feature partners we consider reputable.
          </p>
          <p>
            <strong className="text-gray-800">Limitation of liability.</strong> FeminTravel is not responsible for any loss or harm arising from travel decisions made using information on this site. Travel at your own risk and judgment.
          </p>
          <p>
            <strong className="text-gray-800">Changes.</strong> We may update these terms at any time. Continued use of FeminTravel constitutes acceptance of the updated terms.
          </p>
          <p>
            Questions?{' '}
            <a href="mailto:hello@femintravel.com" className="text-[hsl(346,74%,55%)] underline">
              hello@femintravel.com
            </a>
          </p>
        </div>
      </div>
    </main>
  )
}
