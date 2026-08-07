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
    title: 'DJ Maino Announces New Twitch Stream Calendar',
    publishedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    category: 'stream',
    excerpt: 'DJ Maino is taking his sets live on Twitch and announcing his weekly broadcast schedules.',
    content: `DJ Maino has officially announced a massive Twitch broadcasting calendar. The streams are slated to start next week, visiting virtual rooms and clubs with guest appearances and community giveaways.

Mixtape collaborators and guests will join the streams, promising an unforgettable high-energy experience.
    
Verified DJ Maino VIP Portal members holding a "Plug VIP" or "Super Plug" tier status will receive exclusive track lists and sound files.`,
  },
  np2: {
    _id: 'np2',
    title: 'New Drop: 48 Laws Premium Sample & Drum Kit',
    publishedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    category: 'release',
    excerpt: 'Featuring custom drums, processed loops, and high-fidelity sound presets, the latest kit is available now.',
    content: `DJ Maino da Plug is proud to present the latest drum kit and loop pack featuring his signature sounds. This drop showcases high-density WAV files, custom-built drum loops, and synth presets.
    
Each sample is designed to punch through your mix and bring the authentic DJ Maino energy to your productions.
    
Available for download now. The collection is live in our VIP portal. VIP members can access an exclusive download code under their profile page.`,
  },
  np3: {
    _id: 'np3',
    title: 'DJ Maino Releases New Mix "48 Laws of Power Vol. 8"',
    publishedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    category: 'release',
    excerpt: 'DJ Maino drops a brand new 60-minute high-energy mix.',
    content: `DJ Maino's new mix "48 Laws of Power Vol. 8" has finally hit SoundCloud and Twitch. Jam-packed with high energy, heavy basslines, and exclusive edits, the mix serves as a testament to his curation.
    
The mix features standout edits from electronic and hip-hop producers, alongside exclusive verses.
    
Stream the mix now on SoundCloud. Digital sound packs are shipped to VIP members in next month's drop bundle.`,
  },
  np4: {
    _id: 'np4',
    title: 'Inside the DJ Maino Member Photobooth',
    publishedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    category: 'general',
    excerpt: 'Learn how to use the member dashboard photobooth with custom overlays.',
    content: `Our online VIP member portal has officially unveiled its brand-new custom interactive photobooth. The booth lets fans step in and snap high-resolution captures using the exclusive DJ Maino overlays and custom props.
    
Step inside and choose from classic sticker graphics, headphones, and neon elements.
    
Once captured, you can download a high-quality copy or share it directly. Members can also sign in to their portal account directly inside the booth to automatically save photos to their gallery!`,
  },
}

const SLUG_TO_PLACEHOLDER: Record<string, string> = {
  'dj-maino-announces-new-twitch-stream-calendar': 'np1',
  'new-drop-48-laws-premium-sample-drum-kit': 'np2',
  'dj-maino-releases-new-mix-48-laws-of-power-vol-8': 'np3',
  'inside-the-dj-maino-member-photobooth': 'np4',
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
  if (!post) return { title: 'Post Not Found | DJ Maino' }

  return {
    title: `${post.title} | News | DJ Maino da Plug`,
    description: post.excerpt || `Read the latest news from DJ Maino.`,
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
    <div className="gg-container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>
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
            <div className="post-cover-placeholder">MAINO WORLDWIDE</div>
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
    </div>
  )
}
