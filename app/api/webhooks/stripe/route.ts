import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// Clients
// ---------------------------------------------------------------------------
let stripeInstance: Stripe | null = null
let supabaseInstance: ReturnType<typeof createClient> | null = null

function getStripe(): Stripe {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY is missing')
    }
    stripeInstance = new Stripe(key, {
      apiVersion: '2025-04-30.basil',
    })
  }
  return stripeInstance
}

function getSupabase() {
  if (!supabaseInstance) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) {
      throw new Error('Supabase environment variables are missing')
    }
    supabaseInstance = createClient(url, key, {
      auth: { persistSession: false },
    })
  }
  return supabaseInstance
}

// ---------------------------------------------------------------------------
// Tier mapping: Stripe Price ID → membership tier name
// Populate with your real Stripe Price IDs.
// ---------------------------------------------------------------------------
const PRICE_TO_TIER: Record<string, string> = {
  // 'price_XXXXXXXXXXXX': 'glo-fan',
  // 'price_YYYYYYYYYYYY': 'vip',
}

// ---------------------------------------------------------------------------
// POST /api/webhooks/stripe
// ---------------------------------------------------------------------------
export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    console.warn('[stripe-webhook] Missing stripe-signature header')
    return NextResponse.json({ error: 'Missing signature.' }, { status: 400 })
  }

  // -------------------------------------------------------------------------
  // 1. Verify webhook signature
  // -------------------------------------------------------------------------
  let event: Stripe.Event

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[stripe-webhook] Signature verification failed:', message)
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 },
    )
  }

  // -------------------------------------------------------------------------
  // 2. Handle events
  // -------------------------------------------------------------------------
  try {
    switch (event.type) {
      // -----------------------------------------------------------------------
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        console.log('[stripe-webhook] checkout.session.completed', {
          sessionId: session.id,
          customerEmail: session.customer_email,
          customerId: session.customer,
        })

        await handleCheckoutCompleted(session)
        break
      }

      // -----------------------------------------------------------------------
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        console.log('[stripe-webhook] customer.subscription.updated', {
          subscriptionId: subscription.id,
          status: subscription.status,
        })

        await handleSubscriptionUpdated(subscription)
        break
      }

      // -----------------------------------------------------------------------
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        console.log('[stripe-webhook] customer.subscription.deleted', {
          subscriptionId: subscription.id,
        })

        await handleSubscriptionDeleted(subscription)
        break
      }

      // -----------------------------------------------------------------------
      default:
        console.log(`[stripe-webhook] Unhandled event type: ${event.type}`)
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[stripe-webhook] Handler error:', message)
    // Return 200 so Stripe doesn't retry unnecessarily, but log the error.
    // Change to 500 if you want Stripe to retry on handler failures.
  }

  return NextResponse.json({ received: true }, { status: 200 })
}

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const customerEmail =
    session.customer_email ||
    (typeof session.customer_details?.email === 'string'
      ? session.customer_details.email
      : null)

  if (!customerEmail) {
    console.warn('[stripe-webhook] No customer email in session', session.id)
    return
  }

  // Determine tier from the line items / price
  const lineItems = await getStripe().checkout.sessions.listLineItems(session.id, {
    limit: 5,
  })

  const priceId = lineItems.data[0]?.price?.id
  const tier = priceId ? (PRICE_TO_TIER[priceId] ?? 'glo-fan') : 'glo-fan'

  const { error } = await getSupabase()
    .from('profiles')
    .update({
      membership_tier: tier,
      membership_status: 'active',
      updated_at: new Date().toISOString(),
    })
    .eq('email', customerEmail)

  if (error) {
    console.error('[stripe-webhook] Failed to update profile:', error.message)
  } else {
    console.log(
      `[stripe-webhook] Updated ${customerEmail} → tier: ${tier}`,
    )
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string
  const status = subscription.status

  // Map Stripe subscription status to our membership_status
  const membershipStatus =
    status === 'active' || status === 'trialing' ? 'active' : 'inactive'

  const priceId = subscription.items.data[0]?.price?.id
  const tier = priceId ? (PRICE_TO_TIER[priceId] ?? 'glo-fan') : 'glo-fan'

  // Look up customer email
  const customer = await getStripe().customers.retrieve(customerId)
  if (customer.deleted || !('email' in customer) || !customer.email) return

  const { error } = await getSupabase()
    .from('profiles')
    .update({
      membership_tier: membershipStatus === 'active' ? tier : 'free',
      membership_status: membershipStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('email', customer.email)

  if (error) {
    console.error('[stripe-webhook] subscription.updated update failed:', error.message)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string

  const customer = await getStripe().customers.retrieve(customerId)
  if (customer.deleted || !('email' in customer) || !customer.email) return

  const { error } = await getSupabase()
    .from('profiles')
    .update({
      membership_tier: 'free',
      membership_status: 'inactive',
      updated_at: new Date().toISOString(),
    })
    .eq('email', customer.email)

  if (error) {
    console.error('[stripe-webhook] subscription.deleted update failed:', error.message)
  } else {
    console.log(`[stripe-webhook] Downgraded ${customer.email} to free (sub deleted)`)
  }
}
