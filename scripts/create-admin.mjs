#!/usr/bin/env node
/**
 * scripts/create-admin.mjs
 *
 * Promotes a user to admin by setting their role to 'admin' in the profiles table.
 *
 * Usage:
 *   node scripts/create-admin.mjs <email>
 *
 * Requires environment variables (loaded from .env.local):
 *   NEXT_PUBLIC_SUPABASE_URL   — e.g. https://<ref>.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY  — service role key (bypass RLS)
 */

import { createClient } from '@supabase/supabase-js'
import { join, resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import * as dotenv from 'dotenv'

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = resolve(__dirname, '..')

dotenv.config({ path: join(rootDir, '.env.local') })

// ---------------------------------------------------------------------------
// Validate args
// ---------------------------------------------------------------------------
const email = process.argv[2]?.trim()

if (!email || !email.includes('@')) {
  console.error('❌  Please provide a valid email address.\n')
  console.error('    Usage: node scripts/create-admin.mjs user@example.com')
  process.exit(1)
}

// ---------------------------------------------------------------------------
// Validate env
// ---------------------------------------------------------------------------
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    '❌  Missing environment variables.\n' +
    '    Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local',
  )
  process.exit(1)
}

// ---------------------------------------------------------------------------
// Supabase admin client (bypasses RLS)
// ---------------------------------------------------------------------------
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
})

// ---------------------------------------------------------------------------
// Promote user
// ---------------------------------------------------------------------------
async function createAdmin(targetEmail) {
  console.log(`🔍  Looking up profile for: ${targetEmail}`)

  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('id, display_name, role')
    .eq('email', targetEmail)
    .single()

  if (fetchError || !profile) {
    console.error(
      `❌  No profile found for "${targetEmail}".\n` +
      '    Make sure the user has signed up and their profile was created.',
    )
    process.exit(1)
  }

  console.log(`    Found: ${profile.display_name || profile.id} (current role: ${profile.role})`)

  if (profile.role === 'admin') {
    console.log(`ℹ️   User "${targetEmail}" is already an admin. No changes made.`)
    return
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ role: 'admin', updated_at: new Date().toISOString() })
    .eq('id', profile.id)

  if (updateError) {
    console.error(`❌  Failed to update role: ${updateError.message}`)
    process.exit(1)
  }

  console.log(`✅  Success! "${targetEmail}" has been promoted to admin.`)
  console.log(`    They can now access /admin after their next login.`)
}

createAdmin(email).catch((err) => {
  console.error('Unexpected error:', err.message)
  process.exit(1)
})
