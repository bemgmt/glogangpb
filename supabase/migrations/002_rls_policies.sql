-- ============================================================
-- Glo Gang Community Portal — Row-Level Security Policies
-- Migration: 002_rls_policies.sql
-- ============================================================

-- ============================================================
-- profiles
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "profiles_admin_select_all"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ============================================================
-- event_rsvps
-- ============================================================
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "event_rsvps_select_own"
  ON public.event_rsvps FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "event_rsvps_insert_own"
  ON public.event_rsvps FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "event_rsvps_delete_own"
  ON public.event_rsvps FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- member_requests
-- ============================================================
ALTER TABLE public.member_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "member_requests_select_own"
  ON public.member_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "member_requests_insert_own"
  ON public.member_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can read and update all member requests
CREATE POLICY "member_requests_admin_select"
  ON public.member_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "member_requests_admin_update"
  ON public.member_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ============================================================
-- message_threads
-- ============================================================
ALTER TABLE public.message_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "message_threads_select_participant"
  ON public.message_threads FOR SELECT
  USING (auth.uid() = ANY(participant_ids));

CREATE POLICY "message_threads_insert"
  ON public.message_threads FOR INSERT
  WITH CHECK (auth.uid() = ANY(participant_ids));

CREATE POLICY "message_threads_update_participant"
  ON public.message_threads FOR UPDATE
  USING (auth.uid() = ANY(participant_ids));

-- ============================================================
-- business_messages
-- ============================================================
ALTER TABLE public.business_messages ENABLE ROW LEVEL SECURITY;

-- Select: only thread participants can read messages
CREATE POLICY "business_messages_select_participant"
  ON public.business_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.message_threads t
      WHERE t.id = thread_id
        AND auth.uid() = ANY(t.participant_ids)
    )
  );

-- Insert: only thread participants can post messages
CREATE POLICY "business_messages_insert_participant"
  ON public.business_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.message_threads t
      WHERE t.id = thread_id
        AND auth.uid() = ANY(t.participant_ids)
    )
  );

-- ============================================================
-- thread_read_status
-- ============================================================
ALTER TABLE public.thread_read_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "thread_read_status_select_own"
  ON public.thread_read_status FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "thread_read_status_upsert_own"
  ON public.thread_read_status FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "thread_read_status_update_own"
  ON public.thread_read_status FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================
-- content_embeddings
-- ============================================================
ALTER TABLE public.content_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "content_embeddings_select_authenticated"
  ON public.content_embeddings FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only service_role can insert/update embeddings (via API routes)
CREATE POLICY "content_embeddings_insert_service"
  ON public.content_embeddings FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "content_embeddings_update_service"
  ON public.content_embeddings FOR UPDATE
  USING (auth.role() = 'service_role');

-- ============================================================
-- search_logs
-- ============================================================
ALTER TABLE public.search_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "search_logs_insert_authenticated"
  ON public.search_logs FOR INSERT
  WITH CHECK (auth.role() IN ('authenticated', 'service_role'));

-- ============================================================
-- contact_submissions
-- ============================================================
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone (including anon) can submit a contact form
CREATE POLICY "contact_submissions_insert_all"
  ON public.contact_submissions FOR INSERT
  WITH CHECK (true);

-- Only admins can read submissions
CREATE POLICY "contact_submissions_admin_select"
  ON public.contact_submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ============================================================
-- photobooth_sessions
-- ============================================================
ALTER TABLE public.photobooth_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "photobooth_sessions_select_own"
  ON public.photobooth_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "photobooth_sessions_insert_own"
  ON public.photobooth_sessions FOR INSERT
  WITH CHECK (
    -- Allow kiosk sessions (user_id is null) or own sessions
    user_id IS NULL OR auth.uid() = user_id
  );

-- ============================================================
-- Storage Bucket Setup Notes
-- ============================================================
-- Storage bucket 'photos' should be created in Supabase dashboard (set to PRIVATE).
-- Apply the following RLS policies to storage.objects for the 'photos' bucket:
--
-- SELECT (read):
--   bucket_id = 'photos'
--   AND auth.uid()::text = (storage.foldername(name))[1]
--
-- INSERT (upload):
--   bucket_id = 'photos'
--   AND auth.uid()::text = (storage.foldername(name))[1]
--
-- DELETE:
--   bucket_id = 'photos'
--   AND auth.uid()::text = (storage.foldername(name))[1]
--
-- This ensures users can only read/write to their own folder: photos/{user_id}/*
