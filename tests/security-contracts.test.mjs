import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('profile and contact writes stay server-controlled', async () => {
  const migration = await read('supabase/migrations/20260807201532_secure_profiles_kiosk_and_storage.sql')
  const about = await read('app/(public)/about/page.tsx')

  assert.match(migration, /REVOKE ALL ON public\.profiles FROM anon, authenticated/)
  assert.match(migration, /GRANT UPDATE \(display_name, avatar_url, bio\) ON public\.profiles TO authenticated/)
  assert.match(migration, /REVOKE ALL ON public\.contact_submissions FROM anon, authenticated/)
  assert.match(about, /fetch\('\/api\/contact'/)
  assert.doesNotMatch(about, /from\(['"]contact_submissions['"]\)/)
})

test('kiosk access no longer trusts browser-local pass lists', async () => {
  const accessPage = await read('app/kiosk/access/page.tsx')
  const migration = await read('supabase/migrations/20260807201532_secure_profiles_kiosk_and_storage.sql')

  assert.match(accessPage, /fetch\('\/api\/kiosk\/redeem'/)
  assert.doesNotMatch(accessPage, /approved_codes|sampleCodes|localStorage/i)
  assert.match(migration, /token_hash text NOT NULL UNIQUE/)
  assert.match(migration, /WHERE redeemed_at IS NULL/)
})

test('public runtime metadata and embeds use production-safe hosts', async () => {
  const layout = await read('app/layout.tsx')
  const twitch = await read('components/home/TwitchEmbed.tsx')

  assert.doesNotMatch(layout, /localhost/)
  assert.match(twitch, /window\.location\.hostname/)
  assert.doesNotMatch(twitch, /parent=localhost/)
})

test('payment and commerce integrations are outside this hardening change', async () => {
  const migration = await read('supabase/migrations/20260807201532_secure_profiles_kiosk_and_storage.sql')
  assert.match(migration, /Payment and Shopify flows are intentionally/)
  assert.doesNotMatch(migration, /stripe_events|shopify_orders|square_payments/i)
})
