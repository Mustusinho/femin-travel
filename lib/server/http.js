import 'server-only'
import { createHash } from 'node:crypto'
import { NextResponse } from 'next/server'
import { getSupabase } from '../db/supabase'
const buckets = new Map()
export class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}
export function json(data, status = 200) {
  return NextResponse.json(data, { status, headers: { 'Cache-Control': 'no-store' } })
}
export async function readBody(request, schema) {
  if (!request.headers.get('content-type')?.startsWith('application/json'))
    throw new HttpError(415, 'Use application/json.')
  if (Number(request.headers.get('content-length') || 0) > 24000)
    throw new HttpError(413, 'Request is too large.')
  const reader = request.body?.getReader()
  if (!reader) throw new HttpError(400, 'A request body is required.')
  let bytes = 0
  const chunks = []
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    bytes += value.byteLength
    if (bytes > 24000) {
      await reader.cancel()
      throw new HttpError(413, 'Request is too large.')
    }
    chunks.push(value)
  }
  let value
  try {
    value = JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    throw new HttpError(400, 'Invalid JSON.')
  }
  const parsed = schema.safeParse(value)
  if (!parsed.success)
    throw new HttpError(400, parsed.error.issues[0]?.message || 'Check your input.')
  return parsed.data
}
export function sameOrigin(request) {
  const origin = request.headers.get('origin')
  const allowed = new URL(request.url).origin
  // Next dev may expose its listener as 0.0.0.0 while the browser uses localhost.
  // Keep this exception strictly local; production still checks the exact origin.
  let localDevAlias = false
  if (origin && process.env.NODE_ENV === 'development') {
    try {
      const source = new URL(origin)
      const target = new URL(request.url)
      const loopback = ['localhost', '127.0.0.1', '0.0.0.0']
      localDevAlias =
        loopback.includes(source.hostname) &&
        loopback.includes(target.hostname) &&
        source.port === target.port &&
        source.protocol === target.protocol
    } catch {}
  }
  if (
    origin &&
    origin !== allowed &&
    origin !== process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') &&
    !localDevAlias
  )
    throw new HttpError(403, 'This request must come from FeminTravel.')
  if (request.headers.get('sec-fetch-site') === 'cross-site')
    throw new HttpError(403, 'Cross-site requests are not allowed.')
}
export async function rateLimit(request, category, limit, windowSeconds = 3600, global = false) {
  // Vercel overwrites this header. Outside Vercel use a shared bucket; never trust arbitrary forwarded IPs.
  const ip = global
    ? 'global'
    : process.env.VERCEL
      ? request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
      : 'local'
  const key = createHash('sha256')
    .update(`${process.env.RATE_LIMIT_SALT || 'local-development'}:${ip}:${category}`)
    .digest('hex')
  const { supabase } = getSupabase()
  if (supabase) {
    if (process.env.NODE_ENV === 'production' && !process.env.RATE_LIMIT_SALT)
      throw new HttpError(503, 'Service configuration is incomplete.')
    const { data, error } = await supabase.rpc('consume_rate_limit', {
      p_key: key,
      p_limit: limit,
      p_window: windowSeconds
    })
    if (error)
      throw new HttpError(503, 'Request protection is unavailable. Please try again later.')
    if (!data) throw new HttpError(429, 'Too many requests. Please try again later.')
  } else {
    if (process.env.NODE_ENV === 'production')
      throw new HttpError(503, 'This service is not configured yet.')
    const now = Date.now()
    if (buckets.size > 5000) for (const [k, v] of buckets) if (v.until < now) buckets.delete(k)
    let b = buckets.get(key)
    if (!b || b.until < now) {
      b = { count: 0, until: now + windowSeconds * 1000 }
      buckets.set(key, b)
    }
    if (++b.count > limit) throw new HttpError(429, 'Too many requests. Please try again later.')
  }
}
export function safeError(error) {
  const status = error instanceof HttpError ? error.status : 500
  if (status === 500) console.error('API request failed:', error?.name || 'Error')
  const response = json(
    { error: status === 500 ? 'Something went wrong. Please try again.' : error.message },
    status
  )
  if (status === 429) response.headers.set('Retry-After', '60')
  return response
}
