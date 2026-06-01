import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from 'next-sanity'
import Link from 'next/link'
import { Instagram, Twitter, Youtube, Music, ArrowLeft } from 'lucide-react'

// ---------------------------------------------------------------------------
// Sanity Client
// ---------------------------------------------------------------------------
const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
})

// ---------------------------------------------------------------------------
// Types & Mock Data
// ---------------------------------------------------------------------------
interface Artist {
  _id: string
  name: string
  genre?: string
  bio?: string
  slug?: { current: string }
  photo?: { asset?: { url: string } }
  featured?: boolean
  socialLinks?: {
    instagram?: string
    twitter?: string
    youtube?: string
    spotify?: string
  }
  releases?: string[]
}

const PLACEHOLDER_ARTISTS: Record<string, Artist> = {
  ph1: {
    _id: 'ph1',
    name: 'DJ Maino da Plug',
    genre: 'DJ / Curator',
    featured: true,
    bio: 'Renowned as a premier curator and host of the highly acclaimed 48 Laws mixtape series, DJ Maino da Plug has carved out a unique space in modern music culture. Spinning the freshest tracks, managing rising talent, and building a massive digital fan base, DJ Maino is the ultimate conduit for music discovery.',
    socialLinks: {
      instagram: 'https://www.instagram.com/mainodaplug/',
      twitter: 'https://x.com/mainodaplug',
      youtube: 'https://www.youtube.com/@Djmainodaplug/featured',
      spotify: 'https://soundcloud.com/48-laws',
    },
    releases: ['48 Laws of Power Vol. 8', 'Plug Sessions Vol. 1', 'The Warm Up Mix'],
  },
  ph2: {
    _id: 'ph2',
    name: 'Kid 48',
    genre: 'Trap',
    bio: 'Kid 48 is a rising talent under the 48 Laws Network. Managed by DJ Maino, his fast-paced flows and melodic trap hooks are defining the new sound of the underground.',
    socialLinks: {
      instagram: 'https://instagram.com',
      twitter: 'https://twitter.com',
    },
    releases: ['Underdog Story', '48 Laws Tape Feature'],
  },
  ph3: {
    _id: 'ph3',
    name: 'Lex 808',
    genre: 'Drill',
    bio: 'Lex 808 is a Chicago-born producer and rapper who brings the raw energy of drill beats to DJ Maino\'s projects and collaborative tapes.',
    socialLinks: {
      instagram: 'https://instagram.com',
      twitter: 'https://twitter.com',
    },
    releases: ['Out of the Dark', 'Strictly Beats'],
  },
  ph4: {
    _id: 'ph4',
    name: 'Plug Producer',
    genre: 'Beats',
    bio: 'A chief producer behind the 48 Laws of Power mixtape series. Known for crafting hard-hitting 808s and spacey synth lines featured on DJ Maino\'s live sets.',
    socialLinks: {
      instagram: 'https://instagram.com',
      youtube: 'https://youtube.com',
    },
    releases: ['Drum Kit Vol. 1', 'Night Vision Instrumental'],
  },
  ph5: {
    _id: 'ph5',
    name: 'Volt Rapper',
    genre: 'Hip-Hop',
    bio: 'With electric stage presence and high-octane delivery, Volt Rapper is a frequent collaborator on DJ Maino\'s club tours and festival appearances.',
    socialLinks: {
      twitter: 'https://twitter.com',
    },
    releases: ['Live Energy EP', 'Static Flow'],
  },
  ph6: {
    _id: 'ph6',
    name: 'Supa Bass',
    genre: 'Electronic',
    bio: 'Supa Bass provides the heavy electronic and bass elements that DJ Maino blends into his live sets. He is a primary contributor to the 48 Laws soundsystem.',
    socialLinks: {
      instagram: 'https://instagram.com',
    },
    releases: ['Frequency Shift'],
  },
}

// Map slugs to placeholder keys for easy lookup
const SLUG_TO_PLACEHOLDER: Record<string, string> = {
  'dj-maino-da-plug': 'ph1',
  'kid-48': 'ph2',
  'lex-808': 'ph3',
  'plug-producer': 'ph4',
  'volt-rapper': 'ph5',
  'supa-bass': 'ph6',
}

// ---------------------------------------------------------------------------
// Data Fetching
// ---------------------------------------------------------------------------
async function getArtist(slug: string): Promise<Artist | null> {
  // Check if it's a placeholder ID/slug first
  const placeholderKey = SLUG_TO_PLACEHOLDER[slug] || slug
  if (PLACEHOLDER_ARTISTS[placeholderKey]) {
    return PLACEHOLDER_ARTISTS[placeholderKey]
  }

  try {
    const query = `*[_type == "artist" && (slug.current == $slug || _id == $slug)][0] {
      _id, name, genre, bio, slug, featured,
      photo { asset->{ url } },
      socialLinks, releases
    }`
    const result = await sanity.fetch(query, { slug })
    return result || null
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Dynamic Metadata Generation
// ---------------------------------------------------------------------------
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const artist = await getArtist(slug)
  if (!artist) return { title: 'Artist Not Found | DJ Maino da Plug' }

  return {
    title: `${artist.name} | 48 Laws Soundsystem`,
    description: artist.bio ? artist.bio.slice(0, 160) : `Explore ${artist.name}'s profile.`,
  }
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------
export default async function ArtistProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const artist = await getArtist(slug)

  if (!artist) {
    notFound()
  }

  const initials = artist.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <main className="gg-container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>
      {/* Back Button */}
      <Link href="/artists" className="gg-btn gg-btn--ghost gg-btn--sm" style={{ marginBottom: '2rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
        <ArrowLeft size={16} />
        Back To Roster
      </Link>

      <div className="artist-layout">
        {/* Left Column: Image & Quick Details */}
        <div className="artist-col-left">
          <div className="artist-avatar-large">
            {artist.photo?.asset?.url ? (
              <img
                src={artist.photo.asset.url}
                alt={artist.name}
                className="artist-avatar-large__img"
              />
            ) : (
              <span className="artist-avatar-large__initials">{initials}</span>
            )}
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
            {artist.genre && (
              <span className="gg-pill gg-pill--gold" style={{ fontSize: '0.9rem', padding: '0.4rem 1rem' }}>
                {artist.genre}
              </span>
            )}
            {artist.featured && (
              <span className="gg-pill" style={{ border: '1px solid var(--accent)', color: 'var(--accent)' }}>
                FEATURED ARTIST
              </span>
            )}
          </div>

          {/* Social Links */}
          {artist.socialLinks && (
            <div className="artist-socials" style={{ marginTop: '2rem' }}>
              <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 900, textTransform: 'uppercase', fontSize: '0.8rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textAlign: 'center', marginBottom: '1rem' }}>
                Social Channels
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                {artist.socialLinks.instagram && (
                  <a href={artist.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="social-icon-btn" aria-label="Instagram">
                    <Instagram size={20} />
                  </a>
                )}
                {artist.socialLinks.twitter && (
                  <a href={artist.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="social-icon-btn" aria-label="Twitter/X">
                    <Twitter size={20} />
                  </a>
                )}
                {artist.socialLinks.youtube && (
                  <a href={artist.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="social-icon-btn" aria-label="YouTube">
                    <Youtube size={20} />
                  </a>
                )}
                {artist.socialLinks.spotify && (
                  <a href={artist.socialLinks.spotify} target="_blank" rel="noopener noreferrer" className="social-icon-btn" aria-label="Spotify">
                    <Music size={20} />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Bio & Releases */}
        <div className="artist-col-right">
          <h1
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              lineHeight: 1,
              color: 'var(--text)',
              margin: 0,
            }}
          >
            {artist.name}
          </h1>

          <hr className="gg-divider" style={{ margin: '2rem 0' }} />

          <section>
            <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 900, textTransform: 'uppercase', fontSize: '1.25rem', letterSpacing: '0.05em', color: 'var(--accent)', marginBottom: '1rem' }}>
              Biography
            </h2>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--text-muted)' }}>
              {artist.bio || 'Biography coming soon. Stay tuned for details.'}
            </p>
          </section>

          {artist.releases && artist.releases.length > 0 && (
            <section style={{ marginTop: '3rem' }}>
              <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 900, textTransform: 'uppercase', fontSize: '1.25rem', letterSpacing: '0.05em', color: 'var(--text)', marginBottom: '1.5rem' }}>
                Key Releases
              </h2>
              <div className="releases-list">
                {artist.releases.map((release, i) => (
                  <div key={i} className="gg-card release-card">
                    <div className="release-icon">
                      <Music size={18} />
                    </div>
                    <div>
                      <p className="release-title">{release}</p>
                      <p className="release-type">Album/Mixtape</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <style>{`
        .artist-layout {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 4rem;
          margin-top: 2rem;
        }
        @media (max-width: 900px) {
          .artist-layout {
            grid-template-columns: 1fr;
            gap: 3rem;
          }
          .artist-col-left {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
        }
        .artist-avatar-large {
          width: 280px;
          height: 280px;
          border-radius: 24px;
          background: var(--panel);
          border: 3px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4);
        }
        .artist-avatar-large__img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .artist-avatar-large__initials {
          font-family: var(--font-sans);
          font-size: 5rem;
          font-weight: 900;
          color: var(--accent);
          letter-spacing: 0.04em;
        }
        .social-icon-btn {
          width: 44px;
          height: 44px;
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text);
          transition: all 0.2s;
        }
        .social-icon-btn:hover {
          color: var(--accent);
          border-color: var(--accent);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 209, 0, 0.2);
        }
        .releases-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 1.5rem;
        }
        .release-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem;
          background: var(--panel);
          border: 1px solid var(--border);
        }
        .release-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          background: rgba(255, 209, 0, 0.1);
          color: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .release-title {
          font-family: var(--font-sans);
          font-weight: 700;
          font-size: 1rem;
          color: var(--text);
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }
        .release-type {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin: 0.25rem 0 0;
        }
      `}</style>
    </main>
  )
}
