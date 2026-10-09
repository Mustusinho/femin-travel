# Isolated FeminTravel preview setup

Work only on `feat/femintravel-production-v2`. The owner will configure the new Supabase project from its separate account. Do not access or modify the older inactive project, Production environment variables, `main`, or a production deployment.

## Apply the existing migrations

Use the new isolated project's database, in this exact order:

1. `supabase/migrations/20261002204904_production_baseline.sql`
2. `supabase/migrations/20261002204956_production_security.sql`

The baseline creates five application tables and seeds ten destinations without demo articles. The security migration adds lead consent/source fields, a unique normalized-email index, trips and shared rate limits, RLS on all seven application tables, explicit role grants, restricted RPCs and retention cleanup. It preserves existing data and stops on duplicate normalized lead emails instead of deleting them. Apply each version once. Do not apply deprecated `supabase/schema.sql`.

Prefer the Supabase CLI so the filename versions are recorded in migration history. Use a separate CLI profile for the new account, verify the project reference in its dashboard, and review the dry run before pushing:

```text
npx --yes supabase --profile femintravel-preview login
npx --yes supabase --profile femintravel-preview link --project-ref <new-isolated-project-ref>
npx --yes supabase --profile femintravel-preview migration list
npx --yes supabase --profile femintravel-preview db push --dry-run
npx --yes supabase --profile femintravel-preview db push
npx --yes supabase --profile femintravel-preview migration list
```

The final list should show versions `20261002204904` and `20261002204956` locally and remotely. If you already applied the files in the dashboard SQL editor, reconcile those exact versions in migration history after confirming both completed; do not blindly rerun the security migration, which creates named policies. Never reset a remote database.

## Branch-specific Vercel variables

In the existing FeminTravel Vercel project, select **Preview** and restrict each override to Git branch **`feat/femintravel-production-v2`**. Keep Production unchecked. Several legacy values currently span Production and Preview; they are not isolated test credentials. Do not copy those secrets into the new preview.

| Variable expected by current code | Owner action |
| --- | --- |
| `SUPABASE_URL` | Set the new isolated project's actual HTTPS API URL. `NEXT_PUBLIC_SUPABASE_URL` is not an alias. |
| `SUPABASE_SERVICE_ROLE_KEY` | Set a server-only privileged key belonging to that new project. Do not use its anon/publishable key here or put a service key in a `NEXT_PUBLIC_` variable. |
| `RATE_LIMIT_SALT` | Already configured as a fresh private branch-only value on 2026-10-09. Keep it; minimum length is 32 characters. |
| `NEXT_PUBLIC_APP_URL` | Already configured to the actual feature-branch HTTPS preview alias. Use an origin with no path, query or fragment. `NEXT_PUBLIC_BASE_URL` is not an alias. |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Set the real, owned public contact inbox. This enables lead capture when storage is available and is the recipient of contact-form messages. Private `EMAIL_TO`/admin variables are not aliases. |
| `OPENAI_API_KEY` | Set an owner-approved preview-only OpenAI key. Its presence does not prove project access, quota or successful generation. |
| `OPENAI_TRAVEL_MODEL` | Optional central model selection; current default is `gpt-4o-mini`. `AI_MODEL` is not an alias. |
| `RESEND_API_KEY` | Optional preview-only transactional-email key. If email is unavailable, add an empty branch override to shadow the shared legacy key. |
| `EMAIL_FROM` | Pair with Resend: use an actually verified sender/domain. If email is unavailable, also add an empty branch override. Leave both email variables empty together. |
| `MAPBOX_TOKEN` | Optional preview-only geocoder credential. Add an empty branch override if not using it, so the shared legacy credential is not used when live mode is enabled. Curated destination search needs no token. |
| `FEMINTRAVEL_PREVIEW_CHECKLIST` | Keep the existing branch override `true` until the live-integration verification gate passes. This disables provider calls/storage even when credentials are present. |
| `NEXT_PUBLIC_ANALYTICS_ENABLED` | Keep `false` during initial provider QA unless limited first-party measurement is deliberately enabled. |
| `SITE_INDEXING_ENABLED` | Keep `false`; preview remains noindex regardless. |
| `NEXT_PUBLIC_AFFILIATES_ENABLED`, `NEXT_PUBLIC_PREMIUM_ENABLED` | Keep `false` unless actual relevant infrastructure exists. No checkout is implemented. |

Social URLs and approved affiliate templates are optional and listed in `.env.example`; no accounts or partner IDs are required for integration QA. Never paste secrets into chat, documentation or Git. Rebuild the preview after changing environment variables.

## Check configuration without removing checklist mode

After saving the branch overrides, run this from the repository with the authenticated Vercel account:

```text
npx --yes vercel env run --environment preview --git-branch feat/femintravel-production-v2 --project prj_dveqkegtlJFXPwqSZWluhARKGrHv --scope mustusinhos-projects -- yarn check:preview
```

This command checks configuration shape using the live requirements even while checklist mode is enabled. It makes no provider requests, prints no values and does not change checklist mode. It cannot prove key ownership, database migrations, RLS or email delivery; those remain separate live checks. A normal checklist-mode `yarn build` is not a substitute for this check.

## Live-verification handoff

Tell the agent when both migrations and branch overrides are complete. Provide only the new project reference or API URL and deployment URL, never keys. The agent will confirm the new target and variable scopes before making requests. Initial integration checks can use a private local candidate configured from preview-only values while the deployed checklist preview remains enabled. Only after those checks pass should the branch's checklist override be removed and a fresh Vercel Preview tested end to end.

- [ ] Verify all seven application tables have RLS; anon/authenticated roles cannot read/write private data or execute private RPCs. Published content remains read-only and future articles remain hidden.
- [ ] Verify a genuine app-generated trip is saved, reloads through its opaque link from a separate session, expires correctly and excludes passport constraints. Check the database contains a token hash rather than the public recovery token.
- [ ] Verify lead insertion, normalized duplicate-email upsert and database/provider failures never produce a false Saved confirmation.
- [ ] Verify genuine OpenAI output validates, ordered days match the request, and malformed/unavailable output uses an honestly labelled checklist. Test persistent per-visitor/global limits and fail-closed behavior.
- [ ] Verify the configured contact inbox, contact/kit/saved-trip email where Resend is available, and errors. Provider acceptance is not inbox-delivery proof; report separately what can actually be observed.
- [ ] Remove only the feature branch's checklist override after the live gate passes; redeploy to Preview, then test the deployed flows. Keep it enabled if required integrations fail or remain unverified.
- [ ] Update `docs/QA_REPORT.md` with the exact deployment, observed results and remaining blockers. Do not merge or deploy to Production.

Retention cleanup is provided by `public.purge_expired_data()` but is not scheduled by these migrations. Schedule it in the new project's owner dashboard before launch; see `PRODUCTION_LAUNCH_CHECKLIST.md`.
