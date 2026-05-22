'use client'

import { useEffect, useState, useMemo } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Artist {
  _id: string
  name: string
  genre?: string
  slug?: { current: string }
  photo?: { asset?: { url: string } }
  featured?: boolean
}

// ---------------------------------------------------------------------------
// Placeholder data (shown when Sanity returns nothing)
// ---------------------------------------------------------------------------
const PLACEHOLDER_ARTISTS: Artist[] = [
  { _id: 'ph1', name: 'Chief Keef', genre: 'Drill', featured: true },
  { _id: 'ph2', name: 'Tadoe', genre: 'Hip-Hop' },
  { _id: 'ph3', name: 'Ballout', genre: 'Drill' },
  { _id: 'ph4', name: 'Fredo Santana', genre: 'Trap' },
  { _id: 'ph5', name: 'SD', genre: 'Drill' },
  { _id: 'ph6', name: 'Capo', genre: 'Hip-Hop' },
]

// ---------------------------------------------------------------------------
// Artist Card
// ---------------------------------------------------------------------------
function ArtistCard({ artist }: { artist: Artist }) {
  const initials = artist.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="gg-card artist-card" style={{ position: 'relative', overflow: 'hidden' }}>
      {artist.featured && (
        <span
          className="gg-pill gg-pill--gold"
          style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 1 }}
        >
          FEATURED
        </span>
      )}

      {/* Photo / avatar */}
      <div className="artist-avatar">
        {artist.photo?.asset?.url ? (
          <img
            src={artist.photo.asset.url}
            alt={artist.name}
            className="artist-avatar__img"
          />
        ) : (
          <span className="artist-avatar__initials">{initials}</span>
        )}
      </div>

      <h3 className="artist-card__name">{artist.name}</h3>

      {artist.genre && (
        <span className="gg-pill" style={{ marginTop: '0.5rem' }}>
          {artist.genre}
        </span>
      )}

      <a
        href={`/artists/${artist.slug?.current ?? artist._id}`}
        className="gg-btn gg-btn--ghost gg-btn--sm"
        style={{ marginTop: '1rem', display: 'inline-block' }}
      >
        View Profile
      </a>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Artists Client Component (handles search)
// ---------------------------------------------------------------------------
export default function ArtistsClient({ artists }: { artists: Artist[] }) {
  const [query, setQuery] = useState('')
  const data = artists.length > 0 ? artists : PLACEHOLDER_ARTISTS

  const filtered = useMemo(() => {
    if (!query.trim()) return data
    return data.filter((a) =>
      a.name.toLowerCase().includes(query.toLowerCase()),
    )
  }, [query, data])

  return (
    <>
      {/* Search bar */}
      <div className="artists-search-wrap">
        <div style={{ position: 'relative', maxWidth: 480 }}>
          <span className="artists-search__icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
          </span>
          <input
            id="artist-search"
            type="search"
            placeholder="Search artists…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="gg-field artists-search__input"
            aria-label="Search artists"
          />
        </div>
        {query && (
          <p className="artists-search__count">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="gg-grid-3">
          {filtered.map((artist) => (
            <ArtistCard key={artist._id} artist={artist} />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
          <p>No artists found matching &ldquo;{query}&rdquo;</p>
          <button
            className="gg-btn gg-btn--ghost gg-btn--sm"
            onClick={() => setQuery('')}
            style={{ marginTop: '1rem' }}
          >
            Clear Search
          </button>
        </div>
      )}
    </>
  )
}
