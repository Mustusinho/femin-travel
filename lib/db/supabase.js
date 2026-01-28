import { createClient } from '@supabase/supabase-js'

let supabase = null
let isSupabaseAvailable = false

function getEnv() {
  const isServer = typeof window === 'undefined'
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    ''

  // Client MUST use anon key (public)
  const anon =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    ''

  // Server may use service role (never expose)
  const service = isServer ? process.env.SUPABASE_SERVICE_ROLE_KEY || '' : ''

  return { isServer, url, anon, service }
}

function initSupabase() {
  const { url, anon, service, isServer } = getEnv()
  const key = (isServer && service) ? service : anon

  if (url && key) {
    try {
      supabase = createClient(url, key, {
        auth: { persistSession: false },
      })
      isSupabaseAvailable = true
    } catch (error) {
      console.log('Supabase init failed, using fallback:', error.message)
      isSupabaseAvailable = false
    }
  } else {
    isSupabaseAvailable = false
  }

  return { supabase, isSupabaseAvailable }
}

export function getSupabase() {
  if (supabase === null) initSupabase()
  return { supabase, isSupabaseAvailable }
}

// In-memory fallback stores
export const inMemoryStore = {
  leads: [],
  events: [],
  briefs: new Map(),
  blogPosts: [],
  destinations: [],
}
