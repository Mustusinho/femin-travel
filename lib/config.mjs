export const flag = value => value === 'true'
export function httpsUrl(value) {
  if (!value) return null
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password ? url.toString() : null } catch { return null }
}
export function readConfig(env = process.env) {
  const production = env.NODE_ENV === 'production'
  return {
    production, appUrl: httpsUrl(env.NEXT_PUBLIC_APP_URL),
    indexable: env.VERCEL_ENV === 'production' && flag(env.SITE_INDEXING_ENABLED),
    model: env.OPENAI_TRAVEL_MODEL || 'gpt-4o-mini',
    ai: Boolean(env.OPENAI_API_KEY),
    storage: Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY),
    email: Boolean(env.RESEND_API_KEY && env.EMAIL_FROM),
    contact: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(env.NEXT_PUBLIC_CONTACT_EMAIL || '') ? env.NEXT_PUBLIC_CONTACT_EMAIL : null,
    analytics: flag(env.NEXT_PUBLIC_ANALYTICS_ENABLED),
  }
}
export function socialLinks(env = process.env) {
  return ['INSTAGRAM', 'TIKTOK', 'YOUTUBE', 'PINTEREST', 'FACEBOOK', 'X'].flatMap(platform => {
    const url = httpsUrl(env[`NEXT_PUBLIC_SOCIAL_${platform}`])
    return url ? [{ label: platform === 'X' ? 'X / Twitter' : platform[0] + platform.slice(1).toLowerCase(), url }] : []
  })
}
