import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// Clients
// ---------------------------------------------------------------------------
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Use service role to bypass RLS for logging + reading embeddings
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
)

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface SearchResult {
  id: string
  content_type: string
  sanity_id: string
  content_text: string
  similarity: number
}

// ---------------------------------------------------------------------------
// POST /api/search
// Body: { query: string }
// ---------------------------------------------------------------------------
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const query: string = body?.query?.trim()

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters.' },
        { status: 400 },
      )
    }

    if (query.length > 500) {
      return NextResponse.json(
        { error: 'Query must be 500 characters or fewer.' },
        { status: 400 },
      )
    }

    // -----------------------------------------------------------------------
    // 1. Embed the query with OpenAI
    // -----------------------------------------------------------------------
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
    })

    const embedding = embeddingResponse.data[0]?.embedding

    if (!embedding) {
      return NextResponse.json(
        { error: 'Failed to generate embedding.' },
        { status: 500 },
      )
    }

    // -----------------------------------------------------------------------
    // 2. Query Supabase with pgvector cosine similarity
    // -----------------------------------------------------------------------
    const { data: results, error: searchError } = await supabase.rpc(
      'match_content_embeddings',
      {
        query_embedding: embedding,
        match_threshold: 0.3,
        match_count: 10,
      },
    )

    if (searchError) {
      console.error('[search] pgvector RPC error:', searchError.message)
      // Fall back to empty results rather than hard-failing
    }

    const searchResults: SearchResult[] = results ?? []

    // -----------------------------------------------------------------------
    // 3. Log the search query
    // -----------------------------------------------------------------------
    await supabase.from('search_logs').insert({
      query,
      results_count: searchResults.length,
    })

    // -----------------------------------------------------------------------
    // 4. Return results
    // -----------------------------------------------------------------------
    return NextResponse.json({
      query,
      results: searchResults.map((r) => ({
        id: r.id,
        type: r.content_type,
        sanityId: r.sanity_id,
        text: r.content_text,
        score: Math.round(r.similarity * 1000) / 1000,
      })),
      total: searchResults.length,
    })
  } catch (err) {
    console.error('[search] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 },
    )
  }
}

// ---------------------------------------------------------------------------
// Supabase RPC helper (add this function to your DB):
//
// CREATE OR REPLACE FUNCTION match_content_embeddings(
//   query_embedding vector(1536),
//   match_threshold float,
//   match_count int
// )
// RETURNS TABLE (
//   id uuid,
//   content_type text,
//   sanity_id text,
//   content_text text,
//   similarity float
// )
// LANGUAGE sql STABLE AS $$
//   SELECT
//     id, content_type, sanity_id, content_text,
//     1 - (embedding <=> query_embedding) AS similarity
//   FROM content_embeddings
//   WHERE 1 - (embedding <=> query_embedding) > match_threshold
//   ORDER BY similarity DESC
//   LIMIT match_count;
// $$;
// ---------------------------------------------------------------------------
