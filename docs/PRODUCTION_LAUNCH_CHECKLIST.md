# FeminTravel production launch checklist

Work stays on `feat/femintravel-production-v2`. `main` is untouched. Complete preview QA before considering an owner-approved production merge. No production deployment is authorized by this checklist.

## Environment and deployment

- [ ] Create/link the owner-controlled Vercel project to `Mustusinho/femin-travel`. Use Next.js, Node 22, `yarn install --frozen-lockfile`, `yarn build` (see `vercel.json`).
- [ ] Use isolated preview credentials and a test database. Do not send test leads/messages to real customers.
- [ ] For UI/checklist QA before live setup, set `FEMINTRAVEL_PREVIEW_CHECKLIST=true` on Vercel **Preview**, scoped to `feat/femintravel-production-v2`, and redeploy. Inherited provider credentials are disabled; no live AI, storage, email, analytics or external geocoding is exercised. Production ignores this flag. Remove the branch override only when the isolated live-preview integration checks below can be completed.
- [ ] Copy names from `.env.example` into the appropriate Vercel environments; never commit actual values.
- [ ] Review legacy names deliberately: configure server-only `SUPABASE_URL`, `NEXT_PUBLIC_APP_URL` and `OPENAI_TRAVEL_MODEL` instead of relying on `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_BASE_URL` or `AI_MODEL`. Keep production variables untouched during preview repair. Private `EMAIL_TO`/admin addresses do not establish a public contact inbox.
- [ ] Set `NEXT_PUBLIC_APP_URL` to the real HTTPS application origin with no path and `NEXT_PUBLIC_CONTACT_EMAIL` to an actually owned, monitored inbox. Production builds reject missing values.
- [ ] Keep `SITE_INDEXING_ENABLED=false` until domain and production content are approved. Preview/local deployments always return noindex even when this flag is true.
- [ ] Run `yarn check:env`. A configured production integration requires persistent rate limiting and a private `RATE_LIMIT_SALT` of at least 32 characters. Generate it in a password manager or secure random generator.
- [ ] Keep `NEXT_PUBLIC_PREMIUM_ENABLED=false`; no checkout or marketing subscription exists.

## Supabase migrations and retention

- [ ] Create an owner-controlled Supabase project; take a database backup before applying migrations to existing data.
- [ ] Install the Supabase CLI (QA used 2.109.1), then run `supabase login` and `supabase link --project-ref <actual-project-ref>` locally. Do not place database passwords in committed command files.
- [ ] Run `supabase migration list` and `supabase db push --dry-run` to review pending versions against the linked project.
- [ ] Apply with `supabase db push` in this exact filename order:
  1. `20261002204904_production_baseline.sql`: compatible existing tables, indexes and curated destinations; no demo article seed.
  2. `20261002204956_production_security.sql`: email normalization/unique index, trips, shared rate limits, RLS, explicit grants, cleanup function.
- [ ] If duplicate normalized lead emails exist, the second migration stops. Reconcile duplicates deliberately after backup; it never deletes them automatically. Retry the migration after reconciliation. Never reset a remote production database.
- [ ] Do not run deprecated `supabase/schema.sql`. Existing schemas without migration history can use the compatible first migration; inspect the dry run and existing column types before applying.
- [ ] Set server-only `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` and `RATE_LIMIT_SALT`. Never use a `NEXT_PUBLIC_` service-role variable.
- [ ] Confirm anon/authenticated roles cannot access leads, events, saved trips, brief caches or rate limits. Only public destinations/articles have explicit read policies. AI/output caching is currently process-local and bounded; it is not persistence.
- [ ] Enable Supabase Cron in the owner dashboard and schedule `select public.purge_expired_data();` daily as a database owner. The versioned function deletes expired trips/rate limits, events older than 30 days and leads older than 90 days. Inspect the job's permissions and run history. No retention schedule is active merely because migrations exist.
- [ ] Verify a saved trip reloads in a separate browser, expires after 30 days, and excludes passport notes. Anyone holding its opaque link can view it. Tokens are stored only as SHA-256 hashes in the database.
- [ ] Verify a valid lead is persisted before success; duplicate email updates one record; a forced database failure returns an error and never shows Saved.

## AI and geocoding

- [ ] Add an owner-provided `OPENAI_API_KEY` only after Supabase request protection works. Set `OPENAI_TRAVEL_MODEL` to an available JSON-capable model (default `gpt-4o-mini`). Configure provider budget alerts and spending limits.
- [ ] Test genuine AI generation, valid ordered days, safe fallback on malformed output/timeout and provider failure. Calls use a 25-second timeout, bounded tokens, no automatic retries, one-hour process cache and in-flight deduplication.
- [ ] Verify per-visitor limits (trip generation 6/hour, shared AI 12/hour, chat 30/hour) and global paid-AI cap (200/hour). These are ceilings, not a monetary spending guarantee. Outside Vercel, public request identities share a conservative bucket.
- [ ] Optional: set a valid server-only `MAPBOX_TOKEN` with provider restrictions/budget. Otherwise cached Nominatim submitted searches are available with shared global throttling once storage is configured. Curated search works without external setup. No remote autocomplete requests are made for each keystroke.
- [ ] Check ocean, desert, remote region and distant reverse matches do not produce city-specific briefs. Verify geocoding attribution, failure messaging and city search.

## Transactional email and contact

- [ ] Verify a sending domain and sender in Resend. Set `RESEND_API_KEY`, `EMAIL_FROM` and the real contact inbox.
- [ ] Test contact validation, empty honeypot, rate limits, delivery acceptance and provider error states. Verify actual inbox delivery separately; provider acceptance is not delivery proof.
- [ ] Test kit email and saved-trip recovery email with explicit one-time requests. Persisting a kit request and emailing it have separate outcomes.
- [ ] Keep marketing disabled. There is no subscriber list, campaign sender or unsubscribe workflow. Add real consent/unsubscribe architecture before promising subscriptions.

## Booking, social and brand

- [ ] Leave ordinary provider searches enabled if no affiliate contract exists. They disclose that no relationship is configured; no live price or availability is claimed.
- [ ] For real partners only, set approved public HTTPS templates in `NEXT_PUBLIC_AFFILIATE_HOTEL_URL`, `...FLIGHT_URL`, `...ACTIVITY_URL`, `...INSURANCE_URL`, then set `NEXT_PUBLIC_AFFILIATES_ENABLED=true` and rebuild. Optional `{destination}` is URL encoded. Validate partner-required parameters and whether appended UTMs are allowed by the partner.
- [ ] Follow each enabled link and confirm partner attribution using actual partner reporting. An internal click is never a booking conversion.
- [ ] Optional: set actual profile URLs in the six `NEXT_PUBLIC_SOCIAL_*` variables and rebuild. Empty/invalid platforms are hidden. Social accounts are not technically required to launch.
- [ ] Check `/opengraph-image`, `/icon.svg`, Open Graph and X cards against the actual domain. Inspect social preview rendering.
- [ ] Review NASA Earth asset attribution in `public/earth/ATTRIBUTION.md`. It is a historical texture, not current satellite imagery. No endorsement is claimed.

## Privacy, security and content

- [ ] Have qualified counsel review About/contact/privacy/terms/affiliate disclosure/storage policy against the real operator, jurisdiction, providers and retention schedule before commercial launch. No company registration, team or compliance certification is invented.
- [ ] Decide whether first-party measurement is appropriate. It defaults off; see `docs/ANALYTICS.md`. No optional tracking cookies or third-party analytics scripts are loaded. Add functional consent before introducing trackers that require it.
- [ ] Review deployment logs/provider retention and access to service keys. Never log full lead, passport or chat payloads.
- [ ] Confirm cross-origin mutation requests fail, wildcard CORS is absent, private routes use no-store, preview pages are noindex, shared-trip pages are noindex with no-referrer.
- [ ] Inspect headers: nosniff, strict-origin referrer policy, frame denial, permissions restrictions and narrowly scoped CSP. The CSP intentionally does not claim to block every inline script; hardening it further requires testing Next.js and WebGL resources.
- [ ] Review all published articles and six destination pages. There are no live visa, safety, weather, availability or pricing guarantees. Check official sources before adding time-sensitive details; add genuine source and verification date only after verification.
- [ ] Scan changed files for secrets and production placeholders; review every match rather than deleting valid anchors, documentation examples or test fixtures.

## Vercel preview and owner QA

- [ ] Push the feature branch normally: `git push origin feat/femintravel-production-v2`. Never force push or merge `main` automatically.
- [ ] Open the Vercel preview generated from this commit; if Git integration is absent, create a preview from the authenticated owner project. Do not run a production deployment command.
- [ ] Run `yarn test`, `yarn lint`, `yarn build`, `git diff --check`.
- [ ] Run `yarn playwright install chromium` once, then `QA_BASE_URL=<actual-preview-url> yarn test:e2e` against a checklist-mode preview. On PowerShell set `$env:QA_BASE_URL='<actual-preview-url>'` first. If AI/storage is enabled, use the separate integration checks above; unconfigured-mode assertions intentionally expect features to be unavailable.
- [ ] If deployment protection is enabled, sign in using the owner's Vercel account. For automation use a private host-scoped Playwright cookie state in `.qa/` and set `QA_STORAGE_STATE` to its path; traces are disabled for these runs. Delete local authentication files after QA and revoke temporary automation bypass access when no longer needed. Keep deployment protection enabled.
- [ ] Check `/`, `/plan`, `/globe`, `/destinations`, all six destination slugs, `/blog`, all three article slugs, `/free-kit`, `/about`, `/contact`, `/privacy`, `/terms`, `/affiliate-disclosure`, `/cookies`, `/accessibility` and invalid-route 404s.
- [ ] Complete destination/date/companion/budget/style/interests/safety onboarding, go back, generate, inspect all results, print, save/recover/share/email where configured. Verify disabled integrations never produce success confirmations.
- [ ] Check internal links, affiliate links, real social links, contact and lead failures, API payload limits and 429 behavior.
- [ ] Check desktop 1280/1440/1920 and mobile 360×800/390×844/430×932. Test sheet expand/drag/close/scroll, keyboard-only planning, reduced motion and a browser without WebGL. Automated emulation does not replace actual iOS/Android touch-device QA.
- [ ] Inspect mobile results, footer, forms, visible errors and image loading. Review automated WCAG findings and perform screen-reader testing manually.
- [ ] Configure the production domain/DNS/TLS in the owner account, approve actual privacy/contact information and complete provider integration QA.
- [ ] Only after verified preview and owner approval consider the production merge/deploy. Keep a rollback commit and database backup; no destructive reset is needed.
