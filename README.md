# FeminTravel

A travel planning product for women and friends: guided onboarding, structured itineraries or clearly labelled preparation checklists, arrival planning, practical safety preparation and honest external booking searches. Warm cream, blush, lavender and soft gold styling uses Inter and Playfair Display.

## Working branch and recovery

Implementation stays on `feat/femintravel-production-v2`, created from `upgrade/femintravel-premium-v1`. Baseline commit: `dd340ed`. Changes are recorded in logical commits. Never reset, switch branches, force push or merge `main` automatically. A database backup and tested preview are required before an owner-approved production launch.

## Stack and local setup

Next.js 15.5.27 App Router, React 18, Tailwind 3, Zod, optional server-side Supabase/OpenAI/Resend, and lazily loaded react-globe.gl/Three.js. Node 22 and Yarn 1.22.22 are the supported deployment combination; the engine permits Node 22–24. Next 14 was upgraded to address dependency advisories while preserving React 18 and the existing globe foundation.

```powershell
yarn install --frozen-lockfile
Copy-Item .env.example .env.local
# Edit .env.local locally; never commit actual credentials.
yarn dev
```

Open http://localhost:3000. With no credentials the site remains navigable, curated destinations work, the planner generates a personalized **preparation checklist**, and the general Free Kit is open. This mode does not claim destination research or an AI-generated itinerary. Cloud save, lead/contact forms and the AI chat UI are hidden until configured. No volatile lead/trip persistence is used, including development. Development-only in-memory rate limiting is explicitly separate from durable production protection.

## Actual routes

- `/`: product overview, planner CTA, destination previews, methodology, general kit and guides.
- `/plan`: four-step planner, validated results, current-tab draft recovery, print/PDF, optional durable save/share/email.
- `/trips/[token]`: opaque, expiring recovery link; noindex/no-referrer.
- `/globe`: existing Three.js globe, submitted place search, selected planning panel, city/region distinction, mobile sheet and accessible destination buttons.
- `/destinations`: six substantial curated pages for Tokyo, Paris, Rome, Lisbon, Barcelona and Reykjavik.
- `/blog`: three attributed articles with dates, valid slugs and real 404 behavior.
- `/free-kit`: general packing, arrival, budget, documents and emergency-preparation checklists.
- `/about`, `/contact`, `/privacy`, `/terms`, `/affiliate-disclosure`, `/cookies`, `/accessibility`.
- `/thanks`: direct kit/planner links, without pretending a submission occurred.
- `/sitemap.xml`, `/robots.txt`, `/icon.svg`, `/opengraph-image`.

The shared Header and Footer render working routes and configured real social links. Planning is fully possible without interacting with the globe.

## Environment and feature behavior

`.env.example` documents all names without secrets. `yarn check:env` loads local environment files safely; `yarn build` invokes it automatically.

| Category | Configuration and behavior |
| --- | --- |
| App | `NEXT_PUBLIC_APP_URL` is the real HTTPS origin. `NEXT_PUBLIC_CONTACT_EMAIL` is an owned inbox. Both are required for the Vercel production environment, never invented. |
| Preview isolation | `FEMINTRAVEL_PREVIEW_CHECKLIST=true` works only when Vercel sets `VERCEL_ENV=preview`. It disables inherited AI, storage, email, analytics and external geocoding. Curated search and labelled personalized preparation checklists remain available. Production ignores this flag. |
| Storage | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`; server only. Apply both versioned migrations. Save returns success only after database confirmation. Links expire after 30 days. |
| Abuse controls | Production integrations require storage and private `RATE_LIMIT_SALT` (32+ characters). Atomic database RPC provides shared limits across serverless instances. Salted hashes are used instead of raw IP storage. |
| AI | Optional `OPENAI_API_KEY`, central `OPENAI_TRAVEL_MODEL` (default `gpt-4o-mini`). Missing key/provider errors/malformed output produce a labelled checklist. No live visa/pricing/safety claims. |
| Geocoding | Optional server-only `MAPBOX_TOKEN`; otherwise Nominatim submitted searches with global throttling and attribution. Production remote lookup requires storage. Curated search always works. |
| Email | Optional `RESEND_API_KEY`, verified `EMAIL_FROM`, real contact inbox. Contact sends server-side. Kit and saved-trip email are requested one-time deliveries, not subscriptions. |
| Affiliates | Optional `NEXT_PUBLIC_AFFILIATES_ENABLED=true` plus approved full public URL templates by category. Missing configuration uses labelled ordinary searches. See below. |
| Social | Real HTTPS URLs in `NEXT_PUBLIC_SOCIAL_INSTAGRAM`, `...TIKTOK`, `...YOUTUBE`, `...PINTEREST`, `...FACEBOOK`, `...X`. Empty/invalid platforms are hidden. |
| Analytics | `NEXT_PUBLIC_ANALYTICS_ENABLED=false` by default; optional limited first-party events, no third-party scripts or analytics cookies. See `docs/ANALYTICS.md`. |
| Premium | `NEXT_PUBLIC_PREMIUM_ENABLED=false` is reserved. There is no checkout or marketing system. |

Client `NEXT_PUBLIC_*` values are public and baked in at build time. Rebuild after changes. Never store provider secrets in these variables. Production fails on partially configured critical integrations; entirely disabled optional services do not prevent preview builds.

## Supabase setup

Versioned migrations live in `supabase/migrations` and the CLI configuration in `supabase/config.toml`. Do not use the deprecated `supabase/schema.sql`.

```text
supabase login
supabase link --project-ref <actual-project-ref>
supabase migration list
supabase db push --dry-run
supabase db push
```

Order: `20261002204904_production_baseline.sql`, then `20261002204956_production_security.sql`. Existing tables/data are preserved. The second migration aborts on duplicate normalized lead emails for deliberate reconciliation instead of deleting data. Read the exact rollout, RLS and daily retention scheduling instructions in [the launch checklist](docs/PRODUCTION_LAUNCH_CHECKLIST.md).

Private leads/events/trips/briefs/rate limits are restricted to the server service role. Public destinations/articles have explicit read policies. Published site content currently comes from curated repository data; the retained content tables are available for future controlled publishing. Trip tokens are random 256-bit capabilities, stored as hashes. Passport constraint notes are excluded from session drafts, trip storage and cache keys.

Database QA can run `tests/migrations.sql` with `psql -v ON_ERROR_STOP=1 -f tests/migrations.sql` **only on an isolated disposable database after migrations**. It rolls back fixtures and checks RLS/privileges, duplicate leads, limits and cleanup. It is not a command to run against production.

## Booking and commercial disclosure

`lib/booking.mjs` generates hotel, flight, activity and insurance links. Default links are ordinary provider searches, with `referral` UTMs and no partner claims. To enable a genuine approved partner, supply its complete HTTPS template in `NEXT_PUBLIC_AFFILIATE_HOTEL_URL`, `...FLIGHT_URL`, `...ACTIVITY_URL` or `...INSURANCE_URL` and enable the affiliate flag. `{destination}` is URL encoded. Preserve partner-required parameters and check partner rules before appending UTMs. Do not put secret keys into URLs.

Configured links are labelled and use `rel="sponsored noopener noreferrer"`; ordinary links use `noopener noreferrer`. Affiliate/provider clicks are internal events, never booking conversions. No live prices or availability are fetched. Follow partner reporting for actual attribution.

## Email and privacy

Verify the sender/domain in Resend, then test actual inbox delivery. Server success means the provider accepted the email, not that it arrived. A saved lead can succeed while email fails; the UI reports the separate outcomes. Marketing is absent: no automatic subscriptions, campaigns or unsupported “unsubscribe anytime” promise. Introducing marketing requires explicit consent and a working unsubscribe flow.

Local session storage preserves planner answers/results in the current tab; optional passport notes are omitted. Globe briefs use expiring local cache entries. The Clear draft action removes planner storage. No cookie banner is displayed because optional tracking cookies/scripts are not used. Privacy text describes providers and retention honestly; operator scheduling and qualified legal review remain launch tasks.

## Validation and security

Public JSON bodies are bounded to 24KB and validated with Zod. Inputs have field limits, normalized email, date checks, honeypots and safe errors. AI output is validated before rendering. Costly endpoints use per-visitor and global limits, bounded tokens, a 25-second timeout, no automatic retries, and process-local caching/deduplication. Limits fail closed if persistent protection is unavailable. Configure provider spending limits separately.

Same-origin mutations reject unrelated origins; wildcard CORS is removed. Headers include nosniff, frame restrictions, a referrer policy, permissions restrictions and a scoped CSP that preserves Next.js/WebGL. No service-role key reaches browser code. Preview/local indexing is disabled. See the launch checklist for remaining operational QA.

## Checks

```text
yarn test
yarn lint
yarn format:check
yarn build
```

Meaningful unit tests cover booking/UTMs, failed lead persistence, validation, dates, AI result contracts, location eligibility, secure socials, configuration and event privacy. Browser tests cover routes/internal links, planner back/recovery, API failures, globe handoff without WebGL, mobile sheet/menu controls, six viewports and automated WCAG checks.

```powershell
yarn playwright install chromium
# Start a production build on a separate port before browser checks.
yarn start --hostname 127.0.0.1 --port 3001
# In another terminal:
$env:QA_BASE_URL='http://127.0.0.1:3001'
yarn test:e2e
```

Optional `PLAYWRIGHT_CHROMIUM_EXECUTABLE` can select an already installed Chromium. `.qa/screenshots` and Playwright reports are ignored. Tests default to unconfigured checklist mode; live configured-provider QA is documented separately. Browser emulation/automated checks do not prove physical-device performance or screen-reader usability.

## Vercel preview, SEO and launch

`vercel.json` pins install/build commands. Push only the feature branch; use its authenticated Vercel preview and verify all routes/integrations before production. Set a genuine production domain/contact, complete migrations/retention/email/partner configuration, review legal copy and run owner QA. Do not merge automatically.

For UI/checklist QA before live services are configured, add `FEMINTRAVEL_PREVIEW_CHECKLIST=true` to the **Preview** environment, scoped to `feat/femintravel-production-v2`, and redeploy. This mode intentionally makes no provider calls or database writes, even if the project inherited credentials from an earlier version. Missing cloud save/contact delivery is stated clearly. It is not evidence that live AI, persistence or email works. Remove the branch override only after isolated preview credentials, migrations, request protection and real contact information have been configured and tested.

Legacy Vercel variable names need deliberate migration: this implementation uses server-only `SUPABASE_URL` instead of `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_APP_URL` instead of `NEXT_PUBLIC_BASE_URL`, and `OPENAI_TRAVEL_MODEL` instead of `AI_MODEL`. Set `RATE_LIMIT_SALT` and a verified `NEXT_PUBLIC_CONTACT_EMAIL`; never infer a public contact from private notification/admin addresses. Old variables can stay in place during review but are not aliases for the new configuration. Do not change production or apply migrations to a shared production database merely to unblock preview QA.

Sitemap, canonical/OG/X metadata and Article schema use the configured application origin. Local/preview pages are noindex; planner/shared-trip routes are excluded from indexing. A branded generated social image and actual favicon are included. The homepage never loads the globe bundle. Earth textures are local 2048px desktop/1024px mobile NASA assets with attribution; animation respects reduced motion.

[Production launch checklist](docs/PRODUCTION_LAUNCH_CHECKLIST.md) · [Analytics contract](docs/ANALYTICS.md)
