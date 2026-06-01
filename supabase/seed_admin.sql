-- Seed: Set derek@bem.studio as admin
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'derek@bem.studio';
