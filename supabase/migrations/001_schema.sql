-- ============================================================
-- Glo Gang Community Portal — Database Schema
-- Migration: 001_schema.sql
-- ============================================================

-- Enable pgvector extension for AI semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================
-- profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id                uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email             text NOT NULL,
  display_name      text,
  membership_tier   text NOT NULL DEFAULT 'free',
  membership_status text NOT NULL DEFAULT 'active',
  role              text NOT NULL DEFAULT 'user',
  avatar_url        text,
  bio               text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- event_rsvps
-- ============================================================
CREATE TABLE IF NOT EXISTS public.event_rsvps (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sanity_event_id text NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, sanity_event_id)
);

-- ============================================================
-- member_requests
-- ============================================================
CREATE TABLE IF NOT EXISTS public.member_requests (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject    text NOT NULL,
  message    text NOT NULL,
  status     text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- message_threads
-- ============================================================
CREATE TABLE IF NOT EXISTS public.message_threads (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_ids uuid[] NOT NULL DEFAULT '{}',
  title           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- business_messages
-- ============================================================
CREATE TABLE IF NOT EXISTS public.business_messages (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id  uuid NOT NULL REFERENCES public.message_threads(id) ON DELETE CASCADE,
  sender_id  uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content    text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- thread_read_status
-- ============================================================
CREATE TABLE IF NOT EXISTS public.thread_read_status (
  thread_id    uuid NOT NULL REFERENCES public.message_threads(id) ON DELETE CASCADE,
  user_id      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_read_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (thread_id, user_id)
);

-- ============================================================
-- content_embeddings (pgvector)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.content_embeddings (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL CHECK (content_type IN ('artist', 'event', 'news')),
  sanity_id    text NOT NULL,
  content_text text NOT NULL,
  embedding    vector(1536),
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (content_type, sanity_id)
);

-- Index for cosine similarity search
CREATE INDEX IF NOT EXISTS content_embeddings_embedding_idx
  ON public.content_embeddings
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- ============================================================
-- search_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS public.search_logs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query         text NOT NULL,
  results_count integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- contact_submissions
-- ============================================================
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  email      text NOT NULL,
  message    text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- photobooth_sessions
-- ============================================================
CREATE TABLE IF NOT EXISTS public.photobooth_sessions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES public.profiles(id) ON DELETE SET NULL, -- nullable for kiosk mode
  session_type text NOT NULL DEFAULT 'member' CHECK (session_type IN ('member', 'kiosk')),
  photo_count  integer NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- updated_at trigger helper
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER message_threads_updated_at
  BEFORE UPDATE ON public.message_threads
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- on_auth_user_created — auto-create profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    SPLIT_PART(NEW.email, '@', 1)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
