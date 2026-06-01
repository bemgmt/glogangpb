import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Camera, Star, Zap } from 'lucide-react'
import { getUpcomingEvents, getFeaturedArtists } from '@/lib/sanity'

export const metadata = {
  title: 'DJ Maino da Plug — Official Fan Portal',
  description: 'The official community & member portal for DJ Maino da Plug. Explore music releases, live sets, events, and the interactive photobooth.',
}

// Revalidate every 60 seconds for ISR
export const revalidate = 60

async function getData() {
  try {
    const [events, artists] = await Promise.all([
      getUpcomingEvents(4),
      getFeaturedArtists(6),
    ])
    return { events, artists }
  } catch {
    return { events: [], artists: [] }
  }
}

export default async function HomePage() {
  const { events, artists } = await getData()

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section
        style={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          background: 'var(--bg)',
        }}
      >
        {/* Background Image */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url(/img/maino_hero_bg.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
          aria-hidden
        />

        {/* Dark overlay for readability */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(10,10,10,0.3) 0%, rgba(10,10,10,0.85) 100%)',
            pointerEvents: 'none',
          }}
          aria-hidden
        />

        {/* Volt Green glow radial */}
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '900px',
            height: '600px',
            background: 'radial-gradient(ellipse, rgba(57,255,20,0.1) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
          aria-hidden
        />

        {/* Content */}
        <div
          className="gg-container"
          style={{
            position: 'relative',
            zIndex: 1,
            textAlign: 'center',
            padding: '80px 20px',
          }}
        >
          {/* Badge */}
          <div className="animate-fade-in" style={{ marginBottom: 24 }}>
            <span className="gg-pill gg-pill--gold" style={{ fontSize: 12 }}>
              <Zap size={10} />
              Official Fan Portal
            </span>
          </div>

          {/* Headline */}
          <h1
            className="animate-fade-in delay-100"
            style={{
              marginBottom: 24,
              background: 'linear-gradient(135deg, #fff 30%, var(--accent) 70%, var(--accent-red) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            DJ MAINO<br />DA PLUG
          </h1>

          <p
            className="animate-fade-in delay-200"
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              maxWidth: 520,
              margin: '0 auto 40px',
              color: 'var(--text-muted)',
              lineHeight: 1.7,
            }}
          >
            Official fan community and member portal for DJ Maino. Explore SoundCloud mixes, Twitch live sets, shows, and exclusive VIP drops.
          </p>

          {/* CTAs */}
          <div
            className="animate-fade-in delay-300"
            style={{
              display: 'flex',
              gap: 14,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Link href="/register" className="gg-btn gg-btn--primary gg-btn--lg">
              Join the Plug
              <ArrowRight size={18} />
            </Link>
            <Link href="/artists" className="gg-btn gg-btn--ghost gg-btn--lg">
              Explore Artists
            </Link>
          </div>

          {/* Stats strip */}
          <div
            className="animate-fade-in delay-400"
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 40,
              marginTop: 60,
              flexWrap: 'wrap',
            }}
          >
            {[
              { label: 'Mixes', value: '10+' },
              { label: 'Members', value: '5K+' },
              { label: 'Gigs & Streams', value: '50+' },
            ].map(({ label, value }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 900, fontSize: '2rem', color: 'var(--accent)', lineHeight: 1 }}>
                  {value}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: 4 }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          style={{
            position: 'absolute',
            bottom: 32,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
          }}
          aria-hidden
        >
          <div style={{
            width: 1,
            height: 48,
            background: 'linear-gradient(to bottom, var(--border-accent), transparent)',
          }} />
        </div>
      </section>

      {/* ── Twitch Live Section ───────────────────────────────────── */}
      <section style={{ padding: '60px 0 20px' }}>
        <div className="gg-container">
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <span className="gg-pill gg-pill--gold" style={{ marginBottom: 12 }}>
              🔴 Twitch Broadcast
            </span>
            <h2>Tune In Live</h2>
            <p style={{ maxWidth: 520, margin: '8px auto 0', color: 'var(--text-muted)' }}>
              Watch DJ Maino spin live sets directly. Turn up the volume and join the chat on Twitch!
            </p>
          </div>

          <div style={{
            maxWidth: 800,
            margin: '0 auto',
            position: 'relative',
            borderRadius: 18,
            overflow: 'hidden',
            border: '1px solid var(--border-accent)',
            boxShadow: '0 20px 50px rgba(0,229,255,0.1)',
            background: 'var(--panel)'
          }}>
            <iframe
              src={`https://player.twitch.tv/?channel=djmainodaplug&parent=${
                process.env.NEXT_PUBLIC_SITE_URL
                  ? new URL(process.env.NEXT_PUBLIC_SITE_URL).hostname
                  : 'localhost'
              }&autoplay=false`}
              height="450"
              width="100%"
              allowFullScreen
              style={{ border: 'none', display: 'block' }}
            ></iframe>
          </div>
        </div>
      </section>

      {/* ── Photobooth CTA ────────────────────────────────────────── */}
      <section style={{ padding: '80px 0' }}>
        <div className="gg-container">
          <div
            className="gg-card gg-card--accent animate-fade-in"
            style={{
              background: 'linear-gradient(135deg, rgba(0,229,255,0.07) 0%, rgba(57,255,20,0.04) 100%)',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 32,
              flexWrap: 'wrap',
              padding: '40px 48px',
            }}
          >
            <div style={{ flex: 1, minWidth: 260 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{
                  width: 48,
                  height: 48,
                  background: 'var(--accent)',
                  borderRadius: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Camera size={24} color="var(--ink)" />
                </div>
                <span className="gg-pill gg-pill--gold">Member Experience</span>
              </div>
              <h2 style={{ marginBottom: 12, fontSize: 'clamp(1.6rem, 3vw, 2.4rem)' }}>
                PLUG PHOTOBOOTH
              </h2>
              <p style={{ maxWidth: 440, lineHeight: 1.7 }}>
                Strike a pose with exclusive DJ Maino overlays, custom turntable stickers,
                and glowing headphones. Members only — sign up free.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/register" className="gg-btn gg-btn--primary">
                Sign Up Free
                <ArrowRight size={16} />
              </Link>
              <Link href="/login" className="gg-btn gg-btn--ghost">
                Log In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Artists ──────────────────────────────────────── */}
      <section style={{ padding: '24px 0 80px' }}>
        <div className="gg-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
            <div>
              <p className="gg-pill gg-pill--gold" style={{ display: 'inline-flex', marginBottom: 12 }}>
                <Star size={10} />
                The Roster
              </p>
              <h2>Featured Artists</h2>
            </div>
            <Link href="/artists" className="gg-btn gg-btn--ghost gg-btn--sm">
              View All <ArrowRight size={13} />
            </Link>
          </div>

          {artists.length > 0 ? (
            <div className="gg-grid-3">
              {artists.map((artist: any, i: number) => (
                <Link
                  key={artist._id}
                  href={`/artists/${artist.slug?.current}`}
                  className={`gg-card animate-fade-in delay-${Math.min(i * 100, 500)}`}
                  style={{ display: 'block', overflow: 'hidden' }}
                >
                  <div style={{
                    height: 200,
                    background: 'var(--surface)',
                    borderRadius: 12,
                    marginBottom: 14,
                    overflow: 'hidden',
                    position: 'relative',
                  }}>
                    {artist.photo && (
                      <Image
                        src={`https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${artist.photo.asset._ref.replace('image-', '').replace('-jpg', '.jpg').replace('-png', '.png').replace('-webp', '.webp')}`}
                        alt={artist.name}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    )}
                  </div>
                  <h4 style={{ marginBottom: 4 }}>{artist.name}</h4>
                  {artist.genre && (
                    <span className="gg-pill" style={{ fontSize: 10 }}>{artist.genre}</span>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            /* Placeholder cards while Sanity is being populated */
            <div className="gg-grid-3">
              {['DJ Maino da Plug', '48 Laws Network', 'Plug Affiliates'].map((name, i) => (
                <div
                  key={name}
                  className={`gg-card animate-fade-in delay-${i * 100}`}
                >
                  <div style={{
                    height: 200,
                    borderRadius: 12,
                    marginBottom: 14,
                    background: 'linear-gradient(135deg, var(--surface) 0%, var(--panel-hover) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 48,
                  }}>🔌</div>
                  <h4 style={{ marginBottom: 4 }}>{name}</h4>
                  <span className="gg-pill" style={{ fontSize: 10 }}>Plug Network</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Upcoming Events ───────────────────────────────────────── */}
      <section style={{ padding: '24px 0 80px', background: 'var(--bg-alt)' }}>
        <div className="gg-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
            <div>
              <p className="gg-pill gg-pill--red" style={{ display: 'inline-flex', marginBottom: 12 }}>🔥 Live & Upcoming</p>
              <h2>Events & Shows</h2>
            </div>
            <Link href="/events" className="gg-btn gg-btn--ghost gg-btn--sm">
              All Events <ArrowRight size={13} />
            </Link>
          </div>

          {events.length > 0 ? (
            <div className="gg-grid-2">
              {events.map((event: any, i: number) => (
                <div
                  key={event._id}
                  className={`gg-card animate-fade-in delay-${i * 100}`}
                  style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}
                >
                  <div style={{
                    minWidth: 56,
                    height: 56,
                    background: 'rgba(57,255,20,0.15)',
                    border: '1px solid rgba(57,255,20,0.3)',
                    borderRadius: 12,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#39ff14',
                  }}>
                    {event.eventDate
                      ? new Date(event.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).split(' ').map((p: string, idx: number) => (
                          <span key={idx} style={{ lineHeight: 1.2 }}>{p}</span>
                        ))
                      : '—'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ marginBottom: 4 }}>{event.title}</h4>
                    {event.venue && (
                      <p style={{ fontSize: 13 }}>{event.venue}</p>
                    )}
                    {event.ticketUrl && (
                      <a
                        href={event.ticketUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="gg-btn gg-btn--danger gg-btn--sm"
                        style={{ marginTop: 10 }}
                      >
                        Get Tickets
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="gg-card" style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
              <p style={{ fontSize: 32, marginBottom: 12 }}>🎤</p>
              <p>No upcoming shows or streams yet. Check back soon.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Join CTA ─────────────────────────────────────────────── */}
      <section style={{ padding: '80px 0' }}>
        <div className="gg-container" style={{ textAlign: 'center' }}>
          <span className="gg-pill gg-pill--gold" style={{ marginBottom: 20, display: 'inline-flex' }}>
            Free to Join
          </span>
          <h2 style={{ marginBottom: 16 }}>Become a Plug Fan</h2>
          <p style={{ maxWidth: 440, margin: '0 auto 36px', lineHeight: 1.7 }}>
            Free member accounts unlock the photobooth, event RSVPs, and
            exclusive DJ Maino content. VIP tiers unlock even more.
          </p>
          <Link href="/register" className="gg-btn gg-btn--primary gg-btn--lg">
            Join Free <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  )
}
