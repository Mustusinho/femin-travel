-- Run only against an isolated disposable QA database after migrations.
-- The entire test transaction rolls back, including fixtures and cleanup effects.
BEGIN;
DO $$
DECLARE n integer;
BEGIN
 SELECT count(*) INTO n FROM pg_class WHERE relnamespace='public'::regnamespace
 AND relname IN ('leads','events','trips','rate_limits','destination_briefs','destinations','blog_posts') AND relrowsecurity;
 IF n<>7 THEN RAISE EXCEPTION 'Expected RLS on all seven application tables'; END IF;
 IF has_table_privilege('anon','public.leads','SELECT') OR has_table_privilege('authenticated','public.trips','SELECT') THEN
  RAISE EXCEPTION 'Private data is exposed';
 END IF;
 IF has_function_privilege('anon','public.consume_rate_limit(text,integer,integer)','EXECUTE') THEN
  RAISE EXCEPTION 'Public rate-limit RPC exposed';
 END IF;
END $$;
SET LOCAL ROLE service_role;
DO $$
BEGIN
 IF NOT public.consume_rate_limit('qa-atomic-limit',2,60) THEN RAISE EXCEPTION 'First request rejected'; END IF;
 IF NOT public.consume_rate_limit('qa-atomic-limit',2,60) THEN RAISE EXCEPTION 'Second request rejected'; END IF;
 IF public.consume_rate_limit('qa-atomic-limit',2,60) THEN RAISE EXCEPTION 'Limit not enforced'; END IF;
END $$;
INSERT INTO public.leads(name,email,consent_at) VALUES('QA only','migration-qa@femintravel.test',now());
INSERT INTO public.leads(name,email,consent_at) VALUES('QA updated','migration-qa@femintravel.test',now())
ON CONFLICT(email) DO UPDATE SET name=excluded.name;
DO $$ BEGIN
 IF (SELECT count(*) FROM public.leads WHERE email='migration-qa@femintravel.test')<>1 THEN
  RAISE EXCEPTION 'Duplicate email was not deduplicated';
 END IF;
END $$;
INSERT INTO public.trips(token_hash,plan,preferences,mode,expires_at)
VALUES('qa-expired','{}','{}','checklist',now()-interval '1 day'),('qa-current','{}','{}','checklist',now()+interval '1 day');
SELECT public.purge_expired_data();
DO $$ BEGIN
 IF EXISTS(SELECT FROM public.trips WHERE token_hash='qa-expired') THEN RAISE EXCEPTION 'Expired trip retained'; END IF;
 IF NOT EXISTS(SELECT FROM public.trips WHERE token_hash='qa-current') THEN RAISE EXCEPTION 'Current trip deleted'; END IF;
END $$;
ROLLBACK;
