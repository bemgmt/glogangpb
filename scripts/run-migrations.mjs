#!/usr/bin/env node
/**
 * scripts/run-migrations.mjs
 *
 * Connects to the Supabase Postgres database using the pg library and runs
 * all SQL migration files in supabase/migrations/ in ascending filename order.
 *
 * Usage:
 *   node scripts/run-migrations.mjs
 *
 * Requires environment variables (loaded from .env.local):
 *   NEXT_PUBLIC_SUPABASE_URL   — e.g. https://<ref>.supabase.co
 *   SUPABASE_DB_PASSWORD       — your database password
 */

import { readdir, readFile } from 'fs/promises'
import { join, resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import pg from 'pg'
import * as dotenv from 'dotenv'

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = resolve(__dirname, '..')

// Load .env.local
dotenv.config({ path: join(rootDir, '.env.local') })

const { Pool } = pg

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const dbPassword = process.env.SUPABASE_DB_PASSWORD

if (!supabaseUrl || !dbPassword) {
  console.error(
    '❌  Missing environment variables.\n' +
    '    Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_DB_PASSWORD are set in .env.local',
  )
  process.exit(1)
}

// Parse the project ref from the Supabase URL: https://<ref>.supabase.co
const projectRef = new URL(supabaseUrl).hostname.split('.')[0]
const host = `db.${projectRef}.supabase.co`

const pool = new Pool({
  host,
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: dbPassword,
  ssl: { rejectUnauthorized: false },
})

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------
async function runMigrations() {
  const migrationsDir = join(rootDir, 'supabase', 'migrations')

  console.log('🔌  Connecting to database…')
  const client = await pool.connect()
  console.log(`✅  Connected to ${host}\n`)

  try {
    // List migration files sorted ascending
    const files = (await readdir(migrationsDir))
      .filter((f) => f.endsWith('.sql'))
      .sort()

    if (files.length === 0) {
      console.log('ℹ️   No migration files found in supabase/migrations/')
      return
    }

    console.log(`📂  Found ${files.length} migration file(s):\n`)
    for (const file of files) {
      console.log(`  ▶  ${file}`)
    }
    console.log()

    for (const file of files) {
      const filePath = join(migrationsDir, file)
      console.log(`⏳  Running: ${file}`)

      const sql = await readFile(filePath, 'utf-8')

      try {
        await client.query('BEGIN')
        await client.query(sql)
        await client.query('COMMIT')
        console.log(`✅  Done:    ${file}\n`)
      } catch (err) {
        await client.query('ROLLBACK')
        console.error(`❌  Failed:  ${file}`)
        console.error(`    ${err.message}\n`)
        throw err
      }
    }

    console.log('🎉  All migrations completed successfully!')
  } finally {
    client.release()
    await pool.end()
  }
}

runMigrations().catch((err) => {
  console.error('Migration runner failed:', err.message)
  process.exit(1)
})
