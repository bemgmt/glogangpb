-- ============================================================
-- Glo Gang Community Portal — Burn Requests
-- Migration: 004_burn_requests.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS public.burn_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    digital_closet_id UUID REFERENCES public.digital_closet(id) ON DELETE CASCADE,
    status VARCHAR DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.burn_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own requests
CREATE POLICY "burn_requests_select_own"
  ON public.burn_requests FOR SELECT
  USING (auth.uid() = profile_id);

-- Users can insert their own requests
CREATE POLICY "burn_requests_insert_own"
  ON public.burn_requests FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

-- Admins can view and update all requests
CREATE POLICY "burn_requests_admin_all"
  ON public.burn_requests FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- updated_at trigger
CREATE OR REPLACE TRIGGER burn_requests_updated_at
  BEFORE UPDATE ON public.burn_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
