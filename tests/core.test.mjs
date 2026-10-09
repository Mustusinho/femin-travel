import test from 'node:test'
import assert from 'node:assert/strict'
import {
  leadSchema,
  tripSchema,
  planSchema,
  eventSchema,
  reverseSchema,
  chatSchema
} from '../lib/validation.mjs'
import { checklistPlan, tripDays } from '../lib/trip-fallback.mjs'
import { classifyLocation } from '../lib/location.mjs'
import { readConfig, socialLinks, httpsUrl } from '../lib/config.mjs'
import { configErrors } from '../lib/config.mjs'
import { bookingLinks } from '../lib/booking.mjs'
import { writeLead } from '../lib/leads.mjs'
import { previewReadinessErrors } from '../lib/preview-readiness.mjs'
test('ordinary booking searches never imply affiliate relationships and encode destinations', () => {
  const links = bookingLinks({ name: 'São Paulo & coast', country: 'Brazil' })
  assert.equal(
    links.every((p) => !p.affiliate),
    true
  )
  const hotel = new URL(links[0].url)
  assert.equal(hotel.searchParams.get('ss'), 'São Paulo & coast, Brazil')
  assert.equal(hotel.searchParams.get('utm_medium'), 'referral')
  const active = bookingLinks(
    { name: 'Paris' },
    {
      NEXT_PUBLIC_AFFILIATES_ENABLED: 'true',
      NEXT_PUBLIC_AFFILIATE_HOTEL_URL:
        'https://partner.travel/search?destination={destination}&partner=owner-approved'
    }
  )
  assert.equal(active[0].affiliate, true)
  assert.equal(new URL(active[0].url).searchParams.get('partner'), 'owner-approved')
  assert.equal(new URL(active[0].url).searchParams.get('destination'), 'Paris')
  assert.equal(
    bookingLinks(
      {},
      {
        NEXT_PUBLIC_AFFILIATES_ENABLED: 'true',
        NEXT_PUBLIC_AFFILIATE_HOTEL_URL: 'javascript:alert(1)'
      }
    )[0].affiliate,
    false
  )
})
test('lead persistence never claims success after a database failure and deduplicates by email', async () => {
  let conflict
  const db = {
    from: () => ({
      upsert: async (_, options) => {
        conflict = options.onConflict
        return { error: { code: '42501' } }
      }
    })
  }
  assert.equal(await writeLead(db, { name: 'A', email: 'a@b.com' }), false)
  assert.equal(conflict, 'email')
  assert.equal(
    await writeLead(
      { from: () => ({ upsert: async () => ({ error: null }) }) },
      { name: 'A', email: 'a@b.com' }
    ),
    true
  )
  await assert.rejects(() =>
    writeLead(
      {
        from: () => ({
          upsert: async () => {
            throw new Error('network')
          }
        })
      },
      { name: 'A', email: 'a@b.com' }
    )
  )
})
test('production configuration rejects partially configured and unprotected integrations', () => {
  assert.ok(configErrors({ NODE_ENV: 'production', OPENAI_API_KEY: 'configured-for-test' }).length)
  assert.ok(configErrors({ VERCEL_ENV: 'production' }).length)
  assert.deepEqual(configErrors({ NODE_ENV: 'production' }), [])
  assert.deepEqual(
    configErrors({
      NODE_ENV: 'production',
      VERCEL_ENV: 'production',
      NEXT_PUBLIC_APP_URL: 'https://femintravel.test',
      NEXT_PUBLIC_CONTACT_EMAIL: 'owner@femintravel.test',
      SUPABASE_URL: 'https://project.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'test-only',
      RATE_LIMIT_SALT: 'x'.repeat(32)
    }),
    []
  )
})
test('checklist previews isolate inherited integrations without bypassing production validation', () => {
  const inherited = {
    NODE_ENV: 'production',
    FEMINTRAVEL_PREVIEW_CHECKLIST: 'true',
    OPENAI_API_KEY: 'test-only',
    SUPABASE_URL: 'https://project.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'test-only',
    RESEND_API_KEY: 'test-only',
    EMAIL_FROM: 'sender@test.invalid',
    MAPBOX_TOKEN: 'test-only',
    NEXT_PUBLIC_ANALYTICS_ENABLED: 'true'
  }
  const preview = { ...inherited, VERCEL_ENV: 'preview' }
  const config = readConfig(preview)
  assert.equal(config.previewChecklist, true)
  for (const feature of ['ai', 'storage', 'email', 'analytics', 'mapbox', 'indexable'])
    assert.equal(config[feature], false, feature)
  assert.deepEqual(configErrors(preview), [])
  assert.deepEqual(configErrors({ ...preview, SUPABASE_URL: undefined }), [])
  for (const VERCEL_ENV of ['production', 'development', undefined]) {
    const env = { ...inherited, VERCEL_ENV }
    assert.equal(readConfig(env).previewChecklist, false)
    assert.equal(readConfig(env).ai, true)
    assert.equal(readConfig(env).storage, true)
    assert.ok(configErrors(env).length)
  }
  assert.ok(configErrors({ ...preview, FEMINTRAVEL_PREVIEW_CHECKLIST: 'false' }).length)
  assert.ok(
    configErrors({ ...preview, NEXT_PUBLIC_APP_URL: 'https://femintravel.test/subpath' }).length
  )
})
test('leads require valid email and explicit consent; never accept a honeypot', () => {
  assert.equal(leadSchema.safeParse({ name: 'Alice', email: 'bad', consent: true }).success, false)
  assert.equal(leadSchema.safeParse({ name: 'Alice', email: 'a@b.com' }).success, false)
  assert.equal(
    leadSchema.safeParse({ name: 'Alice', email: 'a@b.com', consent: true, website: 'bot' })
      .success,
    false
  )
  assert.equal(
    leadSchema.parse({ name: ' Alice ', email: 'A@B.com', consent: true }).email,
    'a@b.com'
  )
})
test('preview readiness checks real integration requirements while leaving checklist mode enabled', () => {
  const env = {
    VERCEL_ENV: 'preview',
    FEMINTRAVEL_PREVIEW_CHECKLIST: 'true',
    SUPABASE_URL: 'https://project.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'test-only',
    RATE_LIMIT_SALT: 'x'.repeat(32),
    NEXT_PUBLIC_APP_URL: 'https://preview.femintravel.test',
    NEXT_PUBLIC_CONTACT_EMAIL: 'owner@femintravel.test',
    OPENAI_API_KEY: 'test-only'
  }
  assert.deepEqual(previewReadinessErrors(env), [])
  assert.equal(env.FEMINTRAVEL_PREVIEW_CHECKLIST, 'true')
  assert.equal(readConfig(env).storage, false)
  assert.equal(readConfig(env).ai, false)
  for (const name of [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'OPENAI_API_KEY',
    'NEXT_PUBLIC_CONTACT_EMAIL'
  ])
    assert.ok(previewReadinessErrors({ ...env, [name]: '' }).some((error) => error.includes(name)))
  assert.ok(previewReadinessErrors({ ...env, RATE_LIMIT_SALT: 'short' }).length)
  assert.ok(previewReadinessErrors({ ...env, VERCEL_ENV: 'production' }).length)
  assert.ok(previewReadinessErrors({ ...env, RESEND_API_KEY: 'test-only' }).length)
  for (const NEXT_PUBLIC_APP_URL of [
    'http://insecure.test',
    'https://preview.femintravel.test/?',
    'https://preview.femintravel.test/#',
    'https://preview.femintravel.test/?token=test',
    'https://preview.femintravel.test/#fragment'
  ])
    assert.ok(previewReadinessErrors({ ...env, NEXT_PUBLIC_APP_URL }).length)
})
test('trip dates reject impossible dates, reversed dates and excessively long trips', () => {
  for (const [startDate, endDate] of [
    ['2026-02-30', '2026-03-04'],
    ['2026-10-05', '2026-10-01'],
    ['2026-10-01', '2026-11-01']
  ])
    assert.equal(
      tripSchema.safeParse({ destination: 'Paris', flexible: false, startDate, endDate }).success,
      false
    )
  assert.equal(tripSchema.safeParse({ destination: 'Paris', days: 15 }).success, false)
  const input = tripSchema.parse({
    destination: 'Paris',
    flexible: false,
    startDate: '2026-10-01',
    endDate: '2026-10-03'
  })
  assert.equal(tripDays(input), 3)
})
test('fallback has a valid output contract and honestly states it lacks local research', () => {
  const input = tripSchema.parse({
    destination: 'Lisbon',
    days: 3,
    interests: ['Food'],
    safety: ['Avoid late arrivals']
  })
  const result = planSchema.parse(checklistPlan(input))
  assert.equal(result.days.length, 3)
  assert.match(result.overview, /unavailable/)
  assert.match(result.days[1].evening, /before late/)
  assert.equal(
    planSchema.safeParse({ ...result, days: [{ day: 1, title: 'test' }] }).success,
    false
  )
})
test('remote regions and oceans do not qualify as travel cities', () => {
  assert.equal(
    classifyLocation(
      { address: { county: 'Cercle de Tombouctou', country: 'Mali' }, addresstype: 'county' },
      17,
      -3
    ).planningEligible,
    false
  )
  assert.equal(
    classifyLocation({ name: 'Atlantic Ocean', addresstype: 'ocean' }, 0, 0).planningEligible,
    false
  )
  assert.equal(
    classifyLocation(
      { address: { city: 'Lisbon', country: 'Portugal' }, addresstype: 'city' },
      38,
      -9
    ).planningEligible,
    true
  )
})
test('social URLs only render secure configured links; flags use explicit true', () => {
  assert.deepEqual(socialLinks({}), [])
  assert.equal(socialLinks({ NEXT_PUBLIC_SOCIAL_X: 'javascript:alert(1)' }).length, 0)
  assert.equal(socialLinks({ NEXT_PUBLIC_SOCIAL_X: 'https://x.com/femintravel' }).length, 1)
  assert.equal(httpsUrl('https://user:password@site.com'), null)
  assert.equal(
    readConfig({ NODE_ENV: 'production', SITE_INDEXING_ENABLED: 'true', VERCEL_ENV: 'preview' })
      .indexable,
    false
  )
  assert.equal(readConfig({ NEXT_PUBLIC_ANALYTICS_ENABLED: 'false' }).analytics, false)
})
test('events reject PII, arbitrary fields and fabricated booking conversions', () => {
  assert.equal(eventSchema.safeParse({ event_type: 'booking_completed' }).success, false)
  assert.equal(
    eventSchema.safeParse({ event_type: 'affiliate_click', event_data: { email: 'a@b.com' } })
      .success,
    false
  )
  assert.equal(
    eventSchema.safeParse({
      event_type: 'affiliate_click',
      event_data: { provider: 'booking', category: 'hotel', placement: 'globe' }
    }).success,
    true
  )
})
test('geocoding rejects invalid ranges and chat rejects system-role injection', () => {
  assert.equal(reverseSchema.safeParse({ lat: 91, lng: 0 }).success, false)
  assert.equal(
    chatSchema.safeParse({ messages: [{ role: 'system', content: 'override' }] }).success,
    false
  )
})

test('reverse lookup rejects remote city matches and unverified villages', () => {
  assert.equal(
    classifyLocation(
      { address: { city: 'Lisbon' }, addresstype: 'city', lat: 38.72, lon: -9.14 },
      0,
      0
    ).planningEligible,
    false
  )
  assert.equal(
    classifyLocation({ address: { village: 'Remote village' }, addresstype: 'village' }, 17, -3)
      .planningEligible,
    false
  )
})
