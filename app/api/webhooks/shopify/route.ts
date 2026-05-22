import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Supabase environment variables are missing')
  }
  return createClient(url, key, {
    auth: { persistSession: false },
  })
}

export async function POST(request: Request) {
  const bodyText = await request.text()
  const hmacHeader = request.headers.get('x-shopify-hmac-sha256')

  // Verify HMAC if secret is configured
  if (process.env.SHOPIFY_WEBHOOK_SECRET && hmacHeader) {
    const hash = crypto
      .createHmac('sha256', process.env.SHOPIFY_WEBHOOK_SECRET)
      .update(bodyText, 'utf8')
      .digest('base64')

    if (hash !== hmacHeader) {
      console.warn('[shopify-webhook] HMAC verification failed')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  let payload
  try {
    payload = JSON.parse(bodyText)
  } catch (err) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const customerEmail = payload.email || payload.customer?.email
  if (!customerEmail) {
    console.warn('[shopify-webhook] No customer email in order')
    return NextResponse.json({ received: true }, { status: 200 })
  }

  const supabase = getSupabase()

  // 1. Find the user by email
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, lifetime_spend, drop_streak_count, current_tier')
    .eq('email', customerEmail)
    .single()

  if (!profile) {
    console.log(`[shopify-webhook] Profile not found for email: ${customerEmail}`)
    // Return 200 to acknowledge receipt even if user isn't in our system yet
    return NextResponse.json({ received: true }, { status: 200 })
  }

  // 2. Update lifetime_spend and drop streak
  const orderTotal = parseFloat(payload.total_price || '0')
  const newSpend = parseFloat(profile.lifetime_spend?.toString() || '0') + orderTotal
  const newStreak = parseInt(profile.drop_streak_count?.toString() || '0', 10) + 1

  // Determine new tier based on spend
  let newTier = profile.current_tier || 'the_block'
  if (newSpend >= 750) {
    newTier = 'glory_circle'
  } else if (newSpend >= 250 && newTier !== 'glory_circle') {
    newTier = 'frontline'
  }

  await supabase
    .from('profiles')
    .update({
      lifetime_spend: newSpend,
      drop_streak_count: newStreak,
      current_tier: newTier,
      updated_at: new Date().toISOString()
    })
    .eq('id', profile.id)

  // 3. Insert items into digital_closet
  const lineItems = payload.line_items || []
  for (const item of lineItems) {
    const sku = item.sku || item.product_id?.toString() || 'unknown'
    const name = item.name || item.title || 'Unknown Item'
    
    // Check if the item already exists in their closet to prevent duplicates if webhook retries
    const { data: existing } = await supabase
      .from('digital_closet')
      .select('id')
      .eq('profile_id', profile.id)
      .eq('sku_id', sku)
      .single()

    if (!existing) {
      await supabase.from('digital_closet').insert({
        profile_id: profile.id,
        sku_id: sku,
        product_name: name,
        image_url: null, // Can be updated later via sync script or expanded webhook
      })
    }
  }

  console.log(`[shopify-webhook] Processed order for ${customerEmail}. New spend: $${newSpend}`)
  return NextResponse.json({ received: true }, { status: 200 })
}
