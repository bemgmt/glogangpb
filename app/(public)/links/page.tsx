'use client'

import { Twitch, Instagram, Music, Youtube, Twitter, FileText, Mail } from 'lucide-react'

const LINKS = [
  {
    name: 'Official EPK',
    description: 'Biography, tour credits, press, audience proof, and downloadable PDF',
    url: '/epk',
    icon: FileText,
    color: '#39d126',
    glowColor: 'rgba(57, 209, 38, 0.35)',
  },
  {
    name: 'Booking & Management',
    description: 'Touring, hosting, media, and brand opportunities',
    url: 'mailto:contact@rainmgmts.com',
    icon: Mail,
    color: '#f5bd28',
    glowColor: 'rgba(245, 189, 40, 0.3)',
  },
  {
    name: 'Live on Twitch',
    description: 'Catch live sets, DJ mixes, and streams',
    url: 'https://www.twitch.tv/djmainodaplug',
    icon: Twitch,
    color: '#9146ff',
    glowColor: 'rgba(145, 70, 255, 0.4)',
  },
  {
    name: 'SoundCloud (48 Laws)',
    description: 'Listen to official mixtapes and tracks',
    url: 'https://soundcloud.com/48-laws',
    icon: Music,
    color: '#ff5500',
    glowColor: 'rgba(255, 85, 0, 0.4)',
  },
  {
    name: 'Instagram (@mainodaplug)',
    description: 'Behind-the-scenes content & announcements',
    url: 'https://www.instagram.com/mainodaplug/',
    icon: Instagram,
    color: '#e1306c',
    glowColor: 'rgba(225, 48, 108, 0.4)',
  },
  {
    name: 'YouTube Channel',
    description: 'Featured sets, vlogs, and music videos',
    url: 'https://www.youtube.com/@Djmainodaplug/featured',
    icon: Youtube,
    color: '#ff0000',
    glowColor: 'rgba(255, 0, 0, 0.4)',
  },
  {
    name: 'TikTok (@mainodaplug)',
    description: 'Short clips, mixes, and viral soundbites',
    url: 'https://www.tiktok.com/@mainodaplug',
    icon: Music,
    color: '#00f2fe',
    glowColor: 'rgba(0, 242, 254, 0.4)',
  },
  {
    name: 'Twitter / X (@mainodaplug)',
    description: 'Daily updates, thoughts & immediate alerts',
    url: 'https://x.com/mainodaplug',
    icon: Twitter,
    color: '#1da1f2',
    glowColor: 'rgba(29, 161, 242, 0.4)',
  },
]

export default function LinksPage() {
  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        background: 'var(--bg)',
        backgroundImage: 'url(/maino_bg.svg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 20px 60px',
        overflow: 'hidden',
      }}
    >
      {/* Glow effect at the top */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          width: '600px',
          height: '400px',
          background: 'radial-gradient(ellipse, rgba(57, 209, 38, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
        aria-hidden
      />

      <div
        style={{
          maxWidth: '560px',
          width: '100%',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Avatar/Icon Header */}
        <div style={{ marginBottom: 28 }} className="animate-fade-in">
          <div
            style={{
              width: 90,
              height: 90,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-red) 100%)',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 30px var(--glow-gold)',
              border: '2px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* Logo SVG */}
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#07080a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v8M18 10V6M6 10V6M12 18v4" />
              <rect x="5" y="10" width="14" height="8" rx="3" fill="#07080a" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1
          className="animate-fade-in delay-100"
          style={{
            fontSize: '2.5rem',
            fontWeight: 900,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            marginBottom: 8,
            color: 'var(--text)',
          }}
        >
          DJ MAINO
        </h1>
        <p
          className="animate-fade-in delay-200"
          style={{
            color: 'var(--text-muted)',
            fontSize: '1.05rem',
            marginBottom: 40,
            fontWeight: 500,
          }}
        >
          Booking, Glo Streams, music, press, and social updates.
        </p>

        {/* Link Items */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            width: '100%',
          }}
        >
          {LINKS.map((link, idx) => {
            const Icon = link.icon
            return (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`gg-card animate-fade-in delay-${Math.min((idx + 3) * 100, 600)}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 20,
                  padding: '18px 24px',
                  background: 'rgba(18, 21, 28, 0.75)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'left',
                  textDecoration: 'none',
                  transition: 'all 0.25s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.transform = 'translateY(-2px)'
                  el.style.borderColor = link.color
                  el.style.boxShadow = `0 10px 30px ${link.glowColor}`
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.transform = 'none'
                  el.style.borderColor = 'rgba(255, 255, 255, 0.05)'
                  el.style.boxShadow = 'none'
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255, 255, 255, 0.03)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: link.color,
                    flexShrink: 0,
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <Icon size={24} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: 800,
                      color: 'var(--text)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.02em',
                      margin: 0,
                    }}
                  >
                    {link.name}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                    {link.description}
                  </p>
                </div>
              </a>
            )
          })}
        </div>
      </div>
    </div>
  )
}
