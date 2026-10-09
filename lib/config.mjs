export const flag = (value) => value === 'true'
export function httpsUrl(value) {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && !url.username && !url.password ? url.toString() : null
  } catch {
    return null
  }
}
export function readConfig(env = process.env) {
  const production = env.NODE_ENV === 'production'
  // A branch preview can exercise the product without inherited live provider credentials.
  // This flag never disables production integration checks or production services.
  const previewChecklist = env.VERCEL_ENV === 'preview' && flag(env.FEMINTRAVEL_PREVIEW_CHECKLIST)
  return {
    production,
    previewChecklist,
    appUrl: httpsUrl(env.NEXT_PUBLIC_APP_URL),
    indexable:
      env.VERCEL_ENV === 'production' &&
      flag(env.SITE_INDEXING_ENABLED) &&
      Boolean(httpsUrl(env.NEXT_PUBLIC_APP_URL)),
    model: env.OPENAI_TRAVEL_MODEL || 'gpt-4o-mini',
    ai: !previewChecklist && Boolean(env.OPENAI_API_KEY),
    storage: !previewChecklist && Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY),
    email: !previewChecklist && Boolean(env.RESEND_API_KEY && env.EMAIL_FROM),
    mapbox: !previewChecklist && Boolean(env.MAPBOX_TOKEN),
    contact: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(env.NEXT_PUBLIC_CONTACT_EMAIL || '')
      ? env.NEXT_PUBLIC_CONTACT_EMAIL
      : null,
    analytics: !previewChecklist && flag(env.NEXT_PUBLIC_ANALYTICS_ENABLED)
  }
}
export function socialLinks(env = process.env) {
  return ['INSTAGRAM', 'TIKTOK', 'YOUTUBE', 'PINTEREST', 'FACEBOOK', 'X'].flatMap((platform) => {
    const url = httpsUrl(env[`NEXT_PUBLIC_SOCIAL_${platform}`])
    return url
      ? [
          {
            label: platform === 'X' ? 'X / Twitter' : platform[0] + platform.slice(1).toLowerCase(),
            url
          }
        ]
      : []
  })
}
export function configErrors(env = process.env) {
  const c = readConfig(env),
    errors = []
  if (env.VERCEL_ENV === 'production' && !c.appUrl)
    errors.push('NEXT_PUBLIC_APP_URL must be an HTTPS origin for production.')
  if (c.appUrl && new URL(c.appUrl).pathname !== '/')
    errors.push('NEXT_PUBLIC_APP_URL must be an origin without a path.')
  if (!c.previewChecklist) {
    if (Boolean(env.SUPABASE_URL) !== Boolean(env.SUPABASE_SERVICE_ROLE_KEY))
      errors.push('Set both SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.')
    if (c.storage && !httpsUrl(env.SUPABASE_URL)) errors.push('SUPABASE_URL must be HTTPS.')
    if (
      (c.ai || c.email || c.analytics || c.storage || c.mapbox) &&
      env.NODE_ENV === 'production' &&
      (!c.storage || !env.RATE_LIMIT_SALT || env.RATE_LIMIT_SALT.length < 32)
    )
      errors.push(
        'Production integrations require Supabase storage and a RATE_LIMIT_SALT of at least 32 characters.'
      )
    if (Boolean(env.RESEND_API_KEY) !== Boolean(env.EMAIL_FROM))
      errors.push('Set both RESEND_API_KEY and EMAIL_FROM.')
  }
  if (env.NEXT_PUBLIC_CONTACT_EMAIL && !c.contact)
    errors.push('NEXT_PUBLIC_CONTACT_EMAIL must be a valid email.')
  if (c.email && !c.contact)
    errors.push('Configure a verified NEXT_PUBLIC_CONTACT_EMAIL before enabling email.')
  if (env.VERCEL_ENV === 'production' && !c.contact)
    errors.push('Configure a verified NEXT_PUBLIC_CONTACT_EMAIL before production launch.')
  return errors
}
