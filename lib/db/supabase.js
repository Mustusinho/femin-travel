import 'server-only'
import { createClient } from '@supabase/supabase-js'

let supabase = null
let initialized = false
export function getSupabase() {
  if (!initialized) {
    initialized = true
    const url = process.env.SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (url && key) {
      try {
        supabase = createClient(url, key, {
          auth: { persistSession: false, autoRefreshToken: false }
        })
      } catch {
        console.error('Supabase initialization failed; persistent features are unavailable.')
      }
    }
  }
  return { supabase, isSupabaseAvailable: Boolean(supabase) }
}
