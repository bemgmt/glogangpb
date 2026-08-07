-- Security hardening for profiles, kiosk access, public API abuse controls,
-- and private photobooth storage. Payment and Shopify flows are intentionally
-- outside the scope of this migration.

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles AS profile
    WHERE profile.id = (SELECT auth.uid())
      AND profile.role = 'admin'
  );
$$;

REVOKE ALL ON FUNCTION private.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.is_admin() TO authenticated, service_role;

REVOKE ALL ON public.profiles FROM anon, authenticated;
GRANT SELECT ON public.profiles TO authenticated;
GRANT UPDATE (display_name, avatar_url, bio) ON public.profiles TO authenticated;

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;

DROP POLICY IF EXISTS "profiles_admin_select_all" ON public.profiles;
CREATE POLICY "profiles_admin_select_all"
  ON public.profiles FOR SELECT
  TO authenticated
  USING ((SELECT private.is_admin()));

ALTER FUNCTION public.handle_new_user() SET search_path = '';
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

DROP POLICY IF EXISTS "member_requests_admin_select" ON public.member_requests;
CREATE POLICY "member_requests_admin_select"
  ON public.member_requests FOR SELECT
  TO authenticated
  USING ((SELECT private.is_admin()));

DROP POLICY IF EXISTS "member_requests_admin_update" ON public.member_requests;
CREATE POLICY "member_requests_admin_update"
  ON public.member_requests FOR UPDATE
  TO authenticated
  USING ((SELECT private.is_admin()))
  WITH CHECK ((SELECT private.is_admin()));

DROP POLICY IF EXISTS "contact_submissions_insert_all" ON public.contact_submissions;
REVOKE ALL ON public.contact_submissions FROM anon, authenticated;
GRANT SELECT ON public.contact_submissions TO authenticated;
GRANT INSERT, SELECT ON public.contact_submissions TO service_role;

DROP POLICY IF EXISTS "contact_submissions_admin_select" ON public.contact_submissions;
CREATE POLICY "contact_submissions_admin_select"
  ON public.contact_submissions FOR SELECT
  TO authenticated
  USING ((SELECT private.is_admin()));

DROP POLICY IF EXISTS "digital_closet_admin_all" ON public.digital_closet;
CREATE POLICY "digital_closet_admin_all"
  ON public.digital_closet FOR ALL
  TO authenticated
  USING ((SELECT private.is_admin()))
  WITH CHECK ((SELECT private.is_admin()));
DROP POLICY IF EXISTS "digital_closet_service_all" ON public.digital_closet;

DROP POLICY IF EXISTS "vault_access_logs_admin_select" ON public.vault_access_logs;
CREATE POLICY "vault_access_logs_admin_select"
  ON public.vault_access_logs FOR SELECT
  TO authenticated
  USING ((SELECT private.is_admin()));
DROP POLICY IF EXISTS "vault_access_logs_service_insert" ON public.vault_access_logs;

DROP POLICY IF EXISTS "burn_requests_admin_all" ON public.burn_requests;
CREATE POLICY "burn_requests_admin_all"
  ON public.burn_requests FOR ALL
  TO authenticated
  USING ((SELECT private.is_admin()))
  WITH CHECK ((SELECT private.is_admin()));

DROP POLICY IF EXISTS "content_embeddings_select_authenticated" ON public.content_embeddings;
CREATE POLICY "content_embeddings_select_authenticated"
  ON public.content_embeddings FOR SELECT
  TO authenticated
  USING (true);
DROP POLICY IF EXISTS "content_embeddings_insert_service" ON public.content_embeddings;
DROP POLICY IF EXISTS "content_embeddings_update_service" ON public.content_embeddings;
DROP POLICY IF EXISTS "search_logs_insert_authenticated" ON public.search_logs;
REVOKE INSERT ON public.search_logs FROM anon, authenticated;

CREATE TABLE IF NOT EXISTS public.kiosk_access_passes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash text NOT NULL UNIQUE CHECK (length(token_hash) = 64),
  label text CHECK (label IS NULL OR length(label) <= 120),
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  redeemed_at timestamptz,
  CHECK (expires_at > created_at)
);

CREATE INDEX IF NOT EXISTS kiosk_access_passes_available_idx
  ON public.kiosk_access_passes (expires_at)
  WHERE redeemed_at IS NULL;

CREATE TABLE IF NOT EXISTS public.kiosk_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pass_id uuid NOT NULL REFERENCES public.kiosk_access_passes(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE CHECK (length(token_hash) = 64),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  CHECK (expires_at > created_at)
);

CREATE INDEX IF NOT EXISTS kiosk_sessions_expires_at_idx
  ON public.kiosk_sessions (expires_at);

ALTER TABLE public.kiosk_access_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kiosk_sessions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.kiosk_access_passes, public.kiosk_sessions FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.kiosk_access_passes, public.kiosk_sessions TO service_role;

CREATE OR REPLACE FUNCTION private.redeem_kiosk_pass(
  p_pass_hash text,
  p_session_hash text,
  p_session_expires_at timestamptz
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  claimed_pass_id uuid;
BEGIN
  IF length(p_pass_hash) <> 64
     OR length(p_session_hash) <> 64
     OR p_session_expires_at <= now() THEN
    RETURN false;
  END IF;

  UPDATE public.kiosk_access_passes
  SET redeemed_at = now()
  WHERE token_hash = p_pass_hash
    AND redeemed_at IS NULL
    AND expires_at > now()
  RETURNING id INTO claimed_pass_id;

  IF claimed_pass_id IS NULL THEN
    RETURN false;
  END IF;

  INSERT INTO public.kiosk_sessions (pass_id, token_hash, expires_at)
  VALUES (claimed_pass_id, p_session_hash, p_session_expires_at);
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION private.redeem_kiosk_pass(text, text, timestamptz)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION private.redeem_kiosk_pass(text, text, timestamptz)
  TO service_role;

CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  bucket text NOT NULL CHECK (length(bucket) BETWEEN 1 AND 80),
  key_hash text NOT NULL CHECK (length(key_hash) = 64),
  window_started_at timestamptz NOT NULL DEFAULT now(),
  request_count integer NOT NULL DEFAULT 1 CHECK (request_count > 0),
  PRIMARY KEY (bucket, key_hash)
);

ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.api_rate_limits FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.api_rate_limits TO service_role;

CREATE OR REPLACE FUNCTION private.consume_rate_limit(
  p_bucket text,
  p_key_hash text,
  p_limit integer,
  p_window_seconds integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  allowed boolean;
BEGIN
  IF length(p_bucket) NOT BETWEEN 1 AND 80
     OR length(p_key_hash) <> 64
     OR p_limit < 1
     OR p_window_seconds < 1 THEN
    RETURN false;
  END IF;

  INSERT INTO public.api_rate_limits AS limits (
    bucket, key_hash, window_started_at, request_count
  )
  VALUES (p_bucket, p_key_hash, now(), 1)
  ON CONFLICT (bucket, key_hash) DO UPDATE
  SET
    window_started_at = CASE
      WHEN limits.window_started_at <= now() - make_interval(secs => p_window_seconds)
        THEN now()
      ELSE limits.window_started_at
    END,
    request_count = CASE
      WHEN limits.window_started_at <= now() - make_interval(secs => p_window_seconds)
        THEN 1
      ELSE limits.request_count + 1
    END
  RETURNING request_count <= p_limit INTO allowed;

  RETURN allowed;
END;
$$;

REVOKE ALL ON FUNCTION private.consume_rate_limit(text, text, integer, integer)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION private.consume_rate_limit(text, text, integer, integer)
  TO service_role;

DROP POLICY IF EXISTS "photobooth_sessions_insert_own" ON public.photobooth_sessions;
CREATE POLICY "photobooth_sessions_insert_own"
  ON public.photobooth_sessions FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = user_id
    AND session_type = 'member'
  );

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'photos',
  'photos',
  false,
  10485760,
  ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "photos_select_own" ON storage.objects;
CREATE POLICY "photos_select_own"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'photos'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

DROP POLICY IF EXISTS "photos_insert_own" ON storage.objects;
CREATE POLICY "photos_insert_own"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'photos'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

DROP POLICY IF EXISTS "photos_delete_own" ON storage.objects;
CREATE POLICY "photos_delete_own"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'photos'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );
