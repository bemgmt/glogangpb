'use client'

import { useState, type FormEvent } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Compass, ShieldCheck, Mail, MapPin, Globe } from 'lucide-react'

export default function AboutPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  const handleContactSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const trimmedName = name.trim()
    const trimmedEmail = email.trim().toLowerCase()
    const trimmedMessage = message.trim()

    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      toast.error('All fields are required.')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.from('contact_submissions').insert({
        name: trimmedName,
        email: trimmedEmail,
        message: trimmedMessage,
      })

      if (error) {
        console.error('[contact-submit] DB Error:', error.message)
        toast.error('Failed to submit message. Please try again.')
      } else {
        toast.success('Your message has been submitted. We will be in touch!')
        setName('')
        setEmail('')
        setMessage('')
      }
    } catch (err) {
      console.error('[contact-submit] Unexpected Error:', err)
      toast.error('An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="gg-container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>
      {/* Header */}
      <header style={{ marginBottom: '3rem' }}>
        <p className="gg-pill gg-pill--gold" style={{ marginBottom: '0.75rem' }}>
          ABOUT THE PLUG
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'clamp(2.5rem, 6vw, 4rem)',
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: 'var(--text)',
            margin: 0,
          }}
        >
          DJ MAINO DA PLUG
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.75rem', maxWidth: 560 }}>
          Mixtape curation, live Twitch broadcasting, and artist management. Connecting fans with the rawest sounds and exclusive sets.
        </p>
      </header>

      <hr className="gg-divider" style={{ marginBottom: '3.5rem' }} />

      <div className="about-grid">
        {/* Story Section */}
        <section className="about-story">
          <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 900, textTransform: 'uppercase', fontSize: '1.75rem', color: 'var(--accent)', letterSpacing: '0.02em', marginBottom: '1.25rem' }}>
            Our Movement
          </h2>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Renowned as a premier curator and host of the highly acclaimed <strong>48 Laws</strong> mixtape series, <strong>DJ Maino da Plug</strong> has carved out a unique space in modern music culture. Spinning the freshest tracks, managing rising talent, and building a massive digital fan base, DJ Maino is the ultimate conduit for music discovery.
          </p>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--text-muted)' }}>
            Today, DJ Maino da Plug's platform is a digital hub for fans worldwide. By bridging the gap between underground artists and mainstream visibility, we host interactive live sets on Twitch, distribute exclusive mixtape drops, and run premium VIP experiences that connect the community directly to the movement.
          </p>

          {/* Pillars */}
          <div className="pillars-grid" style={{ marginTop: '3rem' }}>
            <div className="gg-card pillar-card">
              <div className="pillar-icon"><Compass size={20} /></div>
              <h3 className="pillar-title">Curation</h3>
              <p className="pillar-desc">Only the rawest tracks and mixtapes. We filter through the noise to bring you the certified hits.</p>
            </div>
            <div className="gg-card pillar-card">
              <div className="pillar-icon"><ShieldCheck size={20} /></div>
              <h3 className="pillar-title">High Energy</h3>
              <p className="pillar-desc">High-voltage Twitch streams and club sets. We bring the electric vibe directly to you.</p>
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="about-contact">
          <div className="gg-card contact-form-card">
            <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 900, textTransform: 'uppercase', fontSize: '1.5rem', color: 'var(--text)', letterSpacing: '0.02em', margin: '0 0 0.5rem' }}>
              Get In Touch
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
              Booking inquiries, mixtape submissions, or support. Send a message directly.
            </p>

            <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label htmlFor="contact-name" className="gg-label">Your Name</label>
                <input
                  id="contact-name"
                  type="text"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="gg-field"
                  required
                />
              </div>

              <div>
                <label htmlFor="contact-email" className="gg-label">Email Address</label>
                <input
                  id="contact-email"
                  type="email"
                  placeholder="e.g. name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="gg-field"
                  required
                />
              </div>

              <div>
                <label htmlFor="contact-message" className="gg-label">Message</label>
                <textarea
                  id="contact-message"
                  placeholder="Type your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="gg-field"
                  style={{ minHeight: 120, resize: 'vertical' }}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="gg-btn gg-btn--primary"
                style={{ width: '100%', marginTop: '0.5rem' }}
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>

            {/* Quick Info */}
            <div className="quick-info-strip" style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
              <div className="info-item">
                <MapPin size={16} className="info-icon" />
                <span>Los Angeles, CA / Twitch Live</span>
              </div>
              <div className="info-item">
                <Mail size={16} className="info-icon" />
                <span>booking@djmainodaplug.com</span>
              </div>
              <div className="info-item">
                <Globe size={16} className="info-icon" />
                <span>djmainodaplug.com</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <style>{`
        .about-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 4rem;
          align-items: start;
        }
        @media (max-width: 900px) {
          .about-grid {
            grid-template-columns: 1fr;
            gap: 3rem;
          }
        }
        .pillars-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }
        @media (max-width: 600px) {
          .pillars-grid {
            grid-template-columns: 1fr;
          }
        }
        .pillar-card {
          padding: 1.5rem;
          background: var(--panel);
          border: 1px solid var(--border);
        }
        .pillar-icon {
          width: 38px;
          height: 38px;
          background: rgba(255, 209, 0, 0.1);
          color: var(--accent);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
        }
        .pillar-title {
          font-family: var(--font-sans);
          font-weight: 700;
          font-size: 1.1rem;
          text-transform: uppercase;
          letter-spacing: 0.02em;
          color: var(--text);
          margin: 0 0 0.5rem;
        }
        .pillar-desc {
          font-size: 0.875rem;
          line-height: 1.5;
          color: var(--text-muted);
          margin: 0;
        }
        .contact-form-card {
          padding: 2.5rem;
          background: var(--panel);
          border: 1px solid var(--border);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);
        }
        .quick-info-strip {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .info-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.875rem;
          color: var(--text-muted);
        }
        .info-icon {
          color: var(--accent);
        }
      `}</style>
    </main>
  )
}
