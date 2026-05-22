import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // 1. Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Parse request body
    const body = await request.json()
    const { subject, message } = body

    if (!subject || !message) {
      return NextResponse.json(
        { error: 'Subject and message are required.' },
        { status: 400 }
      )
    }

    if (subject.length > 200 || message.length > 5000) {
      return NextResponse.json(
        { error: 'Input size exceeds limits.' },
        { status: 400 }
      )
    }

    // 3. Insert member request
    const { error: insertError } = await supabase.from('member_requests').insert({
      user_id: user.id,
      subject: subject.trim(),
      message: message.trim(),
      status: 'pending',
    })

    if (insertError) {
      console.error('[membership-apply] Insert error:', insertError.message)
      return NextResponse.json(
        { error: 'Failed to submit application.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[membership-apply] Unexpected error:', err)
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    )
  }
}
