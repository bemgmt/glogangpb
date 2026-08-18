import type { Metadata } from 'next'
import Image from 'next/image'
import {
  ArrowRight,
  Download,
  ExternalLink,
  Mail,
} from 'lucide-react'
import {
  BOOKING_EMAIL,
  EPK_DOWNLOAD_URL,
  FADER_PRESS,
  GLO_STREAM_GUESTS,
  SELECTED_ARTISTS_AND_BRANDS,
  SOCIAL_PROOF,
  TOUR_CREDITS,
} from '@/lib/epk'

export const metadata: Metadata = {
  title: 'Electronic Press Kit',
  description:
    'Official 2026 electronic press kit for DJ Maino Da Plug, including biography, tour credits, audience statistics, press, and booking contact.',
  openGraph: {
    title: 'DJ Maino Da Plug - 2026 Electronic Press Kit',
    description: 'Tour DJ, Glo Streams host, music curator, and cultural connector.',
    images: [
      {
        url: '/img/epk/dj-maino-epk-cover.jpg',
        width: 1440,
        height: 810,
        alt: 'DJ Maino Da Plug 2026 Electronic Press Kit',
      },
    ],
  },
}

export default function EpkPage() {
  return (
    <div className="epk-page">
      <section className="epk-page__hero">
        <div className="gg-container epk-page__hero-grid">
          <div>
            <p className="maino-kicker">Official 2026 Electronic Press Kit</p>
            <h1>DJ Maino Da Plug</h1>
            <p className="epk-page__intro">
              Underground music curator, tour DJ, livestream host, and cultural
              tastemaker working at the center of rap and rage culture.
            </p>
            <div className="epk-page__actions">
              <a href={EPK_DOWNLOAD_URL} download className="gg-btn gg-btn--primary gg-btn--lg">
                Download PDF <Download size={18} />
              </a>
              <a
                href={`mailto:${BOOKING_EMAIL}?subject=DJ%20Maino%20Booking%20Inquiry`}
                className="gg-btn gg-btn--ghost gg-btn--lg"
              >
                Booking inquiry <Mail size={18} />
              </a>
            </div>
          </div>

          <div className="epk-page__cover">
            <Image
              src="/img/epk/dj-maino-epk-cover.jpg"
              alt="DJ Maino Da Plug 2026 Electronic Press Kit cover"
              fill
              priority
              sizes="(max-width: 900px) 100vw, 46vw"
            />
          </div>
        </div>
      </section>

      <section className="maino-section maino-section--panel">
        <div className="gg-container">
          <p className="maino-kicker">Audience</p>
          <h2 className="epk-page__section-title">Platform proof</h2>
          <div className="epk-page__stat-grid">
            {SOCIAL_PROOF.map(({ label, value }) => (
              <div key={label}>
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
          <p className="epk-page__note">
            Combined social likes represent TikTok, Instagram, and Twitch. Audience
            figures are supplied in the 2026 EPK.
          </p>
        </div>
      </section>

      <section className="maino-section">
        <div className="gg-container epk-page__bio-grid">
          <div>
            <p className="maino-kicker">Biography</p>
            <h2 className="epk-page__section-title">A bridge between the underground and the next wave</h2>
          </div>
          <div className="epk-page__bio-copy">
            <p>
              DJ Maino Da Plug is an underground music curator, tour DJ, livestream
              host, and cultural tastemaker known for authentic artist-driven moments
              and a sharp ear for emerging talent.
            </p>
            <p>
              Operating out of Chief Keef&apos;s Glo Shop, Maino hosts Glo Streams, where
              independent and signed artists share music, tell stories, and connect
              directly with fans. The platform blends discovery, interviews, live
              commentary, and unfiltered conversation for today&apos;s internet-driven rap
              audience.
            </p>
            <p>
              As the official DJ for Bear1Boss and a close collaborator of
              UnoTheActivist, Maino helps amplify rage, plugg, and alternative
              underground sounds across live and digital audiences.
            </p>
          </div>
        </div>
      </section>

      <section className="maino-section maino-section--panel">
        <div className="gg-container epk-page__two-column">
          <div>
            <p className="maino-kicker">Selected Touring</p>
            <h2 className="epk-page__section-title">Tour history</h2>
            <ol className="maino-tour-list">
              {TOUR_CREDITS.map(({ year, title }) => (
                <li key={`${year}-${title}`}>
                  <span>{year}</span>
                  <strong>{title}</strong>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <p className="maino-kicker">Glo Streams</p>
            <h2 className="epk-page__section-title">Selected guests</h2>
            <div className="epk-page__guest-grid">
              {GLO_STREAM_GUESTS.map((guest) => (
                <span key={guest}>{guest}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="maino-section">
        <div className="gg-container">
          <p className="maino-kicker">Selected Work</p>
          <h2 className="epk-page__section-title">Artists, stages & brands</h2>
          <div className="epk-page__name-grid">
            {SELECTED_ARTISTS_AND_BRANDS.map((name) => (
              <span key={name}>{name}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="maino-section maino-section--press">
        <div className="gg-container epk-page__press">
          <div>
            <p className="maino-kicker">Press</p>
            <p className="epk-page__press-publication">{FADER_PRESS.publication}</p>
            <h2>{FADER_PRESS.title}</h2>
            <p>{FADER_PRESS.description}</p>
          </div>
          <div className="epk-page__press-action">
            <span>{FADER_PRESS.date}</span>
            <a
              href={FADER_PRESS.url}
              target="_blank"
              rel="noopener noreferrer"
              className="gg-btn gg-btn--primary"
            >
              Read the cover story <ExternalLink size={16} />
            </a>
          </div>
        </div>
      </section>

      <section className="maino-section">
        <div className="gg-container epk-page__booking">
          <div>
            <p className="maino-kicker">Management & Booking</p>
            <h2>Bring DJ Maino to the room</h2>
            <p>
              For touring, event hosting, livestream appearances, media, and brand
              opportunities, contact management directly.
            </p>
          </div>
          <a
            href={`mailto:${BOOKING_EMAIL}?subject=DJ%20Maino%20Booking%20Inquiry`}
            className="epk-page__email"
          >
            {BOOKING_EMAIL} <ArrowRight size={22} />
          </a>
        </div>
      </section>
    </div>
  )
}
