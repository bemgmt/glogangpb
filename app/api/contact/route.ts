import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'
import { consumeRateLimit, isSameOrigin } from '@/lib/security/server'

const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  message: z.string().trim().min(10).max(3000),
  website: z.string().max(0).optional(),
}).strict()

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const parsed = contactSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Please check the submitted fields.' }, { status: 400 })
  }

  const allowed = await consumeRateLimit({
    request,
    bucket: 'contact',
    limit: 5,
    windowSeconds: 600,
  })
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }

  const submission = {
    name: parsed.data.name,
    email: parsed.data.email,
    message: parsed.data.message,
  }
  const { error } = await createServiceClient()
    .from('contact_submissions')
    .insert(submission)

  if (error) {
    console.error('[contact-submit]', error.message)
    return NextResponse.json({ error: 'Unable to submit the message.' }, { status: 500 })
  }

  return NextResponse.json({ received: true }, { status: 201 })
}
