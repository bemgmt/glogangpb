import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  Calendar,
  Camera,
  Download,
  ExternalLink,
  Headphones,
  Mic2,
  Radio,
  Star,
  Users,
} from 'lucide-react'
import { TwitchEmbed } from '@/components/home/TwitchEmbed'
import {
  EPK_DOWNLOAD_URL,
  FADER_PRESS,
  GLO_STREAM_GUESTS,
  SELECTED_ARTISTS_AND_BRANDS,
  SOCIAL_PROOF,
  TOUR_CREDITS,
} from '@/lib/epk'
import { getFeaturedArtists, getUpcomingEvents } from '@/lib/sanity'

export const metadata = {
  title: 'DJ Maino Da Plug - Tour DJ, Livestream Host & Music Curator',
  description:
    'Official site for DJ Maino Da Plug: tour DJ, Glo Streams host, underground music curator, events, press, and booking.',
}

export const revalidate = 60

const ROLES = [
  {
    title: 'Tour DJ',
    description: 'High-energy sets built for tour stages, clubs, and artist-led live shows.',
    Icon: Headphones,
  },
  {
    title: 'Glo Streams Host',
    description: 'Live music discovery, interviews, commentary, and unfiltered artist conversation.',
    Icon: Radio,
  },
  {
    title: 'Music Curator',
    description: 'A sharp ear for the rap, rage, plugg, and alternative sounds moving next.',
    Icon: Star,
  },
  {
    title: 'Cultural Connector',
    description: 'Connecting emerging talent, established artists, brands, and real audiences.',
    Icon: Users,
  },
]

type UpcomingEvent = {
  _id: string
  title: string
  eventDate?: string
  venue?: string
  ticketUrl?: string
}

type FeaturedArtist = {
  _id: string
  name: string
  slug?: { current?: string }
  genre?: string
  photo?: { asset?: { _ref?: string } }
}

async function getData(): Promise<{ events: UpcomingEvent[]; artists: FeaturedArtist[] }> {
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

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'DJ Maino Da Plug',
    url: 'https://glogangworldwide.com',
    jobTitle: 'Tour DJ, Livestream Host and Music Curator',
    sameAs: [
      'https://www.instagram.com/mainodaplug/',
      'https://www.twitch.tv/djmainodaplug',
      'https://www.youtube.com/@Djmainodaplug/featured',
      'https://www.tiktok.com/@mainodaplug',
      'https://x.com/mainodaplug',
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <section className="maino-hero">
        <Image
          src="/img/epk/dj-maino-live-collage.jpg"
          alt="DJ Maino Da Plug performing and connecting with fans"
          fill
          priority
          sizes="100vw"
          className="maino-hero__image"
        />
        <div className="maino-hero__overlay" aria-hidden />
        <div className="maino-hero__texture" aria-hidden />

        <div className="gg-container maino-hero__content">
          <div className="maino-hero__copy">
            <p className="maino-kicker animate-fade-in">
              Tour DJ <span>×</span> Livestream Host <span>×</span> Cultural Curator
            </p>
            <h1 className="animate-fade-in delay-100">
              DJ MAINO
              <br />
              <span>DA PLUG</span>
            </h1>
            <p className="maino-hero__description animate-fade-in delay-200">
              From tour stages to Glo Streams at the Glo Shop, Maino connects
              underground rap and rage culture with the artists, stories, and moments
              pushing the scene forward.
            </p>
            <div className="maino-hero__actions animate-fade-in delay-300">
              <a
                href="https://www.twitch.tv/djmainodaplug"
                target="_blank"
                rel="noopener noreferrer"
                className="gg-btn gg-btn--primary gg-btn--lg"
              >
                Watch Glo Streams <ArrowRight size={18} />
              </a>
              <Link href="/epk" className="gg-btn gg-btn--secondary gg-btn--lg">
                Booking & EPK
              </Link>
              <Link href="/events" className="gg-btn gg-btn--ghost gg-btn--lg">
                Tour Dates
              </Link>
            </div>
          </div>

          <div className="maino-proof-grid animate-fade-in delay-400">
            {SOCIAL_PROOF.map(({ label, value }) => (
              <div key={label} className="maino-proof">
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
          <p className="maino-as-of">Audience figures supplied in the 2026 EPK.</p>
        </div>
      </section>

      <section className="maino-section maino-section--tight">
        <div className="gg-container">
          <div className="maino-section-heading">
            <div>
              <p className="maino-kicker">More Than The Set</p>
              <h2>The bridge to what&apos;s next</h2>
            </div>
            <p>
              Maino brings performance, discovery, conversation, and community into one
              artist-driven platform.
            </p>
          </div>
          <div className="maino-role-grid">
            {ROLES.map(({ title, description, Icon }) => (
              <article key={title} className="maino-role-card">
                <Icon size={24} aria-hidden />
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="glo-streams" className="maino-section maino-section--panel">
        <div className="gg-container maino-split">
          <div>
            <p className="maino-kicker">Live From The Glo Shop</p>
            <h2>Glo Streams</h2>
            <p className="maino-lede">
              A trusted room for independent and signed artists to share music, tell
              stories, joke freely, and connect directly with fans in real time.
            </p>
            <div className="maino-chip-list" role="list" aria-label="Selected Glo Streams guests">
              {GLO_STREAM_GUESTS.slice(0, 8).map((guest) => (
                <span key={guest} role="listitem">{guest}</span>
              ))}
            </div>
            <a
              href="https://www.twitch.tv/djmainodaplug/videos"
              target="_blank"
              rel="noopener noreferrer"
              className="gg-btn gg-btn--ghost"
            >
              Watch the archive <ExternalLink size={15} />
            </a>
          </div>

          <div className="maino-stream-frame">
            <TwitchEmbed />
          </div>
        </div>
      </section>

      <section className="maino-section">
        <div className="gg-container maino-split maino-split--tour">
          <div>
            <p className="maino-kicker">Selected Touring</p>
            <h2>Built for live rooms</h2>
            <p className="maino-lede">
              Verified tour experience across legacy R&B stages and the new underground,
              with the energy to connect both artists and audiences.
            </p>
            <Link href="/events" className="gg-btn gg-btn--primary">
              Upcoming dates <Calendar size={16} />
            </Link>
          </div>

          <ol className="maino-tour-list">
            {TOUR_CREDITS.map(({ year, title }) => (
              <li key={`${year}-${title}`}>
                <span>{year}</span>
                <strong>{title}</strong>
              </li>
            ))}
          </ol>
        </div>

        <div className="gg-container maino-name-wall">
          <p>Selected artist, stage & brand work</p>
          <div>
            {SELECTED_ARTISTS_AND_BRANDS.map((name) => (
              <span key={name}>{name}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="maino-section maino-section--press">
        <div className="gg-container maino-press-grid">
          <article className="maino-press-card">
            <p className="maino-kicker">Press</p>
            <p className="maino-press-card__publication">{FADER_PRESS.publication}</p>
            <h2>{FADER_PRESS.title}</h2>
            <p>{FADER_PRESS.description}</p>
            <div className="maino-press-card__meta">
              <span>{FADER_PRESS.date}</span>
              <a
                href={FADER_PRESS.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Read on The FADER <ExternalLink size={14} />
              </a>
            </div>
          </article>

          <article className="maino-epk-card">
            <div>
              <p className="maino-kicker">2026 Electronic Press Kit</p>
              <h2>Press-ready assets & verified credits</h2>
              <p>
                Biography, touring history, Glo Streams guests, audience proof, press,
                and management contact in one place.
              </p>
            </div>
            <div className="maino-epk-card__actions">
              <Link href="/epk" className="gg-btn gg-btn--primary">
                Open web EPK <ArrowRight size={16} />
              </Link>
              <a href={EPK_DOWNLOAD_URL} download className="gg-btn gg-btn--ghost">
                Download PDF <Download size={16} />
              </a>
            </div>
          </article>
        </div>
      </section>

      <section className="maino-section maino-section--panel">
        <div className="gg-container">
          <div className="maino-section-heading">
            <div>
              <p className="maino-kicker">Live & Upcoming</p>
              <h2>Events & shows</h2>
            </div>
            <Link href="/events" className="gg-btn gg-btn--ghost gg-btn--sm">
              All events <ArrowRight size={13} />
            </Link>
          </div>

          {events.length > 0 ? (
            <div className="gg-grid-2">
              {events.map((event) => (
                <article key={event._id} className="gg-card maino-event-card">
                  <div className="maino-event-date">
                    {event.eventDate
                      ? new Date(event.eventDate)
                          .toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                          .split(' ')
                          .map((part: string) => <span key={part}>{part}</span>)
                      : 'TBA'}
                  </div>
                  <div>
                    <h3>{event.title}</h3>
                    {event.venue && <p>{event.venue}</p>}
                    {event.ticketUrl && (
                      <a
                        href={event.ticketUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="gg-btn gg-btn--primary gg-btn--sm"
                      >
                        Get tickets
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="gg-card maino-empty-state">
              <Mic2 size={28} aria-hidden />
              <div>
                <h3>New dates are being announced</h3>
                <p>Follow Maino for tour drops and the next Glo Streams broadcast.</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {artists.length > 0 && (
        <section className="maino-section">
          <div className="gg-container">
            <div className="maino-section-heading">
              <div>
                <p className="maino-kicker">Artists & Collaborators</p>
                <h2>Inside the movement</h2>
              </div>
              <Link href="/artists" className="gg-btn gg-btn--ghost gg-btn--sm">
                View all <ArrowRight size={13} />
              </Link>
            </div>
            <div className="gg-grid-3">
              {artists.map((artist) => (
                <Link
                  key={artist._id}
                  href={`/artists/${artist.slug?.current}`}
                  className="gg-card maino-artist-card"
                >
                  <div>
                    {artist.photo?.asset?._ref && (
                      <Image
                        src={`https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${artist.photo.asset._ref
                          .replace('image-', '')
                          .replace('-jpg', '.jpg')
                          .replace('-png', '.png')
                          .replace('-webp', '.webp')}`}
                        alt={artist.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    )}
                  </div>
                  <h3>{artist.name}</h3>
                  {artist.genre && <p>{artist.genre}</p>}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="maino-section maino-fan-cta">
        <div className="gg-container maino-fan-cta__inner">
          <div>
            <p className="maino-kicker">For The Community</p>
            <h2>Step inside the movement</h2>
            <p>
              Free membership unlocks the Plug Photobooth, event RSVPs, and exclusive
              DJ Maino content.
            </p>
          </div>
          <div className="maino-fan-cta__actions">
            <Link href="/register" className="gg-btn gg-btn--primary">
              Join free <ArrowRight size={16} />
            </Link>
            <Link href="/membership" className="gg-btn gg-btn--ghost">
              Membership
            </Link>
            <Link href="/login" className="gg-btn gg-btn--ghost" aria-label="Open the member photobooth">
              <Camera size={16} /> Photobooth
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
