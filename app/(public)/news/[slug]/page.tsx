import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from 'next-sanity'
import Link from 'next/link'
import { Calendar, Tag, ArrowLeft } from 'lucide-react'
import { PortableText } from '@portabletext/react'

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
  body?: any[] // Portable Text blocks
  content?: string // Mock content fallback
}

const PLACEHOLDER_POSTS: Record<string, NewsPost> = {
  np1: {
    _id: 'np1',
    title: 'Chief Keef Announces Almighty So 2 Tour Dates',
    publishedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    category: 'tour',
    excerpt: 'The Glo Gang frontman is taking the highly anticipated Almighty So 2 on the road.',
    content: `Chief Keef has officially announced a massive nationwide tour in support of his legendary album, Almighty So 2. The tour is slated to kick off next month, visiting major cities including Chicago, Los Angeles, New York, Atlanta, and Houston.

Glo Gang affiliates Tadoe and Ballout are confirmed to join the tour as special guest openers, promising an unforgettable high-energy experience.

Tickets will be available for general public purchase starting this Friday. However, verified Glo Gang Community Portal members holding a "Glo Fan" or "GloGang VIP" tier status will receive an exclusive early pre-sale access code via their Member Dashboard 24 hours prior to general release.`,
  },
  np2: {
    _id: 'np2',
    title: 'New Drop: Glo Gang x Glory Boyz Premium Hoodies',
    publishedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    category: 'community',
    excerpt: 'Featuring embroidered star logos and premium heavyweight cotton, the latest drops are available now.',
    content: `Glo Gang Worldwide is proud to present the latest streetwear collaboration featuring our signature Glo Star and classic Glory Boyz branding. This drop showcases high-density embroidery, custom cut-and-sew heavyweight cotton fleece, and a premium streetwear oversized fit.

Each piece is designed to withstand the elements while bringing the authentic Glo aesthetic to your everyday style.

Available in Gold, Pitch Black, and Crimson Red. The collection is now live on our official merchandise store. VIP members can access an exclusive 15% discount code under their profile page.`,
  },
  np3: {
    _id: 'np3',
    title: 'Tadoe Releases New Album "Glory To Drill"',
    publishedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    category: 'release',
    excerpt: 'Tadoe delivers 14 tracks of pure drill energy.',
    content: `Tadoe's new album "Glory To Drill" has finally hit streaming services. Jam-packed with aggressive beats and heavy lyricism, the album serves as Tadoe's declaration of drill dominance.

The record features standout production from classic drill sound-architects like Young Chop and DP Beats, alongside powerful verses from Chief Keef, Ballout, and several special guest appearances.

Stream "Glory To Drill" now on Spotify, Apple Music, and YouTube Music. Physical vinyl and CD releases will be shipped exclusively to VIP level members in next month's drop bundle.`,
  },
  np4: {
    _id: 'np4',
    title: 'Inside the Glo Gang Physical Photobooth Experience',
    publishedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    category: 'general',
    excerpt: 'Learn more about the state-of-the-art interactive photobooth setup in our flagship store.',
    content: `Our physical store in Los Angeles has officially unveiled its brand-new custom interactive photobooth. The booth lets fans step in and snap high-resolution captures using the exclusive Glo Gang overlays and 3D digital face filters.

Step inside and choose from classic sticker graphics, the iconic Glo Sun, and futuristic elements.

Once captured, you can print a high-quality physical copy or use the touchscreen to instantly send the digital copy to your phone via SMS or Email. Members can also sign in to their portal account directly inside the booth to automatically save photos to their Supabase Storage portfolio!`,
  },
}

const SLUG_TO_PLACEHOLDER: Record<string, string> = {
  'chief-keef-announces-almighty-so-2-tour-dates': 'np1',
  'new-drop-glo-gang-x-glory-boyz-premium-hoodies': 'np2',
  'tadoe-releases-new-album-glory-to-drill': 'np3',
  'inside-the-glo-gang-physical-photobooth-experience': 'np4',
}

// ---------------------------------------------------------------------------
// Data Fetching
// ---------------------------------------------------------------------------
async function getPost(slug: string): Promise<NewsPost | null> {
  const placeholderKey = SLUG_TO_PLACEHOLDER[slug] || slug
  if (PLACEHOLDER_POSTS[placeholderKey]) {
    return PLACEHOLDER_POSTS[placeholderKey]
  }

  try {
    const query = `*[_type == "newsPost" && (slug.current == $slug || _id == $slug)][0] {
      _id, title, publishedAt, category, excerpt, slug,
      coverImage { asset->{ url } },
      body
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
  const post = await getPost(slug)
  if (!post) return { title: 'Post Not Found | Glo Gang' }

  return {
    title: `${post.title} | News | Glo Gang Worldwide`,
    description: post.excerpt || `Read the latest news on Glo Gang.`,
  }
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------
export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) {
    notFound()
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <main className="gg-container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>
      {/* Back Button */}
      <Link href="/news" className="gg-btn gg-btn--ghost gg-btn--sm" style={{ marginBottom: '2rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
        <ArrowLeft size={16} />
        Back To News
      </Link>

      <article className="post-article">
        {/* Meta & Title */}
        <header className="post-header">
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.25rem' }}>
            {post.category && (
              <span className="gg-pill gg-pill--gold" style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase' }}>
                {post.category}
              </span>
            )}
            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Calendar size={14} />
              {formatDate(post.publishedAt)}
            </span>
          </div>

          <h1 className="post-main-title">{post.title}</h1>

          {post.excerpt && <p className="post-lead-excerpt">{post.excerpt}</p>}
        </header>

        {/* Cover Image */}
        <div className="post-cover-wrap gg-card">
          {post.coverImage?.asset?.url ? (
            <img src={post.coverImage.asset.url} alt={post.title} className="post-cover-img" />
          ) : (
            <div className="post-cover-placeholder">GLO GANG WORLDWIDE</div>
          )}
        </div>

        {/* Article Body */}
        <div className="post-body-content">
          {post.body ? (
            <PortableText
              value={post.body}
              components={{
                block: {
                  normal: ({ children }) => <p style={{ marginBottom: '1.5rem', fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--text-muted)' }}>{children}</p>,
                  h2: ({ children }) => <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: '1.75rem', textTransform: 'uppercase', color: 'var(--text)', marginTop: '2.5rem', marginBottom: '1.25rem', letterSpacing: '0.02em' }}>{children}</h2>,
                  h3: ({ children }) => <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: '1.4rem', textTransform: 'uppercase', color: 'var(--accent)', marginTop: '2rem', marginBottom: '1rem', letterSpacing: '0.02em' }}>{children}</h3>,
                  blockquote: ({ children }) => (
                    <blockquote style={{ borderLeft: '4px solid var(--accent)', paddingLeft: '1.5rem', margin: '2rem 0', fontStyle: 'italic', color: 'var(--text)', fontSize: '1.2rem', lineHeight: '1.6' }}>
                      {children}
                    </blockquote>
                  ),
                },
                marks: {
                  strong: ({ children }) => <strong style={{ color: 'var(--text)', fontWeight: 700 }}>{children}</strong>,
                  em: ({ children }) => <em style={{ fontStyle: 'italic' }}>{children}</em>,
                },
              }}
            />
          ) : (
            // Mock Text Fallback (split by double newline to form paragraphs)
            post.content?.split('\n\n').map((para, i) => (
              <p key={i} style={{ marginBottom: '1.5rem', fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--text-muted)' }}>
                {para}
              </p>
            ))
          )}
        </div>
      </article>

      <style>{`
        .post-article {
          max-width: 800px;
          margin: 0 auto;
        }
        .post-header {
          margin-bottom: 2.5rem;
        }
        .post-main-title {
          font-family: var(--font-sans);
          font-size: clamp(2.25rem, 5vw, 3.75rem);
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.02em;
          color: var(--text);
          margin: 0 0 1.25rem;
          line-height: 1.15;
        }
        .post-lead-excerpt {
          font-size: 1.25rem;
          line-height: 1.6;
          color: var(--text);
          font-weight: 500;
          margin: 0;
          border-left: 2px solid var(--border);
          padding-left: 1.25rem;
        }
        .post-cover-wrap {
          position: relative;
          width: 100%;
          height: 450px;
          overflow: hidden;
          margin-bottom: 3.5rem;
          padding: 0;
          border: 1px solid var(--border);
        }
        @media (max-width: 768px) {
          .post-cover-wrap {
            height: 300px;
          }
        }
        .post-cover-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .post-cover-placeholder {
          width: 100%;
          height: 100%;
          background: var(--panel);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-sans);
          font-weight: 900;
          font-size: 2.5rem;
          color: rgba(255, 209, 0, 0.15);
          letter-spacing: 0.05em;
        }
        .post-body-content {
          margin-top: 2rem;
        }
      `}</style>
    </main>
  )
}
