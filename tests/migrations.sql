-- Run only against an isolated disposable QA database after migrations.
-- The entire test transaction rolls back, including fixtures and cleanup effects.
BEGIN;
DO $$
DECLARE n integer; role_name text; table_name text; privilege_name text;
BEGIN
 SELECT count(*) INTO n FROM pg_class WHERE relnamespace='public'::regnamespace
 AND relname IN ('leads','events','trips','rate_limits','destination_briefs','destinations','blog_posts') AND relrowsecurity;
 IF n<>7 THEN RAISE EXCEPTION 'Expected RLS on all seven application tables'; END IF;
 FOREACH role_name IN ARRAY ARRAY['anon','authenticated'] LOOP
  FOREACH table_name IN ARRAY ARRAY['leads','events','trips','rate_limits','destination_briefs'] LOOP
   FOREACH privilege_name IN ARRAY ARRAY['SELECT','INSERT','UPDATE','DELETE'] LOOP
    IF has_table_privilege(role_name,'public.'||table_name,privilege_name) THEN
     RAISE EXCEPTION 'Unexpected % privilege for % on %',privilege_name,role_name,table_name;
    END IF;
   END LOOP;
  END LOOP;
  FOREACH table_name IN ARRAY ARRAY['destinations','blog_posts'] LOOP
   IF NOT has_table_privilege(role_name,'public.'||table_name,'SELECT') THEN
    RAISE EXCEPTION 'Public content is unreadable to %',role_name;
   END IF;
   FOREACH privilege_name IN ARRAY ARRAY['INSERT','UPDATE','DELETE'] LOOP
    IF has_table_privilege(role_name,'public.'||table_name,privilege_name) THEN
     RAISE EXCEPTION 'Public content write access exposed to %',role_name;
    END IF;
   END LOOP;
  END LOOP;
  IF has_function_privilege(role_name,'public.consume_rate_limit(text,integer,integer)','EXECUTE')
     OR has_function_privilege(role_name,'public.purge_expired_data()','EXECUTE') THEN
   RAISE EXCEPTION 'Private RPC exposed to %',role_name;
  END IF;
 END LOOP;
END $$;
SET LOCAL ROLE service_role;
DO $$
BEGIN
 IF NOT public.consume_rate_limit('qa-atomic-limit',2,60) THEN RAISE EXCEPTION 'First request rejected'; END IF;
 IF NOT public.consume_rate_limit('qa-atomic-limit',2,60) THEN RAISE EXCEPTION 'Second request rejected'; END IF;
 IF public.consume_rate_limit('qa-atomic-limit',2,60) THEN RAISE EXCEPTION 'Limit not enforced'; END IF;
 IF public.consume_rate_limit('qa-invalid-limit',0,60)
 OR public.consume_rate_limit('qa-invalid-window',2,0)
 OR public.consume_rate_limit(repeat('x',101),2,60) THEN
  RAISE EXCEPTION 'Invalid rate-limit parameters accepted';
 END IF;
END $$;
UPDATE public.rate_limits SET expires_at=now()-interval '1 second' WHERE key='qa-atomic-limit';
DO $$ BEGIN
 IF NOT public.consume_rate_limit('qa-atomic-limit',2,60) THEN
  RAISE EXCEPTION 'Expired request window did not reset';
 END IF;
 IF (SELECT count FROM public.rate_limits WHERE key='qa-atomic-limit')<>1 THEN
  RAISE EXCEPTION 'Reset request window retained its old count';
 END IF;
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
INSERT INTO public.blog_posts(slug,title,content,published_at)
VALUES('qa-published-policy','QA only','Rollback-only fixture',now()-interval '1 day'),
      ('qa-future-policy','QA only','Rollback-only fixture',now()+interval '1 day');
SET LOCAL ROLE anon;
DO $$ BEGIN
 BEGIN
  PERFORM id FROM public.leads LIMIT 1;
  RAISE EXCEPTION 'Anonymous private-table read unexpectedly succeeded';
 EXCEPTION WHEN insufficient_privilege THEN NULL;
 END;
 BEGIN
  INSERT INTO public.leads(name,email) VALUES('QA access must fail','rls-denied@femintravel.test');
  RAISE EXCEPTION 'Anonymous lead insertion unexpectedly succeeded';
 EXCEPTION WHEN insufficient_privilege THEN NULL;
 END;
 IF (SELECT count(*) FROM public.blog_posts WHERE slug='qa-published-policy')<>1 THEN
  RAISE EXCEPTION 'Published article is not readable';
 END IF;
 IF EXISTS(SELECT FROM public.blog_posts WHERE slug='qa-future-policy') THEN
  RAISE EXCEPTION 'Future article bypassed publication policy';
 END IF;
END $$;
SET LOCAL ROLE authenticated;
DO $$ BEGIN
 BEGIN
  PERFORM id FROM public.trips LIMIT 1;
  RAISE EXCEPTION 'Authenticated private-table read unexpectedly succeeded';
 EXCEPTION WHEN insufficient_privilege THEN NULL;
 END;
 BEGIN
  INSERT INTO public.trips(token_hash,plan,preferences,mode,expires_at)
  VALUES(repeat('0',64),'{}','{}','checklist',now()+interval '1 day');
  RAISE EXCEPTION 'Authenticated trip insertion unexpectedly succeeded';
 EXCEPTION WHEN insufficient_privilege THEN NULL;
 END;
 IF EXISTS(SELECT FROM public.blog_posts WHERE slug='qa-future-policy') THEN
  RAISE EXCEPTION 'Authenticated role can read a future article';
 END IF;
END $$;
ROLLBACK;
