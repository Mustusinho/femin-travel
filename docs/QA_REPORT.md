# Feature branch QA — 2026-10-02

Branch: `feat/femintravel-production-v2`, based on recoverable baseline `dd340ed`. Local and remote `main` remain `d7b658c`. No branch switch, reset, merge or force push was performed.

## Verified locally

| Check | Result |
| --- | --- |
| Dependency installation | Yarn install passed; lockfile committed |
| Production build | `yarn build` passed on Next.js 15.5.27 / React 18 |
| Logic tests | 11/11 passed |
| Production browser suite | 10/10 passed on local production build |
| Lint | ESLint CLI passed, including undefined-variable checks |
| Formatting | Prettier check passed |
| Dependencies | Full Yarn audit: zero low/moderate/high/critical findings at QA time |
| Database migrations | Both migrations applied to isolated PostgreSQL 16; rollback-only assertions passed for RLS/privileges, rate limits, duplicate leads and expiry cleanup |
| Routes/links | Rendered navigation crawled successfully; unknown destination/article routes return 404; no empty/#/javascript navigation links |
| Desktop/mobile | 1280, 1440, 1920 and 360×800, 390×844, 430×932 passed viewport-fit checks; planner results also checked at 390/1440 |
| Accessibility | Core-page axe WCAG checks have no serious/critical findings; mobile menu/sheet and chat keyboard behavior tested |
| Assets | Branded social image returns image/png, favicon exists, NASA desktop/mobile textures are local with attribution |
| Security headers | Actual local production responses confirmed nosniff, frame restrictions, permissions, scoped CSP and preview noindex |
| Git/secret scan | Clean feature history, diff check passed, no credential-pattern matches in tracked changes |

The browser suite verifies both the real unconfigured product and isolated configured-UI HTTP fixtures. Fixtures exercise lead/save failure-before-success and chat errors without calling external providers. They are not evidence of live Supabase/OpenAI/Resend integration success.

All required public pages and visible internal links were crawled, including the six curated destination pages and three articles. The standard full planner flow generates a labelled checklist when no AI key is available; it preserves current-tab drafts and does not claim cloud saving. Missing storage, email and analytics produce explicit unavailable/disabled responses. Geocoding alternatives remain usable without WebGL.

Screenshots were inspected for homepage composition, results, mobile globe/sheet and social branding. Heavy globe code is loaded only on `/globe`; homepage first-load JS is approximately 113KB and planner approximately 128KB in the build report. Desktop/mobile Earth textures are approximately 345KB/82KB. No measured Lighthouse score or physical-device performance claim is made. Actual iOS/Android touch, screen-reader and provider-configured QA remain launch checks.

## External state and preview gate

The feature branch was pushed normally. Vercel triggered deployment `dpl_CYZd8H97UvN5tS5JJUpo7XMjRPhb` for commit `67a4c1a` and reported **failure**. [Deployment dashboard](https://vercel.com/mustusinhos-projects/femin-travel/CYZd8H97UvN5tS5JJUpo7XMjRPhb). This workspace has no Vercel CLI login/token to inspect private build logs. No failure cause is asserted without those logs. The owner has been asked for the first build error or authenticated access; the suggested inspection command is:

```text
npx vercel inspect dpl_CYZd8H97UvN5tS5JJUpo7XMjRPhb --logs
```

Preview route/provider QA is **not verified**. Subsequent commits can trigger a new deployment; check the latest feature SHA's Vercel status before approving it. The local build succeeds, which does not prove the remote environment/install configuration is complete.

Local optional capabilities at QA time: AI, cloud save, email, contact form, lead collection and analytics are all disabled. The real production domain/contact, Supabase project/migrations/shared-limit salt, OpenAI access and optional Resend/affiliate/social setup are owner-managed. Remote Vercel variable values have not been inspected; do not assume they match the empty local environment.

**Do not merge yet.** Resolve the preview failure, configure and test actual provider integrations, and complete owner QA using [the production launch checklist](PRODUCTION_LAUNCH_CHECKLIST.md). No production-ready claim or automatic production merge/deploy is made.
