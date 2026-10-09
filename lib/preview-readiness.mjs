import { configErrors, httpsUrl } from './config.mjs'

// Configuration shape only: this does not authenticate providers or change the running app.
export function previewReadinessErrors(env = process.env) {
  const errors = configErrors({
    ...env,
    NODE_ENV: 'production',
    FEMINTRAVEL_PREVIEW_CHECKLIST: 'false'
  })
  if (env.VERCEL_ENV !== 'preview') errors.push('Run this check with VERCEL_ENV=preview.')
  for (const name of [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'RATE_LIMIT_SALT',
    'NEXT_PUBLIC_APP_URL',
    'NEXT_PUBLIC_CONTACT_EMAIL',
    'OPENAI_API_KEY'
  ]) {
    if (!env[name]) errors.push(`${name} is required for live preview verification.`)
  }
  if (env.NEXT_PUBLIC_APP_URL && !httpsUrl(env.NEXT_PUBLIC_APP_URL))
    errors.push('NEXT_PUBLIC_APP_URL must be a valid HTTPS origin.')
  return [...new Set(errors)]
}
