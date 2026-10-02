-- Applies after production_baseline. Preserves existing data; duplicate email resolution is an owner action.
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS source text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS consent_at timestamptz;
UPDATE public.leads SET email=lower(trim(email));
DO $$ BEGIN
 IF EXISTS (SELECT email FROM public.leads GROUP BY email HAVING count(*)>1) THEN
  RAISE EXCEPTION 'Duplicate lead emails exist. Reconcile duplicates before applying this migration; no records were deleted.';
 END IF;
END $$;
CREATE UNIQUE INDEX IF NOT EXISTS leads_email_unique ON public.leads(email);
CREATE TABLE IF NOT EXISTS public.trips (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), token_hash text UNIQUE NOT NULL,
 plan jsonb NOT NULL, preferences jsonb NOT NULL, mode text NOT NULL CHECK(mode IN ('ai','checklist')),
 created_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS trips_expiry_idx ON public.trips(expires_at);
CREATE TABLE IF NOT EXISTS public.rate_limits (
 key text PRIMARY KEY, count integer NOT NULL DEFAULT 0, expires_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS rate_limits_expiry_idx ON public.rate_limits(expires_at);
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destination_briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.leads,public.events,public.trips,public.rate_limits,public.destination_briefs FROM PUBLIC,anon,authenticated;
REVOKE ALL ON public.destinations,public.blog_posts FROM anon,authenticated;
GRANT SELECT ON public.destinations,public.blog_posts TO anon,authenticated;
CREATE POLICY public_destinations_read ON public.destinations FOR SELECT TO anon,authenticated USING (true);
CREATE POLICY public_articles_read ON public.blog_posts FOR SELECT TO anon,authenticated USING (published_at<=now());
GRANT ALL ON public.leads,public.events,public.trips,public.rate_limits,public.destination_briefs,public.destinations,public.blog_posts TO service_role;
-- Atomic fixed window, callable only by the server's service role. No SECURITY DEFINER bypass.
CREATE OR REPLACE FUNCTION public.consume_rate_limit(p_key text,p_limit integer,p_window integer)
RETURNS boolean LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE used integer;
BEGIN
 IF p_limit<1 OR p_window<1 OR length(p_key)>100 THEN RETURN false; END IF;
 INSERT INTO public.rate_limits(key,count,expires_at) VALUES(p_key,1,now()+make_interval(secs=>p_window))
 ON CONFLICT(key) DO UPDATE SET
 count=CASE WHEN public.rate_limits.expires_at<=now() THEN 1 ELSE public.rate_limits.count+1 END,
 expires_at=CASE WHEN public.rate_limits.expires_at<=now() THEN now()+make_interval(secs=>p_window) ELSE public.rate_limits.expires_at END
 RETURNING count INTO used;
 RETURN used<=p_limit;
END $$;
REVOKE ALL ON FUNCTION public.consume_rate_limit(text,integer,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.consume_rate_limit(text,integer,integer) TO service_role;
-- Schedule this function daily via your database scheduler; documented in the launch checklist.
CREATE OR REPLACE FUNCTION public.purge_expired_data()
RETURNS void LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$
 DELETE FROM public.trips WHERE expires_at<now();
 DELETE FROM public.rate_limits WHERE expires_at<now();
 DELETE FROM public.events WHERE created_at<now()-interval '30 days';
 DELETE FROM public.leads WHERE created_at<now()-interval '90 days';
$$;
REVOKE ALL ON FUNCTION public.purge_expired_data() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.purge_expired_data() TO service_role;
