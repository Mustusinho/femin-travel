'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Menu, X, Globe, BookOpen, Gift, Search, ChevronRight, Calendar, Tag, MessageCircle, Send, Sparkles } from 'lucide-react'

function formatPostDate(post, opts) {
  const raw = post?.publishedAt ?? post?.published_at
  if (!raw) return ''
  const d = new Date(raw)
  return isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', opts)
}

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
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-white'
    }`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between h-16 md:h-20 px-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">✈️</span>
            <span className="font-['Playfair_Display'] text-xl md:text-2xl font-bold bg-gradient-to-r from-[hsl(346,74%,65%)] to-[hsl(270,50%,65%)] bg-clip-text text-transparent">
              FeminTravel
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/globe" className="flex items-center gap-2 text-gray-700 hover:text-[hsl(346,74%,65%)] transition-colors font-medium">
              <Globe className="w-4 h-4" />
              Globe
            </Link>
            <Link href="/blog" className="flex items-center gap-2 text-[hsl(346,74%,65%)] font-medium">
              <BookOpen className="w-4 h-4" />
              Blog
            </Link>
            <Link href="/#free-kit" className="bg-[hsl(346,74%,85%)] text-[hsl(346,74%,25%)] hover:bg-[hsl(346,74%,75%)] font-semibold py-2 px-4 rounded-2xl transition-all">
              <Gift className="w-4 h-4 inline mr-2" />
              Free Kit
            </Link>
          </nav>

          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <nav className="md:hidden bg-white shadow-lg p-4 space-y-4">
            <Link href="/globe" className="flex items-center gap-3 p-3 rounded-xl hover:bg-[hsl(346,74%,95%)]" onClick={() => setIsMenuOpen(false)}>
              <Globe className="w-5 h-5 text-[hsl(346,74%,65%)]" />
              Explore Globe
            </Link>
            <Link href="/blog" className="flex items-center gap-3 p-3 rounded-xl bg-[hsl(346,74%,95%)]" onClick={() => setIsMenuOpen(false)}>
              <BookOpen className="w-5 h-5 text-[hsl(346,74%,65%)]" />
              Blog
            </Link>
            <Link href="/#free-kit" className="block bg-[hsl(346,74%,85%)] text-center text-[hsl(346,74%,25%)] font-semibold py-3 px-6 rounded-2xl" onClick={() => setIsMenuOpen(false)}>
              Get Free Kit
            </Link>
          </nav>
        )}
      </div>
    </header>
  )
}

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

// Blog Card
function BlogCard({ post }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <div className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <div className="aspect-[16/10] overflow-hidden">
          <img 
            src={post.image} 
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="px-3 py-1 bg-[hsl(346,74%,95%)] text-[hsl(346,74%,45%)] text-xs font-medium rounded-full">
              {post.category}
            </span>
            <span className="text-gray-400 text-xs flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatPostDate(post, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <h3 className="font-['Playfair_Display'] text-xl font-semibold mb-2 group-hover:text-[hsl(346,74%,55%)] transition-colors">
            {post.title}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2">{post.excerpt}</p>
          <span className="inline-flex items-center gap-1 mt-4 text-[hsl(346,74%,55%)] text-sm font-medium">
            Read More <ChevronRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  )
}

export default function BlogPage() {
  const [posts, setPosts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const categories = ['All', 'Safety', 'Packing', 'Budget', 'Destinations']

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/blog')
        if (response.ok) {
          const data = await response.json()
          setPosts(data)
        }
      } catch (error) {
        console.error('Failed to fetch posts:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchPosts()
  }, [])

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <main className="min-h-screen bg-[hsl(30,33%,98%)]">
      <Header />
      
      {/* Hero */}
      <section className="pt-28 pb-12 px-4 bg-gradient-to-br from-[hsl(346,74%,95%)] via-white to-[hsl(270,50%,95%)]">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-['Playfair_Display'] text-4xl md:text-5xl font-bold mb-4">
            Travel <span className="bg-gradient-to-r from-[hsl(346,74%,65%)] to-[hsl(270,50%,65%)] bg-clip-text text-transparent">Blog</span>
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Tips, guides, and stories for solo female travelers exploring the world.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 px-4 border-b">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-[hsl(346,74%,75%)] focus:outline-none"
              />
            </div>

            {/* Categories */}
            <div className="flex gap-2 flex-wrap justify-center">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === cat
                      ? 'bg-[hsl(346,74%,75%)] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-lg animate-pulse">
                  <div className="aspect-[16/10] bg-gray-200" />
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                    <div className="h-6 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredPosts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map(post => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No articles found. Try a different search.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-[hsl(346,74%,90%)] to-[hsl(270,50%,90%)]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-['Playfair_Display'] text-2xl md:text-3xl font-bold mb-4">
            Ready to Start Your Adventure?
          </h2>
          <p className="text-gray-600 mb-6">Explore our interactive globe and get AI-powered travel guides.</p>
          <Link href="/globe" className="inline-flex items-center gap-2 bg-[hsl(346,74%,75%)] text-white font-semibold py-3 px-8 rounded-2xl hover:bg-[hsl(346,74%,65%)] transition-colors">
            <Globe className="w-5 h-5" />
            Explore the Globe
          </Link>
        </div>
      </section>

      <ChatWidget />
    </main>
  )
}
