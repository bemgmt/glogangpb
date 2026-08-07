import 'server-only'

import { createHash, randomBytes } from 'node:crypto'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export const KIOSK_SESSION_COOKIE = 'djm_kiosk_session'

export function sha256(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex')
}

export function createOpaqueToken(bytes = 24): string {
  return randomBytes(bytes).toString('base64url')
}

export function getRequestIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  return forwarded?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown'
}

export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin')
  return !origin || origin === new URL(request.url).origin
}

export async function consumeRateLimit(options: {
  request: Request
  bucket: string
  identity?: string
  limit: number
  windowSeconds: number
}): Promise<boolean> {
  const identity = options.identity || getRequestIp(options.request)
  const service = createServiceClient()
  const { data, error } = await service.rpc('consume_rate_limit', {
    p_bucket: options.bucket,
    p_key_hash: sha256(`${process.env.RATE_LIMIT_SALT || process.env.SUPABASE_SERVICE_ROLE_KEY}:${options.bucket}:${identity}`),
    p_limit: options.limit,
    p_window_seconds: options.windowSeconds,
  })

  if (error) {
    console.error(`[rate-limit:${options.bucket}]`, error.message)
    return false
  }

  return data === true
}

export async function getAdminContext() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return null

  return { user, service: createServiceClient() }
}
