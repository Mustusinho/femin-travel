# Feature branch QA — 2026-10-09

Branch: `feat/femintravel-production-v2`, based on recoverable baseline `dd340ed`. Local and remote `main` remain `d7b658c`. No branch switch, reset, merge or force push was performed.

## Verified locally

| Check | Result |
| --- | --- |
| Dependency installation | Yarn install passed; lockfile committed |
| Production build | `yarn build` passed on Next.js 15.5.27 / React 18 |
| Logic tests | 13/13 passed, including preview isolation, a live-requirements preflight that keeps checklist mode enabled, and strict app-origin validation |
| Production browser suite | 10/10 passed on the deployed Vercel checklist preview; earlier local production suite also passed |
| Lint | ESLint CLI passed, including undefined-variable checks |
| Formatting | Prettier check passed |
| Dependencies | Full Yarn audit on 2026-10-02: zero low/moderate/high/critical findings; no dependency changes since that check |
| Database migrations | Both migrations reapplied to fresh, network-isolated local PostgreSQL 16 and 17 on 2026-10-09; expanded rollback-only assertions passed. No remote database migrations applied by this agent |
| Routes/links | Rendered navigation crawled successfully; unknown destination/article routes return 404; no empty/#/javascript navigation links |
| Desktop/mobile | 1280, 1440, 1920 and 360×800, 390×844, 430×932 passed viewport-fit checks; planner results also checked at 390/1440 |
| Accessibility | Core-page axe WCAG checks have no serious/critical findings; mobile menu/sheet and chat keyboard behavior tested |
| Assets | Branded social image returns image/png, favicon exists, NASA desktop/mobile textures are local with attribution |
| Security headers | Actual deployed preview responses confirmed nosniff, frame restrictions, permissions, scoped CSP and noindex; same-origin planner accepted and unrelated origin rejected |
| Git/secret scan | Feature history preserved, diff check passed, no credential-pattern matches in tracked files. The owner's existing uncommitted `.gitignore` addition is preserved separately |

The browser suite verifies both the real unconfigured product and isolated configured-UI HTTP fixtures. Fixtures exercise lead/save failure-before-success and chat errors without calling external providers. They are not evidence of live Supabase/OpenAI/Resend integration success.

All required public pages and visible internal links were crawled, including the six curated destination pages and three articles. The standard full planner flow generates a labelled checklist when no AI key is available; it preserves current-tab drafts and does not claim cloud saving. Missing storage, email and analytics produce explicit unavailable/disabled responses. Geocoding alternatives remain usable without WebGL.

Screenshots were inspected for homepage composition, results, mobile globe/sheet and social branding. Heavy globe code is loaded only on `/globe`; homepage first-load JS is approximately 113KB and planner approximately 128KB in the build report. Desktop/mobile Earth textures are approximately 345KB/82KB. No measured Lighthouse score or physical-device performance claim is made. Actual iOS/Android touch, screen-reader and provider-configured QA remain launch checks.

## Deployed preview verification

The feature branch was pushed normally. Authenticated Vercel logs identified the earlier failure: the project retained legacy variable names and provider credentials, while `SUPABASE_URL`, `RATE_LIMIT_SALT` and `NEXT_PUBLIC_CONTACT_EMAIL` were missing. Dependency installation succeeded; the deliberate prebuild environment checks stopped the build. Only variable names/configuration presence were inspected; credentials were not printed.

Commit `df10675` introduced `FEMINTRAVEL_PREVIEW_CHECKLIST`, enabled only for this branch's Vercel Preview environment. Production ignores it. AI, storage, email, analytics and external geocoding remain disabled even if legacy keys are inherited. This allows honest checklist/UI QA without paid provider calls, test emails or writes to a shared production database. Production validation remains enforced.

Deployment `dpl_Hoo36yZQfQjXZyMDZycBXAvAChhJ`, commit `df10675`, reached **READY** on Node 24.x:

- [Immutable tested preview](https://femin-travel-hkvxp2362-mustusinhos-projects.vercel.app)
- [Feature branch preview alias](https://femin-travel-git-feat-femintravel-p-776a62-mustusinhos-projects.vercel.app)
- [Deployment dashboard](https://vercel.com/mustusinhos-projects/femin-travel/Hoo36yZQfQjXZyMDZycBXAvAChhJ)

Deployment protection remains enabled. Authenticated QA used the owner's Vercel CLI automation bypass; temporary host-scoped browser cookie files were deleted afterwards. Authenticated Playwright runs disable traces to keep access cookies out of artifacts. A reviewer may need to sign in to Vercel to open the preview. The owner can revoke the CLI-generated automation bypass in project settings when it is no longer needed.

All 10 browser tests passed against this deployment in 43.4 seconds. They covered public routes and all rendered internal links, planner validation/back navigation/result recovery, disabled persistence and invalid API requests, globe handoff without WebGL, mobile sheet dragging/menu controls, six viewport sizes, and core-page WCAG checks. Three tests use isolated HTTP fixtures to validate configured chat/lead/save UI outcomes; they are not live integration tests.

Additional deployed response checks confirmed all optional capabilities are false, a correctly identified curated Portugal search works, unconfigured remote lookup/contact return 503, disabled analytics returns `recorded: false`, and briefs/trip generation return labelled preparation checklists. Same-origin generation works with browser headers; an unrelated origin returns 403. PNG social image (approximately 114KB), SVG icon and both NASA textures return their actual media types. Open Graph references the real branch preview URL, not localhost. Preview sitemap is empty; pages use noindex metadata/headers and robots permits crawlers to read those headers.

## Owner QA and external requirements

| Area | Current status / remaining action |
| --- | --- |
| Branch / commits | `feat/femintravel-production-v2`; logical commits pushed normally. `main` remains `d7b658c`; no production merge/deployment |
| Build / tests | Local `yarn build`, 13 logic tests, lint and formatting passed; earlier Vercel build and 10 deployed browser tests passed |
| Routes | Homepage, planner, globe, six destinations, three articles, kit, About/contact/legal/accessibility and visible internal navigation verified |
| Database | Reproducible migrations and isolated SQL QA passed. Configure an isolated preview project, apply migrations and test actual lead/save/recovery/limits before enabling storage |
| OpenAI | Existing Vercel key name detected; availability/quota not tested. Preview intentionally disables calls. Validate genuine generation after persistent request protection is configured |
| Email / contact | Existing Resend/sender variable names detected; sending domain and delivery unverified. Configure the real public inbox before enabling contact or lead capture |
| Affiliates | Ordinary provider searches work with disclosure; no partner credentials/relationships configured or claimed |
| Social | No accounts configured; absent platforms are hidden. Actual account URLs are optional |
| Legal / trust | Shared footer and real information pages verified. Actual operator/contact details and qualified legal review remain launch tasks |
| Security | Validated/bounded APIs, production rate-limit guards and deployed headers verified. No credentials exposed; production environment values were not modified |
| Performance / mobile | Lazy globe, local reduced-size textures, six responsive widths and mobile controls verified. Physical iOS/Android, screen-reader and measured field performance QA remain |
| Preview | Checklist preview READY and tested; live AI/persistence/email/provider QA remains incomplete |

The required live-preview configuration is an isolated `SUPABASE_URL` and service role, versioned migrations, a private 32+ character `RATE_LIMIT_SALT`, an actual `NEXT_PUBLIC_APP_URL`, and a verified `NEXT_PUBLIC_CONTACT_EMAIL`. Existing provider keys should be reused only after availability/ownership and isolation are confirmed; new keys are not assumed necessary. Resend sending-domain verification, genuine partner templates and social URLs are optional setup according to which features the owner enables. Schedule retention cleanup and validate provider spending limits before launch.

**Ready for owner QA; do not merge yet.** Use [the production launch checklist](PRODUCTION_LAUNCH_CHECKLIST.md), complete isolated live-provider QA and approve actual contact/legal/domain configuration before considering production. No production-ready claim or automatic production merge/deploy is made.

## Owner-managed isolated database handoff — 2026-10-09

The owner clarified that the new Supabase project belongs to a separate account and will apply its migrations/configure credentials personally. The older inactive Femin Travel project was not queried or modified. No remote application database was linked, migrated or written to. The existing Supabase connection/CLI cannot identify the new target; that does not mean the new project does not exist.

Only two branch-specific Vercel Preview variables were added: `NEXT_PUBLIC_APP_URL` uses the actual feature-preview alias, and `RATE_LIMIT_SALT` is a fresh private random value. The existing branch checklist override remains `true`. Production variable IDs, scopes and modification metadata were compared before/after and were unchanged. No secrets were printed or committed.

Migration review and tests now cover all seven RLS flags; all 40 private-table CRUD privilege checks for anon/authenticated; public-content read-only grants; actual denied reads/inserts; private RPC restrictions; published/future article visibility; duplicate lead upsert; trip expiry cleanup; invalid rate-limit inputs; and expiry-window reset. The two exact repository migrations and `tests/migrations.sql` passed on dedicated local PostgreSQL 16 and 17 containers. All fixtures rolled back to zero leads/trips/rate limits/articles. Only the two QA containers created for this test were removed; existing containers were untouched. This is local SQL evidence, not durable cloud-storage or live Supabase API verification.

`yarn check:preview` was added. It checks live-preview configuration shape despite checklist mode, makes no provider requests, prints variable names only and leaves checklist mode unchanged. Running it through authenticated `vercel env run --environment preview --git-branch feat/femintravel-production-v2` returned the expected failure: `SUPABASE_URL` and `NEXT_PUBLIC_CONTACT_EMAIL` are absent, so storage/abuse-protection and email prerequisites are not ready. The salt is configured; the protection error also reflects missing storage. Existing legacy OpenAI/Supabase/Resend keys are shared across Production and Preview and were not used for live calls. Their mere presence is not evidence of isolated credentials.

Current blockers / unverified flows:

- The owner must apply versions `20261002204904`, then `20261002204956`, to the new isolated project and provide its non-secret reference/API URL.
- Branch-specific preview-only Supabase/OpenAI credentials and the real public contact inbox still need configuration. Optional Resend requires a preview-only key and verified sender; otherwise both email values should be empty branch overrides. Optional Mapbox should likewise use a preview-only token or an empty override.
- Remote RLS/Data API access, durable trip/lead save/recovery, database failure handling, genuine AI generation and persistent app rate limits have not yet been tested against the new project.
- No live contact test or transactional email was sent. Sender verification, provider acceptance and actual inbox delivery remain unverified.
- Checklist mode has not been removed. Live configuration and initial integration checks must pass before enabling the branch's live mode and testing its deployed flows.

The exact migration order, CLI/profile commands, current variable names and safe handoff steps are in [the isolated preview setup guide](ISOLATED_PREVIEW_SETUP.md). The owner can supply setup completion and the project/deployment identifiers without sending any secret values. Main and Production remain untouched; no merge or production deployment is authorized.

The resulting commit `cb34baf` was pushed normally and built successfully as Vercel Preview deployment `dpl_3i5Amxww1b65g6qVgtP7Ny4Vpomw`: [protected preview](https://femin-travel-41c9m0z2f-mustusinhos-projects.vercel.app). All 10 deployed browser tests passed in 43.3 seconds, including rendered routes/internal links, planner recovery, rejected API requests, unavailable persistence, globe handoff, six viewport sizes, mobile sheet interaction and automated accessibility. The configured-form failure tests use isolated HTTP fixtures, not live providers. The capability endpoint confirmed AI/save/email/contact-form/leads/analytics are all disabled. Vercel protection remained enabled; temporary private QA authentication files were removed. Local `yarn build`, 13 logic tests, lint and formatting also passed for this commit. These results verify checklist-mode behavior and do not clear the live-integration blockers above.
