'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Menu, X, Globe, BookOpen, Gift, ArrowLeft, Calendar, Tag, MessageCircle, Send, Sparkles, Share2 } from 'lucide-react'

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

export default function BlogPostPage() {
  const params = useParams()
  const [post, setPost] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/blog/${params.slug}`)
        if (response.ok) {
          const data = await response.json()
          setPost(data)
        }
      } catch (error) {
        console.error('Failed to fetch post:', error)
      } finally {
        setIsLoading(false)
      }
    }
    if (params.slug) {
      fetchPost()
    }
  }, [params.slug])

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[hsl(30,33%,98%)]">
        <Header />
        <div className="pt-28 pb-16 px-4">
          <div className="max-w-3xl mx-auto animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8" />
            <div className="aspect-[16/9] bg-gray-200 rounded-3xl mb-8" />
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
              <div className="h-4 bg-gray-200 rounded w-4/6" />
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (!post) {
    return (
      <main className="min-h-screen bg-[hsl(30,33%,98%)]">
        <Header />
        <div className="pt-28 pb-16 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-['Playfair_Display'] text-3xl font-bold mb-4">Post Not Found</h1>
            <p className="text-gray-600 mb-8">The article you're looking for doesn't exist.</p>
            <Link href="/blog" className="inline-flex items-center gap-2 text-[hsl(346,74%,65%)] font-medium">
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[hsl(30,33%,98%)]">
      <Header />
      
      {/* Article */}
      <article className="pt-28 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Back link */}
          <Link href="/blog" className="inline-flex items-center gap-2 text-gray-500 hover:text-[hsl(346,74%,65%)] transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-[hsl(346,74%,95%)] text-[hsl(346,74%,45%)] text-sm font-medium rounded-full">
                {post.category}
              </span>
              <span className="text-gray-400 text-sm flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <h1 className="font-['Playfair_Display'] text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              {post.title}
            </h1>
            <p className="text-gray-600 text-lg">{post.excerpt}</p>
          </header>

          {/* Featured Image */}
          <div className="aspect-[16/9] rounded-3xl overflow-hidden mb-8">
            <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none
                          prose-headings:font-['Playfair_Display'] prose-headings:font-bold
                          prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
                          prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
                          prose-p:text-gray-600 prose-p:leading-relaxed
                          prose-li:text-gray-600
                          prose-a:text-[hsl(346,74%,55%)] prose-a:no-underline hover:prose-a:underline
                          prose-strong:text-gray-800
                          prose-blockquote:border-l-4 prose-blockquote:border-[hsl(346,74%,75%)] prose-blockquote:bg-[hsl(346,74%,97%)] prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-xl prose-blockquote:not-italic">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content}
            </ReactMarkdown>
          </div>

          {/* Share */}
          <div className="mt-12 pt-8 border-t">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <p className="text-gray-500">Share this article:</p>
              <div className="flex gap-2">
                <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                  <Share2 className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-[hsl(346,74%,90%)] to-[hsl(270,50%,90%)]">
        <div className="max-w-3xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 text-center">
              <Gift className="w-10 h-10 text-[hsl(346,74%,65%)] mx-auto mb-4" />
              <h3 className="font-['Playfair_Display'] text-xl font-semibold mb-2">Get Free Travel Kit</h3>
              <p className="text-gray-600 text-sm mb-4">Packing checklist, safety guide & budget planner</p>
              <Link href="/#free-kit" className="inline-block bg-[hsl(346,74%,85%)] text-[hsl(346,74%,25%)] font-semibold py-2 px-6 rounded-xl hover:bg-[hsl(346,74%,75%)] transition-colors">
                Get It Free
              </Link>
            </div>
            <div className="bg-white rounded-3xl p-6 text-center">
              <Globe className="w-10 h-10 text-[hsl(270,50%,65%)] mx-auto mb-4" />
              <h3 className="font-['Playfair_Display'] text-xl font-semibold mb-2">Explore the Globe</h3>
              <p className="text-gray-600 text-sm mb-4">Get AI-powered travel briefs for any destination</p>
              <Link href="/globe" className="inline-block bg-[hsl(270,50%,85%)] text-[hsl(270,50%,25%)] font-semibold py-2 px-6 rounded-xl hover:bg-[hsl(270,50%,75%)] transition-colors">
                Start Exploring
              </Link>
            </div>
          </div>
        </div>
      </section>

      <ChatWidget />
    </main>
  )
}
