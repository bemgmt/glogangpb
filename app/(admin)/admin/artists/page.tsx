import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient as createSanityClient } from 'next-sanity'
import Link from 'next/link'
import { PlusCircle, ExternalLink, Star } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Manage Artists | Maino da Plug Admin',
  description: 'View and manage the Maino da Plug artist roster.',
}

const sanity = createSanityClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
})

interface Artist {
  _id: string
  name: string
  genre?: string
  slug?: { current: string }
  featured?: boolean
}

const PLACEHOLDER_ARTISTS: Artist[] = [
  { _id: 'ph1', name: 'Maino da Plug', genre: 'DJ / Curator', featured: true },
  { _id: 'ph2', name: 'Kid 48', genre: 'Trap' },
  { _id: 'ph3', name: 'Lex 808', genre: 'Drill' },
  { _id: 'ph4', name: 'Plug Producer', genre: 'Beats' },
  { _id: 'ph5', name: 'Volt Rapper', genre: 'Hip-Hop' },
  { _id: 'ph6', name: 'Supa Bass', genre: 'Electronic' },
]

async function getArtists() {
  try {
    const query = `*[_type == "artist"] | order(name asc) {
      _id, name, genre, slug, featured
    }`
    return await sanity.fetch(query)
  } catch {
    return []
  }
}

export default async function AdminArtistsPage() {
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
  const sanityArtists = await getArtists()
  const artists = sanityArtists.length > 0 ? sanityArtists : PLACEHOLDER_ARTISTS

  return (
    <div style={{ padding: '2rem' }}>
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
            Manage Artists
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Artists and affiliates in the Maino da Plug / 48 Laws roster. Sync is done automatically via Sanity Studio.
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
              <th>Artist Name</th>
              <th>Genre</th>
              <th>Status</th>
              <th>ID/Slug</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {artists.map((artist: any) => (
              <tr key={artist._id}>
                <td>
                  <span style={{ fontWeight: 700, fontSize: '1rem' }}>{artist.name}</span>
                </td>
                <td>
                  {artist.genre ? (
                    <span className="gg-pill" style={{ fontSize: '0.75rem' }}>{artist.genre}</span>
                  ) : (
                    '—'
                  )}
                </td>
                <td>
                  {artist.featured ? (
                    <span className="featured-label">
                      <Star size={12} fill="var(--accent)" /> Featured
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>Standard</span>
                  )}
                </td>
                <td>
                  <code style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>
                    {artist.slug?.current || artist._id}
                  </code>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <Link
                    href={`/studio/structure/intent/edit;id=${artist._id};type=artist`}
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
        .featured-label {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--accent);
        }
      `}</style>
    </div>
  )
}
