import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getAdminContext, isSameOrigin } from '@/lib/security/server'

const updateMemberSchema = z.object({
  role: z.enum(['user', 'admin']).optional(),
  membership_tier: z.enum(['free', 'glo-fan', 'glogangvip']).optional(),
}).strict().refine(
  (value) => value.role !== undefined || value.membership_tier !== undefined,
  { message: 'At least one supported field is required.' },
)

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const context = await getAdminContext()
  if (!context) {
    return NextResponse.json({ error: 'Admin access required.' }, { status: 403 })
  }

  const { id } = await params
  const parsed = updateMemberSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid member update.', details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  if (parsed.data.role === 'user') {
    const { data: target } = await context.service
      .from('profiles')
      .select('role')
      .eq('id', id)
      .single()

    if (target?.role === 'admin') {
      const { count } = await context.service
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'admin')

      if ((count ?? 0) <= 1) {
        return NextResponse.json(
          { error: 'The final administrator cannot be demoted.' },
          { status: 409 },
        )
      }
    }
  }

  const { data, error } = await context.service
    .from('profiles')
    .update(parsed.data)
    .eq('id', id)
    .select('id, email, display_name, membership_tier, membership_status, role, created_at')
    .single()

  if (error) {
    console.error('[admin-member-update]', error.message)
    return NextResponse.json({ error: 'Unable to update member.' }, { status: 500 })
  }

  return NextResponse.json({ member: data })
}
