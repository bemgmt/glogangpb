import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient as createSanityClient } from 'next-sanity'
import Link from 'next/link'
import { PlusCircle, ExternalLink, Calendar, MapPin } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Manage Events | Glo Gang Admin',
  description: 'View and manage Glo Gang events.',
}

const sanity = createSanityClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
})

interface SanityEvent {
  _id: string
  title: string
  eventDate: string
  venue?: string
  city?: string
  featured?: boolean
}

const PLACEHOLDER_EVENTS: SanityEvent[] = [
  {
    _id: 'ph1',
    title: 'Glo Gang Live – Chicago',
    eventDate: new Date(Date.now() + 14 * 86400000).toISOString(),
    venue: 'United Center',
    city: 'Chicago, IL',
    featured: true,
  },
  {
    _id: 'ph2',
    title: 'Glo Fest – Atlanta',
    eventDate: new Date(Date.now() + 30 * 86400000).toISOString(),
    venue: 'State Farm Arena',
    city: 'Atlanta, GA',
    featured: false,
  },
  {
    _id: 'ph3',
    title: 'Exclusive VIP Listening Party – Los Angeles',
    eventDate: new Date(Date.now() + 5 * 86400000).toISOString(),
    venue: 'Glo Gang HQ Studio',
    city: 'Los Angeles, CA',
    featured: false,
  },
]

async function getEvents() {
  try {
    const query = `*[_type == "event"] | order(eventDate asc) {
      _id, title, eventDate, venue, city, featured
    }`
    return await sanity.fetch(query)
  } catch {
    return []
  }
}

export default async function AdminEventsPage() {
  const supabase = await createClient()

  // 1. Guard access
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') redirect('/member/dashboard')

  // 2. Fetch data
  const sanityEvents = await getEvents()
  const events = sanityEvents.length > 0 ? sanityEvents : PLACEHOLDER_EVENTS

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  return (
    <main style={{ padding: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p className="gg-pill gg-pill--gold" style={{ marginBottom: '0.75rem' }}>
            CMS MANAGEMENT
          </p>
          <h1
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '2.25rem',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: 'var(--text)',
              margin: 0,
            }}
          >
            Manage Events
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Publish tours, listening parties, and private RSVP releases. Managed via Sanity Studio.
          </p>
        </div>

        <Link
          href="/studio"
          className="gg-btn gg-btn--primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <PlusCircle size={16} /> Open Studio
        </Link>
      </header>

      <hr className="gg-divider" style={{ marginBottom: '2.5rem' }} />

      <div className="gg-card table-card" style={{ padding: 0 }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Event Title</th>
              <th>Date & Time</th>
              <th>Venue / Location</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event: any) => (
              <tr key={event._id}>
                <td>
                  <span style={{ fontWeight: 700, fontSize: '1rem' }}>{event.title}</span>
                </td>
                <td>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
                    <Calendar size={12} className="meta-icon" /> {formatDate(event.eventDate)}
                  </span>
                </td>
                <td>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
                    <MapPin size={12} className="meta-icon" /> {event.venue ? `${event.venue}, ` : ''}{event.city || 'TBA'}
                  </span>
                </td>
                <td>
                  {event.featured ? (
                    <span className="featured-label">Featured</span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>Standard</span>
                  )}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <Link
                    href={`/studio/structure/intent/edit;id=${event._id};type=event`}
                    className="gg-btn gg-btn--ghost gg-btn--sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    Edit In Studio <ExternalLink size={12} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        .admin-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .admin-table th {
          font-family: var(--font-sans);
          font-weight: 900;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-muted);
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--border);
        }
        .admin-table td {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--border);
          vertical-align: middle;
          color: var(--text);
        }
        .admin-table tr:last-child td {
          border-bottom: none;
        }
        .meta-icon {
          color: var(--accent);
        }
        .featured-label {
          display: inline-block;
          font-size: 0.7rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--accent);
          background: rgba(255, 209, 0, 0.1);
          border: 1px solid var(--accent);
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
        }
      `}</style>
    </main>
  )
}
