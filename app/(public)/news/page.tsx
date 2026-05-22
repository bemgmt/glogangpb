import type { Metadata } from 'next'
import { createClient } from 'next-sanity'
import Link from 'next/link'
import { Calendar, Tag, ArrowRight } from 'lucide-react'

// ---------------------------------------------------------------------------
// SEO
// ---------------------------------------------------------------------------
export const metadata: Metadata = {
  title: 'News & Releases | Glo Gang Worldwide',
  description: 'Stay updated with the latest music releases, tour dates, and announcements from Glo Gang.',
}

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
interface NewsPost {
  _id: string
  title: string
  publishedAt: string
  category?: string
  excerpt?: string
  slug?: { current: string }
  coverImage?: { asset?: { url: string } }
  featured?: boolean
}

const PLACEHOLDER_POSTS: NewsPost[] = [
  {
    _id: 'np1',
    title: 'Chief Keef Announces Almighty So 2 Tour Dates',
    publishedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    category: 'tour',
    featured: true,
    excerpt: 'The Glo Gang frontman is taking the highly anticipated Almighty So 2 on the road. Check out the city listings and ticket drop schedules inside.',
  },
  {
    _id: 'np2',
    title: 'New Drop: Glo Gang x Glory Boyz Premium Hoodies',
    publishedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    category: 'community',
    excerpt: 'Featuring embroidered star logos and premium heavyweight cotton, the latest drops are available now on the Glo Gang Worldwide store.',
  },
  {
    _id: 'np3',
    title: 'Tadoe Releases New Album "Glory To Drill"',
    publishedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    category: 'release',
    excerpt: 'Tadoe delivers 14 tracks of pure drill energy. The album features Chief Keef, Ballout, and production by Young Chop.',
  },
  {
    _id: 'np4',
    title: 'Inside the Glo Gang Physical Photobooth Experience',
    publishedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    category: 'general',
    excerpt: 'Learn more about the state-of-the-art interactive photobooth setup in our flagship store, complete with custom face-filters.',
  },
]

// ---------------------------------------------------------------------------
// Data Fetching
// ---------------------------------------------------------------------------
async function getNews(): Promise<NewsPost[]> {
  try {
    const query = `*[_type == "newsPost"] | order(publishedAt desc) {
      _id, title, publishedAt, category, excerpt, slug, featured,
      coverImage { asset->{ url } }
    }`
    return await sanity.fetch(query)
  } catch {
    return []
  }
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------
export default async function NewsPage() {
  const posts = await getNews()
  const data = posts.length > 0 ? posts : PLACEHOLDER_POSTS

  // Split featured and regular posts
  const featuredPost = data.find((p) => p.featured) || data[0]
  const listPosts = data.filter((p) => p._id !== featuredPost?._id)

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <main className="gg-container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>
      {/* Header */}
      <header style={{ marginBottom: '3rem' }}>
        <p className="gg-pill gg-pill--gold" style={{ marginBottom: '0.75rem' }}>
          GG BLOG
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
          News & Releases
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.75rem', maxWidth: 560 }}>
          Stay updated with Glo Gang announcements, album releases, streetwear drops, and events.
        </p>
      </header>

      <hr className="gg-divider" style={{ marginBottom: '3rem' }} />

      {/* Featured Post */}
      {featuredPost && (
        <section style={{ marginBottom: '4rem' }}>
          <div className="gg-card featured-post-card">
            <div className="featured-img-wrap">
              {featuredPost.coverImage?.asset?.url ? (
                <img src={featuredPost.coverImage.asset.url} alt={featuredPost.title} className="featured-img" />
              ) : (
                <div className="featured-img-placeholder">GLO GANG</div>
              )}
            </div>
            <div className="featured-content">
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <span className="gg-pill gg-pill--gold">FEATURED</span>
                {featuredPost.category && (
                  <span className="news-cat-pill">
                    <Tag size={12} style={{ marginRight: '0.25rem' }} />
                    {featuredPost.category}
                  </span>
                )}
              </div>

              <h2 className="featured-title">{featuredPost.title}</h2>
              <p className="featured-excerpt">{featuredPost.excerpt}</p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={14} />
                  {formatDate(featuredPost.publishedAt)}
                </span>
                <Link href={`/news/${featuredPost.slug?.current ?? featuredPost._id}`} className="gg-btn gg-btn--primary gg-btn--sm" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  Read More <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Remaining News Grid */}
      {listPosts.length > 0 && (
        <section>
          <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 900, textTransform: 'uppercase', fontSize: '1.5rem', letterSpacing: '0.04em', color: 'var(--text)', marginBottom: '2rem' }}>
            Latest Feed
          </h2>
          <div className="gg-grid-3">
            {listPosts.map((post) => (
              <article key={post._id} className="gg-card news-card">
                <div className="news-img-wrap">
                  {post.coverImage?.asset?.url ? (
                    <img src={post.coverImage.asset.url} alt={post.title} className="news-img" />
                  ) : (
                    <div className="news-img-placeholder">GLO</div>
                  )}
                  {post.category && (
                    <span className="news-card-cat">{post.category}</span>
                  )}
                </div>
                <div className="news-card-body">
                  <span className="news-card-date">
                    <Calendar size={12} style={{ marginRight: '0.25rem' }} />
                    {formatDate(post.publishedAt)}
                  </span>
                  <h3 className="news-card-title">{post.title}</h3>
                  <p className="news-card-excerpt">{post.excerpt}</p>
                  <Link href={`/news/${post.slug?.current ?? post._id}`} className="news-card-link">
                    Read Post <ArrowRight size={14} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <style>{`
        .featured-post-card {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 0;
          overflow: hidden;
          padding: 0;
          min-height: 400px;
        }
        @media (max-width: 900px) {
          .featured-post-card {
            grid-template-columns: 1fr;
          }
        }
        .featured-img-wrap {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 300px;
          background: #000;
        }
        .featured-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .featured-img-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-sans);
          font-weight: 900;
          font-size: 3rem;
          color: rgba(255, 209, 0, 0.2);
          letter-spacing: 0.1em;
        }
        .featured-content {
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          background: var(--panel);
        }
        .featured-title {
          font-family: var(--font-sans);
          font-weight: 900;
          font-size: clamp(1.5rem, 3vw, 2.25rem);
          text-transform: uppercase;
          letter-spacing: 0.02em;
          color: var(--text);
          margin: 0 0 1rem;
          line-height: 1.2;
        }
        .featured-excerpt {
          font-size: 1.05rem;
          line-height: 1.6;
          color: var(--text-muted);
          margin-bottom: 2rem;
        }
        .news-cat-pill {
          display: inline-flex;
          align-items: center;
          font-size: 0.75rem;
          text-transform: uppercase;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 0.05em;
        }
        .news-card {
          display: flex;
          flex-direction: column;
          padding: 0;
          overflow: hidden;
          height: 100%;
          transition: transform 0.2s;
        }
        .news-card:hover {
          transform: translateY(-4px);
        }
        .news-img-wrap {
          position: relative;
          width: 100%;
          height: 200px;
          background: #000;
        }
        .news-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .news-img-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-sans);
          font-weight: 900;
          font-size: 2rem;
          color: rgba(255, 209, 0, 0.15);
          letter-spacing: 0.05em;
        }
        .news-card-cat {
          position: absolute;
          bottom: 1rem;
          left: 1rem;
          background: var(--bg);
          border: 1px solid var(--border);
          padding: 0.25rem 0.6rem;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--accent);
        }
        .news-card-body {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }
        .news-card-date {
          display: flex;
          align-items: center;
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-bottom: 0.75rem;
        }
        .news-card-title {
          font-family: var(--font-sans);
          font-weight: 700;
          font-size: 1.2rem;
          text-transform: uppercase;
          letter-spacing: 0.02em;
          color: var(--text);
          margin: 0 0 0.75rem;
          line-height: 1.3;
        }
        .news-card-excerpt {
          font-size: 0.9rem;
          line-height: 1.5;
          color: var(--text-muted);
          margin-bottom: 1.5rem;
          flex-grow: 1;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .news-card-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--accent);
          font-weight: 700;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          transition: transform 0.2s;
        }
        .news-card-link:hover {
          color: var(--text);
        }
      `}</style>
    </main>
  )
}
