-- The private implementations stay outside the exposed Data API schema.
-- These wrappers are callable only by the service role used in server routes.

CREATE OR REPLACE FUNCTION public.redeem_kiosk_pass(
  p_pass_hash text,
  p_session_hash text,
  p_session_expires_at timestamptz
)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT private.redeem_kiosk_pass(
    p_pass_hash,
    p_session_hash,
    p_session_expires_at
  );
$$;

REVOKE ALL ON FUNCTION public.redeem_kiosk_pass(text, text, timestamptz)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_kiosk_pass(text, text, timestamptz)
  TO service_role;

CREATE OR REPLACE FUNCTION public.consume_rate_limit(
  p_bucket text,
  p_key_hash text,
  p_limit integer,
  p_window_seconds integer
)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT private.consume_rate_limit(
    p_bucket,
    p_key_hash,
    p_limit,
    p_window_seconds
  );
$$;

REVOKE ALL ON FUNCTION public.consume_rate_limit(text, text, integer, integer)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_rate_limit(text, text, integer, integer)
  TO service_role;
