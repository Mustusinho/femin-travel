'use client'

import GlobeHero from '@/components/GlobeHero'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Menu,
  X,
  Globe as GlobeIcon,
  BookOpen,
  Gift,
  Send,
  MessageCircle,
  ChevronRight,
  Shield,
  Sparkles,
  Users,
  MapPin,
  Heart,
} from 'lucide-react'

// Header Component
function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-transparent'
      }`}
    >
      <div className="container-femin">
        <div className="flex items-center justify-between h-16 md:h-20 px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">✈️</span>
            <span className="font-['Playfair_Display'] text-xl md:text-2xl font-bold text-gradient">
              FeminTravel
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/globe"
              className="flex items-center gap-2 text-gray-700 hover:text-[hsl(346,74%,65%)] transition-colors font-medium"
            >
              <GlobeIcon className="w-4 h-4" />
              Globe
            </Link>

            <Link
              href="/blog"
              className="flex items-center gap-2 text-gray-700 hover:text-[hsl(346,74%,65%)] transition-colors font-medium"
            >
              <BookOpen className="w-4 h-4" />
              Blog
            </Link>

            <Link href="/#free-kit" className="btn-primary text-sm">
              <Gift className="w-4 h-4 inline mr-2" />
              Free Kit
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 text-gray-700" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg animate-slide-up">
            <nav className="flex flex-col p-4 gap-4">
              <Link
                href="/globe"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-[hsl(346,74%,95%)] transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <GlobeIcon className="w-5 h-5 text-[hsl(346,74%,65%)]" />
                <span className="font-medium">Explore Globe</span>
              </Link>

              <Link
                href="/blog"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-[hsl(346,74%,95%)] transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <BookOpen className="w-5 h-5 text-[hsl(346,74%,65%)]" />
                <span className="font-medium">Blog</span>
              </Link>

              <Link
                href="/#free-kit"
                className="btn-primary text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                <Gift className="w-4 h-4 inline mr-2" />
                Get Free Kit
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

// Chat Widget Component
function ChatWidget({ destinationContext = null }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const quickSuggestions = ['Is it safe?', 'What to pack?', 'Budget tips?', 'Best time to visit?']

  const sendMessage = async (text) => {
    if (!text.trim()) return

    const userMessage = { role: 'user', content: text }
    const nextMessages = [...messages, userMessage]

    setMessages(nextMessages)
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages,
          destinationContext,
        }),
      })

      const data = await response.json()
      setMessages((prev) => [...prev, { role: 'assistant', content: data.response }])
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "I'm having trouble connecting. Please try again in a moment!",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-[hsl(346,74%,75%)] to-[hsl(270,50%,75%)]
                   rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
      >
        {isOpen ? <X className="w-6 h-6 text-white" /> : <MessageCircle className="w-6 h-6 text-white" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 w-[calc(100vw-48px)] md:w-96
                        bg-white rounded-3xl shadow-2xl animate-slide-up
                        max-h-[70vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[hsl(346,74%,85%)] to-[hsl(270,50%,85%)] p-4">
            <h3 className="font-['Playfair_Display'] text-lg font-semibold text-gray-800">Travel Assistant</h3>
            <p className="text-sm text-gray-600">
              {destinationContext ? `Helping with ${destinationContext.name}` : 'Ask me anything!'}
            </p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar min-h-[200px] max-h-[300px]">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <Sparkles className="w-8 h-8 mx-auto mb-2 text-[hsl(346,74%,75%)]" />
                <p className="text-sm">Hi! I'm your travel assistant.</p>
                <p className="text-sm">Ask me about destinations, safety, packing, or budget!</p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 ${msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant'}`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="chat-bubble-assistant p-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          {messages.length === 0 && (
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              {quickSuggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(suggestion)}
                  className="text-xs px-3 py-1.5 bg-[hsl(346,74%,95%)] text-[hsl(346,74%,45%)]
                             rounded-full hover:bg-[hsl(346,74%,90%)] transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-gray-100">
            <form onSubmit={(e) => { e.preventDefault(); sendMessage(input) }} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your question..."
                className="flex-1 px-4 py-2 rounded-full border-2 border-gray-200
                           focus:border-[hsl(346,74%,75%)] focus:outline-none text-sm"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="w-10 h-10 bg-[hsl(346,74%,75%)] rounded-full flex items-center justify-center
                           hover:bg-[hsl(346,74%,65%)] transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

// Hero Section
function HeroSection() {
  return (
    <section className="relative bg-gradient-femin pt-20">
      <div className="container-femin px-4 py-14 md:py-20">
        <div className="mx-auto max-w-4xl text-center animate-fade-in">
          <h1 className="font-['Playfair_Display'] text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
            Explore the World <span className="text-gradient">Safely &amp; Confidently</span>
          </h1>

          <p className="mt-5 text-base md:text-xl text-gray-600 mx-auto max-w-2xl">
            AI-powered travel guides for solo female travelers — safety tips, packing lists, budget planning, and smart travel advice.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/globe" className="btn-primary text-base md:text-lg px-8 py-4">
              <GlobeIcon className="w-5 h-5 inline mr-2" />
              Explore the Globe
            </Link>

            <a href="#free-kit" className="btn-secondary text-base md:text-lg px-8 py-4">
              <Gift className="w-5 h-5 inline mr-2" />
              Get Free Travel Kit
            </a>
          </div>

          <div className="mt-10">
            <GlobeHero />
          </div>

          <p className="mt-3 text-xs text-gray-500">
            Tip: tap any place on the globe to jump into the full explorer.
          </p>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[hsl(30,33%,98%)] to-transparent" />
    </section>
  )
}

// Why Choose Section
function WhyChooseSection() {
  const features = [
    { icon: Shield, title: 'Safety First', description: 'Curated safety tips and neighborhood guides specifically for solo female travelers.' },
    { icon: Sparkles, title: 'AI-Powered Insights', description: 'Get personalized travel briefs with packing lists, budgets, and local tips instantly.' },
    { icon: Users, title: 'Global Sisterhood', description: 'Join a community of confident women exploring the world on their own terms.' }
  ]

  return (
    <section className="section-padding bg-white">
      <div className="container-femin">
        <h2 className="font-['Playfair_Display'] text-3xl md:text-4xl font-bold text-center mb-4">
          Why Choose <span className="text-gradient">FeminTravel</span>
        </h2>
        <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Designed by solo travelers, for solo travelers
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className="card-femin text-center" style={{ animationDelay: `${idx * 0.1}s` }}>
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-[hsl(346,74%,90%)] to-[hsl(270,50%,90%)]
                              rounded-2xl flex items-center justify-center">
                <feature.icon className="w-8 h-8 text-[hsl(346,74%,55%)]" />
              </div>
              <h3 className="font-['Playfair_Display'] text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// How It Works Section
function HowItWorksSection() {
  const steps = [
    { number: '01', title: 'Tap the Globe', description: 'Click anywhere on our interactive 3D globe or search for your dream destination.' },
    { number: '02', title: 'Get Your AI Brief', description: 'Receive instant, detailed travel guides with safety tips, packing lists, and budgets.' },
    { number: '03', title: 'Plan & Book Safely', description: 'Use our curated affiliate links for hotels, flights, and travel insurance.' }
  ]

  return (
    <section className="section-padding bg-gradient-femin">
      <div className="container-femin">
        <h2 className="font-['Playfair_Display'] text-3xl md:text-4xl font-bold text-center mb-4">
          How It Works
        </h2>
        <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Three simple steps to your next adventure
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, idx) => (
            <div key={idx} className="relative">
              <span className="font-['Playfair_Display'] text-7xl font-bold text-[hsl(346,74%,90%)]">
                {step.number}
              </span>
              <h3 className="font-['Playfair_Display'] text-xl font-semibold mb-2 -mt-4">
                {step.title}
              </h3>
              <p className="text-gray-600">{step.description}</p>
              {idx < steps.length - 1 && (
                <ChevronRight className="hidden md:block absolute top-1/2 -right-4 w-8 h-8 text-[hsl(346,74%,80%)]" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Featured Destinations Section
function FeaturedDestinations() {
  const router = useRouter()

  const destinations = [
    { name: 'Tokyo', country: 'Japan', slug: 'tokyo', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600' },
    { name: 'Paris', country: 'France', slug: 'paris', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600' },
    { name: 'Rome', country: 'Italy', slug: 'rome', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600' },
    { name: 'Bali', country: 'Indonesia', slug: 'bali', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600' },
    { name: 'Lisbon', country: 'Portugal', slug: 'lisbon', image: 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=600' },
    { name: 'New York', country: 'USA', slug: 'new-york', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600' }
  ]

  return (
    <section className="section-padding bg-white">
      <div className="container-femin">
        <h2 className="font-['Playfair_Display'] text-3xl md:text-4xl font-bold text-center mb-4">
          Featured Destinations
        </h2>
        <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Popular spots loved by solo female travelers
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((dest, idx) => (
            <div
              key={idx}
              className="group relative overflow-hidden rounded-3xl aspect-[4/3] cursor-pointer"
              onClick={() => router.push(`/globe?focus=${dest.slug}`)}
            >
              <img
                src={dest.image}
                alt={dest.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="font-['Playfair_Display'] text-2xl font-bold text-white mb-1">
                  {dest.name}
                </h3>
                <p className="text-white/80 text-sm mb-3">{dest.country}</p>
                <span
                  className="inline-flex items-center gap-2 text-sm text-white bg-white/20
                             backdrop-blur-sm px-4 py-2 rounded-full
                             group-hover:bg-[hsl(346,74%,75%)] transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                  View on Globe
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Lead Magnet Section
function LeadMagnetSection() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email })
      })

      if (response.ok) router.push('/thanks')
      else {
        const data = await response.json()
        setError(data.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setError('Connection error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section
      id="free-kit"
      className="section-padding bg-gradient-to-br from-[hsl(346,74%,90%)] via-[hsl(300,40%,95%)] to-[hsl(270,50%,90%)]"
    >
      <div className="container-femin">
        <div className="max-w-xl mx-auto text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-white rounded-3xl shadow-lg flex items-center justify-center">
            <Gift className="w-10 h-10 text-[hsl(346,74%,65%)]" />
          </div>

          <h2 className="font-['Playfair_Display'] text-3xl md:text-4xl font-bold mb-4">
            Free Solo Luxe Travel Kit
          </h2>

          <p className="text-gray-700 mb-8">
            Get our exclusive packing checklist, safety guide, and budget planner — everything you need for your next adventure!
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="input-femin"
            />

            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-femin"
            />

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full text-lg py-4 disabled:opacity-50"
            >
              {isSubmitting ? 'Sending...' : 'Send My Free Kit'}
            </button>
          </form>

          <p className="text-sm text-gray-500 mt-4">No spam. Unsubscribe anytime.</p>
        </div>
      </div>
    </section>
  )
}

// Footer
function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="container-femin px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">✈️</span>
              <span className="font-['Playfair_Display'] text-2xl font-bold">FeminTravel</span>
            </div>
            <p className="text-gray-400 max-w-md">
              Empowering solo female travelers to explore the world safely and confidently with AI-powered travel guides.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/globe" className="hover:text-white transition-colors">Explore Globe</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              <li><a href="#free-kit" className="hover:text-white transition-colors">Free Kit</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © 2025 FeminTravel. Made with <Heart className="w-4 h-4 inline text-[hsl(346,74%,65%)]" /> for solo travelers.
          </p>
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors">
              <span className="sr-only">Instagram</span>📷
            </a>
            <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors">
              <span className="sr-only">Twitter</span>🐦
            </a>
            <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors">
              <span className="sr-only">YouTube</span>🎥
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

// Main Page Component
export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <WhyChooseSection />
      <HowItWorksSection />
      <FeaturedDestinations />
      <LeadMagnetSection />
      <Footer />
      <ChatWidget />
    </main>
  )
}
