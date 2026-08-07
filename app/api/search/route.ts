import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { z } from 'zod'
import { consumeRateLimit, isSameOrigin } from '@/lib/security/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

let openaiInstance: OpenAI | null = null

function getOpenAI(): OpenAI {
  if (!openaiInstance) {
    const key = process.env.OPENAI_API_KEY
    if (!key) throw new Error('OPENAI_API_KEY is missing')
    openaiInstance = new OpenAI({ apiKey: key })
  }
  return openaiInstance
}

const searchSchema = z.object({
  query: z.string().trim().min(2).max(500),
}).strict()

interface SearchResult {
  id: string
  content_type: string
  sanity_id: string
  content_text: string
  similarity: number
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  }

  const parsed = searchSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Query must be between 2 and 500 characters.' }, { status: 400 })
  }

  const allowed = await consumeRateLimit({
    request,
    bucket: 'semantic-search',
    identity: user.id,
    limit: 30,
    windowSeconds: 600,
  })
  if (!allowed) {
    return NextResponse.json({ error: 'Search limit reached. Please try again later.' }, { status: 429 })
  }

  try {
    const embeddingResponse = await getOpenAI().embeddings.create({
      model: 'text-embedding-3-small',
      input: parsed.data.query,
    })
    const embedding = embeddingResponse.data[0]?.embedding
    if (!embedding) {
      return NextResponse.json({ error: 'Search is temporarily unavailable.' }, { status: 503 })
    }

    const { data, error } = await createServiceClient().rpc('match_content_embeddings', {
      query_embedding: embedding,
      match_threshold: 0.3,
      match_count: 10,
    })

    if (error) {
      console.error('[search] pgvector RPC error:', error.message)
      return NextResponse.json({ error: 'Search is temporarily unavailable.' }, { status: 503 })
    }

    const results = (data ?? []) as SearchResult[]
    return NextResponse.json({
      query: parsed.data.query,
      results: results.map((result) => ({
        id: result.id,
        type: result.content_type,
        sanityId: result.sanity_id,
        text: result.content_text,
        score: Math.round(result.similarity * 1000) / 1000,
      })),
      total: results.length,
    })
  } catch (error) {
    console.error('[search] unexpected error:', error instanceof Error ? error.message : 'unknown')
    return NextResponse.json({ error: 'Search is temporarily unavailable.' }, { status: 503 })
  }
}
