import type { Metadata } from 'next'
import { createClient } from 'next-sanity'
import ArtistsClient from './ArtistsClient'

// ---------------------------------------------------------------------------
// SEO
// ---------------------------------------------------------------------------
export const metadata: Metadata = {
  title: 'Artists & Affiliates | DJ Maino da Plug',
  description:
    'Explore the full roster of DJ Maino da Plug collaborators and artists. Discover music, bios, and upcoming shows.',
  openGraph: {
    title: 'Artists & Affiliates | DJ Maino da Plug',
    description: 'Explore the full roster of DJ Maino da Plug collaborators and artists.',
  },
}

// ---------------------------------------------------------------------------
// Sanity client (read-only, no auth token needed for public data)
// ---------------------------------------------------------------------------
const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
})

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------
async function getArtists() {
  try {
    const query = `*[_type == "artist"] | order(featured desc, name asc) {
      _id, name, genre, slug, featured,
      photo { asset->{ url } }
    }`
    return await sanity.fetch(query)
  } catch {
    return []
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default async function ArtistsPage() {
  const artists = await getArtists()

  return (
    <div className="gg-container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      {/* Header */}
      <header style={{ marginBottom: '2.5rem' }}>
        <p className="gg-pill gg-pill--gold" style={{ marginBottom: '0.75rem' }}>
          THE ROSTER
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
          Collaborators & Affiliates
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.75rem', maxWidth: 560 }}>
          48 Laws Network. Discover the talent and producers behind the movement.
        </p>
      </header>

      <hr className="gg-divider" style={{ marginBottom: '2rem' }} />

      {/* Client component handles search + grid */}
      <ArtistsClient artists={artists} />

      <style>{`
        .artist-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 2rem 1.5rem;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .artist-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 32px rgba(255, 193, 7, 0.12);
        }
        .artist-avatar {
          width: 96px;
          height: 96px;
          border-radius: 50%;
          background: var(--panel);
          border: 2px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
          overflow: hidden;
        }
        .artist-avatar__img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .artist-avatar__initials {
          font-family: var(--font-sans);
          font-size: 1.75rem;
          font-weight: 900;
          color: var(--accent);
          letter-spacing: 0.04em;
        }
        .artist-card__name {
          font-family: var(--font-sans);
          font-size: 1.125rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text);
          margin: 0;
        }
        .artists-search-wrap {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }
        .artists-search__icon {
          position: absolute;
          left: 0.875rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          pointer-events: none;
          display: flex;
        }
        .artists-search__input {
          padding-left: 2.75rem !important;
          width: 100%;
          min-width: 280px;
        }
        .artists-search__count {
          color: var(--text-muted);
          font-size: 0.875rem;
          margin: 0;
        }
      `}</style>
    </div>
  )
}
