import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient as createSanityClient } from 'next-sanity'
import Link from 'next/link'
import { PlusCircle, ExternalLink, Calendar, Tag } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Manage News | Glo Gang Admin',
  description: 'View and manage Glo Gang news articles.',
}

const sanity = createSanityClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
})

interface NewsPost {
  _id: string
  title: string
  publishedAt: string
  category?: string
  featured?: boolean
}

const PLACEHOLDER_POSTS: NewsPost[] = [
  {
    _id: 'np1',
    title: 'Chief Keef Announces Almighty So 2 Tour Dates',
    publishedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    category: 'tour',
    featured: true,
  },
  {
    _id: 'np2',
    title: 'New Drop: Glo Gang x Glory Boyz Premium Hoodies',
    publishedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    category: 'community',
    featured: false,
  },
  {
    _id: 'np3',
    title: 'Tadoe Releases New Album "Glory To Drill"',
    publishedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    category: 'release',
    featured: false,
  },
  {
    _id: 'np4',
    title: 'Inside the Glo Gang Physical Photobooth Experience',
    publishedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    category: 'general',
    featured: false,
  },
]

async function getNews() {
  try {
    const query = `*[_type == "newsPost"] | order(publishedAt desc) {
      _id, title, publishedAt, category, featured
    }`
    return await sanity.fetch(query)
  } catch {
    return []
  }
}

export default async function AdminNewsPage() {
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
  const sanityNews = await getNews()
  const posts = sanityNews.length > 0 ? sanityNews : PLACEHOLDER_POSTS

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <main style={{ padding: '2rem' }}>
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
            Manage News
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Publish label news, releases, announcements, or features. Managed via Sanity Studio.
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
              <th>Article Headline</th>
              <th>Publish Date</th>
              <th>Category</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post: any) => (
              <tr key={post._id}>
                <td>
                  <span style={{ fontWeight: 700, fontSize: '1rem' }}>{post.title}</span>
                </td>
                <td>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
                    <Calendar size={12} className="meta-icon" /> {formatDate(post.publishedAt)}
                  </span>
                </td>
                <td>
                  {post.category ? (
                    <span className="news-cat-tag">
                      <Tag size={10} style={{ marginRight: '0.25rem' }} />
                      {post.category}
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
                <td>
                  {post.featured ? (
                    <span className="featured-label">Featured</span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>Standard</span>
                  )}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <Link
                    href={`/studio/structure/intent/edit;id=${post._id};type=newsPost`}
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
        .meta-icon {
          color: var(--accent);
        }
        .news-cat-tag {
          font-size: 0.7rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
        }
        .featured-label {
          display: inline-block;
          font-size: 0.7rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--accent);
          background: rgba(255, 209, 0, 0.1);
          border: 1px solid var(--accent);
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
        }
      `}</style>
    </main>
  )
}
