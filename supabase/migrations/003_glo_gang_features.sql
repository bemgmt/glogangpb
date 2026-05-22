-- ============================================================
-- Glo Gang Community Portal — Tier & Gamification Features
-- Migration: 003_glo_gang_features.sql
-- ============================================================

-- 1. Extend profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS current_tier VARCHAR DEFAULT 'the_block';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS lifetime_spend NUMERIC(10, 2) DEFAULT 0.00;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_status VARCHAR DEFAULT 'inactive'; -- 'inactive', 'active_t2', 'active_t3'
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS drop_streak_count INT DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS passport_token_id UUID;

-- 2. Create vault_access_logs table
CREATE TABLE IF NOT EXISTS public.vault_access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    accessed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    ip_address TEXT,
    action_taken TEXT
);

-- 3. Create digital_closet table
CREATE TABLE IF NOT EXISTS public.digital_closet (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    sku_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    image_url TEXT,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    is_burned BOOLEAN DEFAULT FALSE
);

-- ============================================================
-- RLS Policies
-- ============================================================

ALTER TABLE public.vault_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_closet ENABLE ROW LEVEL SECURITY;

-- digital_closet policies
CREATE POLICY "digital_closet_select_own"
  ON public.digital_closet FOR SELECT
  USING (auth.uid() = profile_id);

CREATE POLICY "digital_closet_admin_all"
  ON public.digital_closet FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "digital_closet_service_all"
  ON public.digital_closet FOR ALL
  USING (auth.role() = 'service_role');

-- vault_access_logs policies
CREATE POLICY "vault_access_logs_insert_own"
  ON public.vault_access_logs FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "vault_access_logs_admin_select"
  ON public.vault_access_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "vault_access_logs_service_insert"
  ON public.vault_access_logs FOR INSERT
  WITH CHECK (auth.role() = 'service_role');
