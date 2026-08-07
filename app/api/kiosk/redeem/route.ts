import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'
import {
  consumeRateLimit,
  createOpaqueToken,
  isSameOrigin,
  KIOSK_SESSION_COOKIE,
  sha256,
} from '@/lib/security/server'

const redeemSchema = z.object({
  token: z.string().trim().min(20).max(256),
}).strict()

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const parsed = redeemSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid pass.' }, { status: 400 })
  }

  const allowed = await consumeRateLimit({
    request,
    bucket: 'kiosk-redeem',
    limit: 10,
    windowSeconds: 300,
  })
  if (!allowed) {
    return NextResponse.json({ error: 'Too many attempts. Please wait and retry.' }, { status: 429 })
  }

  const sessionToken = createOpaqueToken(32)
  const sessionExpires = new Date(Date.now() + 15 * 60_000)
  const { data, error } = await createServiceClient().rpc('redeem_kiosk_pass', {
    p_pass_hash: sha256(parsed.data.token),
    p_session_hash: sha256(sessionToken),
    p_session_expires_at: sessionExpires.toISOString(),
  })

  if (error) {
    console.error('[kiosk-pass-redeem]', error.message)
    return NextResponse.json({ error: 'Unable to verify pass.' }, { status: 500 })
  }
  if (data !== true) {
    return NextResponse.json({ error: 'Pass is invalid, expired, or already used.' }, { status: 403 })
  }

  const response = NextResponse.json({ redeemed: true })
  response.cookies.set(KIOSK_SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/kiosk',
    maxAge: 15 * 60,
  })
  return response
}
