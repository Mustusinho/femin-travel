import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { getSupabase, inMemoryStore } from '@/lib/db/supabase'
import { featuredDestinations, demoBlogPosts } from '@/lib/db/data'
import { generateTravelBrief, generateChatResponse } from '@/lib/openai'
import { reverseGeocode, forwardGeocode } from '@/lib/geocoding'

// Helper function to handle CORS
function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}

// Normalize blog post fields: Supabase uses published_at (snake_case), UI expects publishedAt
function normalizeBlogPost(post) {
  if (!post) return post
  const publishedAt = post.published_at ?? post.publishedAt ?? null
  return { ...post, publishedAt }
}

// Route handler function
async function handleRoute(request, { params }) {
  const { path = [] } = params
  const route = `/${path.join('/')}`
  const method = request.method

  try {
    // === ROOT ===
    if ((route === '/' || route === '/root') && method === 'GET') {
      return handleCORS(NextResponse.json({ 
        message: 'FeminTravel API',
        version: '1.0.0',
        status: 'healthy'
      }))
    }

    // === DESTINATIONS ===
    if (route === '/destinations' && method === 'GET') {
      const { supabase, isSupabaseAvailable } = getSupabase()
      
      if (isSupabaseAvailable) {
        const { data, error } = await supabase.from('destinations').select('*')
        if (!error && data?.length) {
          return handleCORS(NextResponse.json(data))
        }
      }
      
      // Fallback to demo data
      return handleCORS(NextResponse.json(featuredDestinations))
    }

    // === GEOCODING ===
    if (route === '/geocode/reverse' && method === 'POST') {
      const body = await request.json()
      const { lat, lng } = body
      
      if (lat === undefined || lng === undefined) {
        return handleCORS(NextResponse.json(
          { error: 'lat and lng are required' },
          { status: 400 }
        ))
      }
      
      const result = await reverseGeocode(lat, lng)
      return handleCORS(NextResponse.json(result))
    }

    if (route === '/geocode/forward' && method === 'POST') {
      const body = await request.json()
      const { query } = body
      
      if (!query) {
        return handleCORS(NextResponse.json(
          { error: 'query is required' },
          { status: 400 }
        ))
      }
      
      const result = await forwardGeocode(query)
      
      if (!result) {
        return handleCORS(NextResponse.json(
          { error: 'Location not found' },
          { status: 404 }
        ))
      }
      
      return handleCORS(NextResponse.json(result))
    }

    // === AI BRIEF ===
    if (route === '/ai/brief' && method === 'POST') {
      const body = await request.json()
      const { placeName, country, lat, lng } = body
      
      if (!placeName) {
        return handleCORS(NextResponse.json(
          { error: 'placeName is required' },
          { status: 400 }
        ))
      }
      
      // Check cache first
      const cacheKey = `${placeName}-${country}`.toLowerCase().replace(/\s+/g, '-')
      const { supabase, isSupabaseAvailable } = getSupabase()
      
      if (isSupabaseAvailable) {
        const { data: cached } = await supabase
          .from('destination_briefs')
          .select('brief_data')
          .eq('cache_key', cacheKey)
          .single()
        
        if (cached?.brief_data) {
          return handleCORS(NextResponse.json(cached.brief_data))
        }
      } else if (inMemoryStore.briefs.has(cacheKey)) {
        return handleCORS(NextResponse.json(inMemoryStore.briefs.get(cacheKey)))
      }
      
      // Generate new brief
      const brief = await generateTravelBrief(placeName, country || 'Unknown', lat, lng)
      
      // Cache the brief
      if (isSupabaseAvailable) {
        await supabase.from('destination_briefs').insert({
          id: uuidv4(),
          cache_key: cacheKey,
          place_name: placeName,
          country: country || 'Unknown',
          lat,
          lng,
          brief_data: brief,
          created_at: new Date().toISOString()
        })
      } else {
        inMemoryStore.briefs.set(cacheKey, brief)
      }
      
      return handleCORS(NextResponse.json(brief))
    }

    // === AI CHAT ===
    if (route === '/ai/chat' && method === 'POST') {
      const body = await request.json()
      const { messages, destinationContext } = body
      
      if (!messages || !Array.isArray(messages)) {
        return handleCORS(NextResponse.json(
          { error: 'messages array is required' },
          { status: 400 }
        ))
      }
      
      const response = await generateChatResponse(messages, destinationContext)
      return handleCORS(NextResponse.json({ response }))
    }

    // === LEADS ===
    if (route === '/leads' && method === 'POST') {
      const body = await request.json()
      const { name, email } = body
      
      if (!name || !email) {
        return handleCORS(NextResponse.json(
          { error: 'name and email are required' },
          { status: 400 }
        ))
      }
      
      const lead = {
        id: uuidv4(),
        name,
        email,
        created_at: new Date().toISOString()
      }
      
      const { supabase, isSupabaseAvailable } = getSupabase()
      
      if (isSupabaseAvailable) {
        await supabase.from('leads').insert(lead)
      } else {
        inMemoryStore.leads.push(lead)
        console.log('Lead captured (in-memory):', lead)
      }
      
      // Track event
      await trackEvent('lead_captured', { email })
      
      return handleCORS(NextResponse.json({ success: true, id: lead.id }))
    }

    // === EVENTS TRACKING ===
    if (route === '/events' && method === 'POST') {
      const body = await request.json()
      const { event_type, event_data } = body
      
      if (!event_type) {
        return handleCORS(NextResponse.json(
          { error: 'event_type is required' },
          { status: 400 }
        ))
      }
      
      await trackEvent(event_type, event_data || {})
      return handleCORS(NextResponse.json({ success: true }))
    }

    // === BLOG ===
    if (route === '/blog' && method === 'GET') {
      const { supabase, isSupabaseAvailable } = getSupabase()
      
      if (isSupabaseAvailable) {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .order('published_at', { ascending: false })
        
        if (!error && data?.length) {
          return handleCORS(NextResponse.json(data.map(normalizeBlogPost)))
        }
      }

      // Fallback to demo posts
      return handleCORS(NextResponse.json(demoBlogPosts))
    }

    // Single blog post by slug
    if (route.startsWith('/blog/') && method === 'GET') {
      const slug = path[1]
      const { supabase, isSupabaseAvailable } = getSupabase()
      
      if (isSupabaseAvailable) {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('slug', slug)
          .single()
        
        if (!error && data) {
          return handleCORS(NextResponse.json(normalizeBlogPost(data)))
        }
      }

      // Fallback to demo posts
      const post = demoBlogPosts.find(p => p.slug === slug)
      if (post) {
        return handleCORS(NextResponse.json(post))
      }
      
      return handleCORS(NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      ))
    }

    // Route not found
    return handleCORS(NextResponse.json(
      { error: `Route ${route} not found` },
      { status: 404 }
    ))

  } catch (error) {
    console.error('API Error:', error)
    return handleCORS(NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    ))
  }
}

// Helper to track events
async function trackEvent(eventType, eventData) {
  const event = {
    id: uuidv4(),
    event_type: eventType,
    event_data: eventData,
    created_at: new Date().toISOString()
  }
  
  const { supabase, isSupabaseAvailable } = getSupabase()
  
  if (isSupabaseAvailable) {
    await supabase.from('events').insert(event)
  } else {
    inMemoryStore.events.push(event)
  }
}

// Export all HTTP methods
export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const DELETE = handleRoute
export const PATCH = handleRoute
