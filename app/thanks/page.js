'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Check, Download, Globe, Plane, Hotel, Shield, Heart, Gift, MessageCircle, Send, X, Sparkles } from 'lucide-react'

// Chat Widget
function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text) => {
    if (!text.trim()) return
    const userMessage = { role: 'user', content: text }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] })
      })
      const data = await response.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble. Please try again!" }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-[hsl(346,74%,75%)] to-[hsl(270,50%,75%)] 
                   rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform">
        {isOpen ? <X className="w-6 h-6 text-white" /> : <MessageCircle className="w-6 h-6 text-white" />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[calc(100vw-48px)] md:w-96 bg-white rounded-3xl shadow-2xl max-h-[70vh] flex flex-col overflow-hidden">
          <div className="bg-gradient-to-r from-[hsl(346,74%,85%)] to-[hsl(270,50%,85%)] p-4">
            <h3 className="font-['Playfair_Display'] text-lg font-semibold">Travel Assistant</h3>
            <p className="text-sm text-gray-600">Ask me anything!</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px] max-h-[300px]">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <Sparkles className="w-8 h-8 mx-auto mb-2 text-[hsl(346,74%,75%)]" />
                <p className="text-sm">Ask about destinations, safety, or packing!</p>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 text-sm rounded-2xl ${
                  msg.role === 'user' ? 'bg-[hsl(346,74%,85%)] text-[hsl(346,74%,25%)] rounded-br-md' : 'bg-gray-100 rounded-bl-md'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-2xl rounded-bl-md">
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

          <div className="p-4 border-t">
            <form onSubmit={(e) => { e.preventDefault(); sendMessage(input) }} className="flex gap-2">
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
                placeholder="Type your question..."
                className="flex-1 px-4 py-2 rounded-full border-2 border-gray-200 focus:border-[hsl(346,74%,75%)] focus:outline-none text-sm" />
              <button type="submit" disabled={isLoading || !input.trim()}
                className="w-10 h-10 bg-[hsl(346,74%,75%)] rounded-full flex items-center justify-center disabled:opacity-50">
                <Send className="w-4 h-4 text-white" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default function ThanksPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[hsl(346,74%,95%)] via-white to-[hsl(270,50%,95%)]">
      {/* Header */}
      <header className="p-4">
        <div className="max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">✈️</span>
            <span className="font-['Playfair_Display'] text-xl md:text-2xl font-bold bg-gradient-to-r from-[hsl(346,74%,65%)] to-[hsl(270,50%,65%)] bg-clip-text text-transparent">
              FeminTravel
            </span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <section className="py-12 md:py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-[hsl(346,74%,85%)] to-[hsl(270,50%,85%)] 
                          rounded-full flex items-center justify-center shadow-lg animate-bounce">
            <Check className="w-12 h-12 text-white" />
          </div>

          <h1 className="font-['Playfair_Display'] text-4xl md:text-5xl font-bold mb-4">
            You're In! 🎉
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your <span className="text-[hsl(346,74%,55%)] font-semibold">Solo Luxe Travel Kit</span> is ready!
          </p>

          {/* Download Button */}
          <a 
            href="#"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-[hsl(346,74%,75%)] to-[hsl(270,50%,75%)] 
                       text-white font-semibold text-lg py-4 px-8 rounded-2xl shadow-lg
                       hover:shadow-xl hover:scale-105 transition-all mb-12"
          >
            <Download className="w-6 h-6" />
            Download Your Free Kit (PDF)
          </a>

          {/* What's Inside */}
          <div className="bg-white rounded-3xl p-8 shadow-xl mb-12 text-left">
            <h2 className="font-['Playfair_Display'] text-2xl font-bold text-center mb-6">
              What's Inside Your Kit
            </h2>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[hsl(346,74%,90%)] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-[hsl(346,74%,55%)]" />
                </div>
                <div>
                  <p className="font-semibold">📦 Ultimate Packing Checklist</p>
                  <p className="text-gray-600 text-sm">Never forget essentials again with our curated list</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[hsl(346,74%,90%)] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-[hsl(346,74%,55%)]" />
                </div>
                <div>
                  <p className="font-semibold">🛡️ Solo Safety Guide</p>
                  <p className="text-gray-600 text-sm">Expert tips for staying safe on your adventures</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[hsl(346,74%,90%)] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-[hsl(346,74%,55%)]" />
                </div>
                <div>
                  <p className="font-semibold">💰 Budget Planner Template</p>
                  <p className="text-gray-600 text-sm">Track expenses and save money like a pro</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Affiliate CTAs */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-['Playfair_Display'] text-2xl md:text-3xl font-bold text-center mb-4">
            Ready to Book Your Trip?
          </h2>
          <p className="text-gray-600 text-center mb-8">
            Find the best deals through our trusted partners
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Hotels */}
            <a href="#" className="group bg-gradient-to-br from-[hsl(346,74%,97%)] to-white rounded-3xl p-6 text-center
                                   hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-[hsl(346,74%,90%)]">
              <div className="w-16 h-16 mx-auto mb-4 bg-[hsl(346,74%,90%)] rounded-2xl flex items-center justify-center
                              group-hover:bg-[hsl(346,74%,80%)] transition-colors">
                <Hotel className="w-8 h-8 text-[hsl(346,74%,50%)]" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Find Hotels</h3>
              <p className="text-gray-600 text-sm mb-4">Safe, central locations perfect for solo travelers</p>
              <span className="text-[hsl(346,74%,55%)] font-medium">Search Hotels →</span>
            </a>

            {/* Flights */}
            <a href="#" className="group bg-gradient-to-br from-[hsl(270,50%,97%)] to-white rounded-3xl p-6 text-center
                                   hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-[hsl(270,50%,90%)]">
              <div className="w-16 h-16 mx-auto mb-4 bg-[hsl(270,50%,90%)] rounded-2xl flex items-center justify-center
                              group-hover:bg-[hsl(270,50%,80%)] transition-colors">
                <Plane className="w-8 h-8 text-[hsl(270,50%,50%)]" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Search Flights</h3>
              <p className="text-gray-600 text-sm mb-4">Compare prices and find the best routes</p>
              <span className="text-[hsl(270,50%,55%)] font-medium">Search Flights →</span>
            </a>

            {/* Insurance */}
            <a href="#" className="group bg-gradient-to-br from-[hsl(45,90%,97%)] to-white rounded-3xl p-6 text-center
                                   hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-[hsl(45,90%,85%)]">
              <div className="w-16 h-16 mx-auto mb-4 bg-[hsl(45,90%,88%)] rounded-2xl flex items-center justify-center
                              group-hover:bg-[hsl(45,90%,80%)] transition-colors">
                <Shield className="w-8 h-8 text-[hsl(45,90%,40%)]" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Travel Insurance</h3>
              <p className="text-gray-600 text-sm mb-4">Protect your trip with comprehensive coverage</p>
              <span className="text-[hsl(45,90%,40%)] font-medium">Get Covered →</span>
            </a>
          </div>
        </div>
      </section>

      {/* Social Follow */}
      <section className="py-12 px-4 bg-gradient-to-br from-[hsl(346,74%,95%)] to-[hsl(270,50%,95%)]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-['Playfair_Display'] text-2xl font-bold mb-4">
            Join Our Community
          </h2>
          <p className="text-gray-600 mb-6">
            Follow us for daily travel inspiration, tips, and stories from solo female travelers around the world.
          </p>
          <div className="flex justify-center gap-4">
            <a href="#" className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg hover:scale-110 transition-all">
              📷
            </a>
            <a href="#" className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg hover:scale-110 transition-all">
              🐦
            </a>
            <a href="#" className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg hover:scale-110 transition-all">
              🎥
            </a>
            <a href="#" className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg hover:scale-110 transition-all">
              📌
            </a>
          </div>
        </div>
      </section>

      {/* Continue Exploring */}
      <section className="py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-['Playfair_Display'] text-2xl font-bold mb-6">
            Continue Your Journey
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/globe" 
              className="inline-flex items-center justify-center gap-2 bg-[hsl(346,74%,85%)] text-[hsl(346,74%,25%)] 
                         font-semibold py-3 px-6 rounded-2xl hover:bg-[hsl(346,74%,75%)] transition-colors">
              <Globe className="w-5 h-5" />
              Explore the Globe
            </Link>
            <Link href="/blog" 
              className="inline-flex items-center justify-center gap-2 bg-[hsl(270,50%,92%)] text-[hsl(270,50%,25%)] 
                         font-semibold py-3 px-6 rounded-2xl hover:bg-[hsl(270,50%,85%)] transition-colors">
              <Gift className="w-5 h-5" />
              Read Our Blog
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-500 text-sm">
            © 2025 FeminTravel. Made with <Heart className="w-4 h-4 inline text-[hsl(346,74%,65%)]" /> for solo travelers.
          </p>
        </div>
      </footer>

      <ChatWidget />
    </main>
  )
}
