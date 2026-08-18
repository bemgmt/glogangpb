import type { Metadata } from 'next'
import { createClient } from 'next-sanity'

// ---------------------------------------------------------------------------
// SEO
// ---------------------------------------------------------------------------
export const metadata: Metadata = {
  title: 'Events | DJ Maino da Plug',
  description:
    'Browse upcoming DJ Maino shows, club sets, and live stream sessions. Get tickets and RSVP.',
  openGraph: {
    title: 'Events | DJ Maino da Plug',
    description: 'Browse upcoming DJ Maino shows, club sets, and live stream sessions.',
  },
}

// ---------------------------------------------------------------------------
// Types
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

// ---------------------------------------------------------------------------
// Sanity client
// ---------------------------------------------------------------------------
const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
})

// ---------------------------------------------------------------------------
// Placeholder data
// ---------------------------------------------------------------------------
const PLACEHOLDER_EVENTS: SanityEvent[] = [
  {
    _id: 'ph1',
    title: 'DJ Maino Live Set – LA',
    eventDate: new Date(Date.now() + 14 * 86400000).toISOString(),
    venue: 'Exchange LA',
    city: 'Los Angeles, CA',
    featured: true,
    description: 'DJ Maino spinning the absolute finest electronic and hip-hop sets live.',
  },
  {
    _id: 'ph2',
    title: 'Mixtape Launch – Atlanta',
    eventDate: new Date(Date.now() + 30 * 86400000).toISOString(),
    venue: 'Believe Music Hall',
    city: 'Atlanta, GA',
    description: 'Mixtape drop party with DJ Maino on the decks.',
  },
  {
    _id: 'ph3',
    title: 'Twitch Stream Session',
    eventDate: new Date(Date.now() + 45 * 86400000).toISOString(),
    venue: 'Twitch Online',
    city: 'Live Stream',
    description: 'Live on Twitch with exclusive interactive audio and fan guest list.',
  },
]

// ---------------------------------------------------------------------------
// Data fetching
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

// ---------------------------------------------------------------------------
// Date Badge Component
// ---------------------------------------------------------------------------
function DateBadge({ iso }: { iso: string }) {
  const d = new Date(iso)
  const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase()
  const day = d.getDate()
  const year = d.getFullYear()

  return (
    <div className="event-date-badge">
      <span className="event-date-badge__month">{month}</span>
      <span className="event-date-badge__day">{day}</span>
      <span className="event-date-badge__year">{year}</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Event Row
// ---------------------------------------------------------------------------
function EventRow({ evt }: { evt: SanityEvent }) {
  const isPast = new Date(evt.eventDate) < new Date()

  return (
    <article className={`gg-card event-row ${isPast ? 'event-row--past' : ''}`}>
      <DateBadge iso={evt.eventDate} />

      <div className="event-row__info">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <h3 className="event-row__title">{evt.title}</h3>
          {evt.featured && <span className="gg-pill gg-pill--gold">FEATURED</span>}
          {isPast && <span className="gg-pill">PAST</span>}
        </div>

        {(evt.venue || evt.city) && (
          <p className="event-row__location">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: 'middle', marginRight: '0.25rem' }}>
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {[evt.venue, evt.city].filter(Boolean).join(' · ')}
          </p>
        )}

        {evt.description && (
          <p className="event-row__desc">{evt.description}</p>
        )}
      </div>

      <div className="event-row__actions">
        {evt.ticketUrl && !isPast ? (
          <a
            href={evt.ticketUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="gg-btn gg-btn--primary gg-btn--sm"
          >
            Get Tickets
          </a>
        ) : isPast ? (
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Event ended</span>
        ) : (
          <a href="/member/dashboard" className="gg-btn gg-btn--ghost gg-btn--sm">
            RSVP
          </a>
        )}
      </div>
    </article>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default async function EventsPage() {
  const events = await getEvents()
  const data = events.length > 0 ? events : PLACEHOLDER_EVENTS

  const upcoming = data.filter((e) => new Date(e.eventDate) >= new Date())
  const past = data.filter((e) => new Date(e.eventDate) < new Date())

  return (
    <div className="gg-container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      {/* Header */}
      <header style={{ marginBottom: '2.5rem' }}>
        <p className="gg-pill gg-pill--gold" style={{ marginBottom: '0.75rem' }}>
          LIVE EVENTS
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
          Shows &amp; Events
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.75rem', maxWidth: 560 }}>
          Catch DJ Maino on tour, at live events, or hosting the next Glo Streams session.
        </p>
      </header>

      <hr className="gg-divider" style={{ marginBottom: '2rem' }} />

      {/* Upcoming */}
      {upcoming.length > 0 ? (
        <section style={{ marginBottom: '3rem' }}>
          <h2 className="events-section-heading">Upcoming</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {upcoming.map((evt) => (
              <EventRow key={evt._id} evt={evt} />
            ))}
          </div>
        </section>
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <p>No upcoming events. Check back soon.</p>
        </div>
      )}

      {/* Past events */}
      {past.length > 0 && (
        <section>
          <h2 className="events-section-heading" style={{ color: 'var(--text-muted)' }}>
            Past Events
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {past.map((evt) => (
              <EventRow key={evt._id} evt={evt} />
            ))}
          </div>
        </section>
      )}

      <style>{`
        .events-section-heading {
          font-family: var(--font-sans);
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: var(--text-muted);
          margin: 0 0 1rem 0;
        }
        .event-row {
          display: flex;
          align-items: flex-start;
          gap: 1.5rem;
          padding: 1.5rem;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .event-row:hover {
          transform: translateX(4px);
          box-shadow: 0 4px 24px rgba(255,193,7,0.08);
        }
        .event-row--past {
          opacity: 0.6;
        }
        .event-row--past:hover {
          transform: none;
          box-shadow: none;
        }
        .event-date-badge {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 56px;
          background: rgba(255,193,7,0.08);
          border: 1px solid rgba(255,193,7,0.2);
          border-radius: 8px;
          padding: 0.5rem 0.75rem;
          flex-shrink: 0;
        }
        .event-date-badge__month {
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: var(--accent);
        }
        .event-date-badge__day {
          font-size: 1.75rem;
          font-weight: 900;
          line-height: 1;
          color: var(--text);
          font-family: var(--font-sans);
        }
        .event-date-badge__year {
          font-size: 0.65rem;
          color: var(--text-muted);
        }
        .event-row__info {
          flex: 1;
        }
        .event-row__title {
          font-family: var(--font-sans);
          font-size: 1.125rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          color: var(--text);
          margin: 0;
        }
        .event-row__location {
          font-size: 0.875rem;
          color: var(--text-muted);
          margin: 0.35rem 0 0;
        }
        .event-row__desc {
          font-size: 0.875rem;
          color: var(--text-muted);
          margin: 0.5rem 0 0;
          line-height: 1.5;
        }
        .event-row__actions {
          flex-shrink: 0;
          align-self: center;
        }
        @media (max-width: 640px) {
          .event-row {
            flex-wrap: wrap;
          }
          .event-row__actions {
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
