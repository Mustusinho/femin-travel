import Link from 'next/link'

export const metadata = {
  title: 'Contact — FeminTravel',
}

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[hsl(30,33%,98%)] py-20 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <Link href="/" className="text-sm text-[hsl(346,74%,55%)] hover:underline mb-8 inline-block">
          ← Back to FeminTravel
        </Link>

        <h1 className="font-['Playfair_Display'] text-3xl font-bold mb-4">Get in Touch</h1>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Questions, feedback, or partnership inquiries? We&apos;d love to hear from you.
        </p>

        <a
          href="mailto:hello@femintravel.com"
          className="inline-flex items-center gap-2 bg-[hsl(346,74%,85%)] text-[hsl(346,74%,25%)]
                     font-semibold py-3 px-8 rounded-2xl hover:bg-[hsl(346,74%,75%)] transition-colors"
        >
          hello@femintravel.com
        </a>

        <p className="text-gray-400 text-sm mt-8">We aim to respond within 2 business days.</p>
      </div>
    </main>
  )
}
