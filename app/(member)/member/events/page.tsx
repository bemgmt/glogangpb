import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient as createSanityClient } from 'next-sanity'
import MemberEventsClient from './MemberEventsClient'

export const metadata: Metadata = {
  title: 'Member Events & RSVPs | Glo Gang',
  description: 'Manage your event RSVPs, listening parties, and exclusive drop invitations.',
}

// ---------------------------------------------------------------------------
// Sanity Client
// ---------------------------------------------------------------------------
const sanity = createSanityClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
})

// ---------------------------------------------------------------------------
// Types & Mock Data
// ---------------------------------------------------------------------------
interface SanityEvent {
  _id: string
  title: string
  eventDate: string
  venue?: string
  city?: string
  ticketUrl?: string
  description?: string
  featured?: boolean
  image?: { asset?: { url: string } }
}

const PLACEHOLDER_EVENTS: SanityEvent[] = [
  {
    _id: 'ph1',
    title: 'Glo Gang Live – Chicago',
    eventDate: new Date(Date.now() + 14 * 86400000).toISOString(),
    venue: 'United Center',
    city: 'Chicago, IL',
    featured: true,
    description: 'Chief Keef and the full GGW roster hit Chicago for a historic night.',
  },
  {
    _id: 'ph2',
    title: 'Glo Fest – Atlanta',
    eventDate: new Date(Date.now() + 30 * 86400000).toISOString(),
    venue: 'State Farm Arena',
    city: 'Atlanta, GA',
    description: 'Annual Glo Gang music festival and streetwear exhibition.',
  },
  {
    _id: 'ph3',
    title: 'Exclusive VIP Listening Party – Los Angeles',
    eventDate: new Date(Date.now() + 5 * 86400000).toISOString(),
    venue: 'Glo Gang HQ Studio',
    city: 'Los Angeles, CA',
    description: 'Private studio listening party for upcoming secret album release. VIP members only.',
  },
]

// ---------------------------------------------------------------------------
// Fetch Data
// ---------------------------------------------------------------------------
async function getEvents(): Promise<SanityEvent[]> {
  try {
    const query = `*[_type == "event"] | order(eventDate asc) {
      _id, title, eventDate, venue, city, ticketUrl, description, featured,
      image { asset->{ url } }
    }`
    return await sanity.fetch(query)
  } catch {
    return []
  }
}

export default async function MemberEventsPage() {
  const supabase = await createClient()

  // 1. Get user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // 2. Fetch RSVPs
  const { data: rsvps } = await supabase
    .from('event_rsvps')
    .select('sanity_event_id')
    .eq('user_id', user.id)

  const rsvpIds = new Set((rsvps || []).map((r) => r.sanity_event_id))

  // 3. Fetch Events
  const sanityEvents = await getEvents()
  const events = sanityEvents.length > 0 ? sanityEvents : PLACEHOLDER_EVENTS

  return (
    <main className="gg-container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>
      {/* Header */}
      <header style={{ marginBottom: '3rem' }}>
        <p className="gg-pill gg-pill--gold" style={{ marginBottom: '0.75rem' }}>
          MEMBER PASS
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: 'var(--text)',
            margin: 0,
          }}
        >
          Exclusive Events
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.75rem', maxWidth: 560 }}>
          RSVP for members-only listening sessions, secret pop-ups, and get early tickets to major tour dates.
        </p>
      </header>

      <hr className="gg-divider" style={{ marginBottom: '3rem' }} />

      <MemberEventsClient initialEvents={events} initialRsvps={Array.from(rsvpIds)} userId={user.id} />
    </main>
  )
}
