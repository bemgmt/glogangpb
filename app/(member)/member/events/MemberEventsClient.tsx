'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Calendar, MapPin, Ticket, CheckCircle, PlusCircle, XCircle } from 'lucide-react'

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

interface MemberEventsClientProps {
  initialEvents: SanityEvent[]
  initialRsvps: string[]
  userId: string
}

export default function MemberEventsClient({
  initialEvents,
  initialRsvps,
  userId,
}: MemberEventsClientProps) {
  const [rsvps, setRsvps] = useState<string[]>(initialRsvps)
  const [loadingEventId, setLoadingEventId] = useState<string | null>(null)

  const supabase = createClient()

  const handleRsvp = async (eventId: string) => {
    setLoadingEventId(eventId)
    const hasRsvped = rsvps.includes(eventId)

    try {
      if (hasRsvped) {
        // Cancel RSVP
        const { error } = await supabase
          .from('event_rsvps')
          .delete()
          .eq('user_id', userId)
          .eq('sanity_event_id', eventId)

        if (error) {
          console.error('[rsvp-cancel] Error:', error.message)
          toast.error('Failed to cancel RSVP. Please try again.')
        } else {
          setRsvps((prev) => prev.filter((id) => id !== eventId))
          toast.success('Your RSVP has been cancelled.')
        }
      } else {
        // Add RSVP
        const { error } = await supabase.from('event_rsvps').insert({
          user_id: userId,
          sanity_event_id: eventId,
        })

        if (error) {
          console.error('[rsvp-add] Error:', error.message)
          toast.error('Failed to register RSVP. Please try again.')
        } else {
          setRsvps((prev) => [...prev, eventId])
          toast.success('You have successfully RSVP’d!')
        }
      }
    } catch (err) {
      console.error('[rsvp] Unexpected Error:', err)
      toast.error('An unexpected error occurred.')
    } finally {
      setLoadingEventId(null)
    }
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    const month = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
    const day = d.getDate()
    const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    return { month, day, time }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {initialEvents.map((evt) => {
        const { month, day, time } = formatDate(evt.eventDate)
        const hasRsvped = rsvps.includes(evt._id)
        const isActionLoading = loadingEventId === evt._id

        return (
          <div
            key={evt._id}
            className={`gg-card event-member-card ${evt.featured ? 'event-member-card--featured' : ''}`}
          >
            {/* Date Badge */}
            <div className="event-date-badge">
              <span className="event-date-month">{month}</span>
              <span className="event-date-day">{day}</span>
            </div>

            {/* Content info */}
            <div className="event-details">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                <span className="event-time-pill">{time}</span>
                {evt.featured && (
                  <span className="gg-pill gg-pill--gold" style={{ fontSize: '0.65rem' }}>
                    FEATURED
                  </span>
                )}
                {hasRsvped && (
                  <span className="rsvp-confirmed-pill">
                    <CheckCircle size={10} style={{ marginRight: '0.25rem' }} /> RSVP Confirmed
                  </span>
                )}
              </div>

              <h2 className="event-title">{evt.title}</h2>
              <p className="event-description">{evt.description}</p>

              <div className="event-location-strip">
                <div className="location-item">
                  <MapPin size={14} style={{ color: 'var(--accent)' }} />
                  <span>{evt.venue ? `${evt.venue}, ` : ''}{evt.city || 'TBA'}</span>
                </div>
              </div>
            </div>

            {/* Actions Panel */}
            <div className="event-actions">
              <button
                onClick={() => handleRsvp(evt._id)}
                disabled={isActionLoading}
                className={`gg-btn ${hasRsvped ? 'gg-btn--ghost' : 'gg-btn--primary'}`}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                {isActionLoading ? (
                  'Updating...'
                ) : hasRsvped ? (
                  <>
                    <XCircle size={16} /> Cancel RSVP
                  </>
                ) : (
                  <>
                    <PlusCircle size={16} /> RSVP Pass
                  </>
                )}
              </button>

              {evt.ticketUrl && (
                <a
                  href={evt.ticketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gg-btn gg-btn--ghost"
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.75rem' }}
                >
                  <Ticket size={16} /> Buy Tickets
                </a>
              )}
            </div>
          </div>
        )
      })}

      <style>{`
        .event-member-card {
          display: grid;
          grid-template-columns: 100px 1fr 200px;
          gap: 2rem;
          background: var(--panel);
          border: 1px solid var(--border);
          padding: 2rem;
          align-items: center;
        }
        @media (max-width: 768px) {
          .event-member-card {
            grid-template-columns: 1fr;
            gap: 1.5rem;
            padding: 1.5rem;
          }
          .event-date-badge {
            align-self: flex-start;
          }
        }
        .event-member-card--featured {
          border-color: var(--accent);
          box-shadow: 0 8px 32px rgba(255, 209, 0, 0.04);
        }
        .event-date-badge {
          width: 80px;
          height: 80px;
          border-radius: 12px;
          background: var(--bg);
          border: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .event-date-month {
          font-family: var(--font-sans);
          font-weight: 900;
          font-size: 0.85rem;
          color: var(--accent);
          letter-spacing: 0.05em;
        }
        .event-date-day {
          font-family: var(--font-sans);
          font-weight: 900;
          font-size: 1.75rem;
          color: var(--text);
          line-height: 1.1;
        }
        .event-time-pill {
          background: var(--bg);
          border: 1px solid var(--border);
          padding: 0.2rem 0.6rem;
          border-radius: 4px;
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 500;
        }
        .rsvp-confirmed-pill {
          background: rgba(46, 204, 113, 0.1);
          border: 1px solid #2ecc71;
          color: #2ecc71;
          padding: 0.2rem 0.6rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
        }
        .event-title {
          font-family: var(--font-sans);
          font-weight: 900;
          font-size: 1.5rem;
          text-transform: uppercase;
          letter-spacing: 0.02em;
          color: var(--text);
          margin: 0 0 0.5rem;
        }
        .event-description {
          font-size: 0.95rem;
          line-height: 1.5;
          color: var(--text-muted);
          margin: 0 0 1rem;
        }
        .event-location-strip {
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
        }
        .location-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  )
}
