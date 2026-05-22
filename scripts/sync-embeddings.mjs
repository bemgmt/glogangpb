#!/usr/bin/env node
/**
 * scripts/sync-embeddings.mjs
 *
 * Fetches all artists from Sanity, generates text embeddings using OpenAI,
 * and upserts them into Supabase public.content_embeddings (pgvector).
 *
 * Usage:
 *   node scripts/sync-embeddings.mjs
 */

import { createClient } from '@sanity/client'
import OpenAI from 'openai'
import pg from 'pg'
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

const { Pool } = pg

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const dbPassword = process.env.SUPABASE_DB_PASSWORD
const sanityProjectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const sanityDataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const openaiApiKey = process.env.OPENAI_API_KEY

if (!supabaseUrl || !dbPassword || !sanityProjectId || !openaiApiKey) {
  console.error(
    '❌  Missing environment variables.\n' +
    '    Ensure NEXT_PUBLIC_SUPABASE_URL, SUPABASE_DB_PASSWORD,\n' +
    '    NEXT_PUBLIC_SANITY_PROJECT_ID, and OPENAI_API_KEY are set in .env.local',
  )
  process.exit(1)
}

// ---------------------------------------------------------------------------
// Clients
// ---------------------------------------------------------------------------
const sanity = createClient({
  projectId: sanityProjectId,
  dataset: sanityDataset,
  apiVersion: '2024-01-01',
  useCdn: false, // get freshest data
})

const openai = new OpenAI({
  apiKey: openaiApiKey,
})

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
async function syncEmbeddings() {
  console.log('🔌  Connecting to Supabase Postgres database…')
  const dbClient = await pool.connect()
  console.log('✅  Database connected.\n')

  try {
    console.log('📡  Fetching artists from Sanity...')
    const artists = await sanity.fetch(`*[_type == "artist"] {
      _id,
      name,
      genre,
      bio,
      releases
    }`)

    console.log(`✅  Found ${artists.length} artist(s) in Sanity.\n`)

    if (artists.length === 0) {
      console.log('ℹ️   No artists found to sync.')
      return
    }

    for (const artist of artists) {
      console.log(`⏳  Syncing artist: ${artist.name} (${artist._id})`)

      // Construct descriptive text blob for embedding
      const parts = [
        `Artist Name: ${artist.name}`,
        artist.genre ? `Genre: ${artist.genre}` : '',
        artist.bio ? `Biography: ${artist.bio}` : '',
        artist.releases && artist.releases.length > 0
          ? `Key Releases: ${artist.releases.join(', ')}`
          : '',
      ].filter(Boolean)

      const textBlob = parts.join('\n')

      console.log('  🧠  Generating OpenAI embedding...')
      const embedResponse = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: textBlob,
      })

      const embedding = embedResponse.data[0]?.embedding

      if (!embedding) {
        console.error(`  ❌  Failed to generate embedding for ${artist.name}`)
        continue
      }

      // Convert embedding array to PostgreSQL vector literal string format: '[0.1, 0.2, ...]'
      const vectorLiteral = `[${embedding.join(',')}]`

      console.log('  ✍️   Upserting embedding to database...')
      const sql = `
        INSERT INTO public.content_embeddings (content_type, sanity_id, content_text, embedding)
        VALUES ($1, $2, $3, $4::vector)
        ON CONFLICT (content_type, sanity_id)
        DO UPDATE SET
          content_text = EXCLUDED.content_text,
          embedding = EXCLUDED.embedding,
          created_at = now()
      `
      await dbClient.query(sql, ['artist', artist._id, textBlob, vectorLiteral])
      console.log(`  ✅  Successfully synced ${artist.name}!\n`)
    }

    console.log('🎉  Embeddings synchronization completed successfully!')
  } catch (err) {
    console.error('❌  Error during sync:', err)
    throw err
  } finally {
    dbClient.release()
    await pool.end()
  }
}

syncEmbeddings().catch((err) => {
  console.error('Embedding synchronization failed:', err.message)
  process.exit(1)
})
