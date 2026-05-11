import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy — FeminTravel',
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[hsl(30,33%,98%)] py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-sm text-[hsl(346,74%,55%)] hover:underline mb-8 inline-block">
          ← Back to FeminTravel
        </Link>

        <h1 className="font-['Playfair_Display'] text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-gray-400 text-sm mb-8">Last updated: May 2026</p>

        <div className="space-y-5 text-gray-600 leading-relaxed">
          <p>
            FeminTravel collects only the name and email address you voluntarily provide when signing up. This information is used solely to send you travel resources and updates related to FeminTravel.
          </p>
          <p>
            We do not sell, rent, or share your personal information with third parties for their marketing purposes. We use reputable service providers to store data and deliver emails; these providers process data on our behalf under confidentiality agreements.
          </p>
          <p>
            We use cookies and similar technologies to understand how visitors use the site (analytics only). No tracking data is sold.
          </p>
          <p>
            You may request deletion of your data or unsubscribe at any time by emailing{' '}
            <a href="mailto:hello@femintravel.com" className="text-[hsl(346,74%,55%)] underline">
              hello@femintravel.com
            </a>
            .
          </p>
          <p>
            This policy will be updated as the service grows. Continued use of FeminTravel after updates constitutes acceptance of the revised policy.
          </p>
        </div>
      </div>
    </main>
  )
}
