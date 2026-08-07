import { NextResponse } from 'next/server'
import { z } from 'zod'
import {
  createOpaqueToken,
  getAdminContext,
  isSameOrigin,
  sha256,
} from '@/lib/security/server'

const issuePassSchema = z.object({
  label: z.string().trim().max(120).optional(),
  ttlMinutes: z.number().int().min(1).max(60).default(10),
}).strict()

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const context = await getAdminContext()
  if (!context) {
    return NextResponse.json({ error: 'Admin access required.' }, { status: 403 })
  }

  const parsed = issuePassSchema.safeParse(await request.json().catch(() => ({})))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid pass request.' }, { status: 400 })
  }

  const token = `DJM-${createOpaqueToken(24)}`
  const expiresAt = new Date(Date.now() + parsed.data.ttlMinutes * 60_000)
  const { error } = await context.service.from('kiosk_access_passes').insert({
    token_hash: sha256(token),
    label: parsed.data.label || null,
    created_by: context.user.id,
    expires_at: expiresAt.toISOString(),
  })

  if (error) {
    console.error('[kiosk-pass-issue]', error.message)
    return NextResponse.json({ error: 'Unable to issue pass.' }, { status: 500 })
  }

  return NextResponse.json({ token, expiresAt: expiresAt.toISOString() }, { status: 201 })
}
