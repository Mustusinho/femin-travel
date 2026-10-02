import 'server-only'
import { createClient } from '@supabase/supabase-js'

let supabase = null
let isSupabaseAvailable = false

function getEnv() {
  const isServer = typeof window === 'undefined'
  const url =
    process.env.SUPABASE_URL ||
    ''

  // Client MUST use anon key (public)
  const anon =
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
        auth: { persistSession: false, autoRefreshToken: false },
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

