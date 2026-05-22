'use client'

import Link from 'next/link'
import { Instagram, Twitter, Youtube } from 'lucide-react'

const FOOTER_LINKS = [
  {
    heading: 'Explore',
    links: [
      { label: 'Artists',    href: '/artists' },
      { label: 'Events',     href: '/events' },
      { label: 'News',       href: '/news' },
      { label: 'Membership', href: '/membership' },
    ],
  },
  {
    heading: 'Account',
    links: [
      { label: 'Join',       href: '/register' },
      { label: 'Log In',     href: '/login' },
      { label: 'Dashboard',  href: '/member/dashboard' },
      { label: 'Photobooth', href: '/member/photobooth' },
    ],
  },
  {
    heading: 'Label',
    links: [
      { label: 'About',      href: '/about' },
      { label: 'Merch Store', href: process.env.NEXT_PUBLIC_SHOPIFY_STORE_URL || '#', external: true },
      { label: 'Contact',    href: '/contact' },
    ],
  },
]

const SOCIAL = [
  { label: 'Instagram', href: 'https://www.instagram.com/glogang', Icon: Instagram },
  { label: 'Twitter',   href: 'https://twitter.com/glogang',       Icon: Twitter },
  { label: 'YouTube',   href: 'https://youtube.com/@glogang',      Icon: Youtube },
]

export function GGFooter() {
  return (
    <footer
      style={{
        background: 'var(--bg-alt)',
        borderTop: '1px solid var(--border)',
        padding: '56px 0 32px',
        marginTop: 80,
      }}
    >
      <div className="gg-container">
        {/* Top row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr repeat(3, auto)',
            gap: 40,
            alignItems: 'start',
            marginBottom: 48,
          }}
          className="footer-grid"
        >
          {/* Brand */}
          <div>
            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                fontWeight: 900,
                fontSize: '1.4rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--text)',
                marginBottom: 12,
              }}
            >
              <span style={{
                display: 'inline-block',
                width: 32,
                height: 32,
                background: 'var(--accent)',
                borderRadius: 8,
                flexShrink: 0,
              }} />
              GLO GANG
            </Link>
            <p style={{ fontSize: 14, maxWidth: 260, lineHeight: 1.7 }}>
              The official fan community portal for Glo Gang Worldwide — Chief Keef's label.
            </p>

            {/* Social */}
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              {SOCIAL.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-muted)',
                    transition: 'background 0.15s, color 0.15s, border-color 0.15s',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.background = 'var(--accent)'
                    el.style.color = 'var(--ink)'
                    el.style.borderColor = 'transparent'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.background = 'var(--surface)'
                    el.style.color = 'var(--text-muted)'
                    el.style.borderColor = 'var(--border)'
                  }}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {FOOTER_LINKS.map(({ heading, links }) => (
            <div key={heading}>
              <p style={{
                fontWeight: 900,
                fontSize: 11,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                marginBottom: 16,
              }}>
                {heading}
              </p>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {links.map(({ label, href, external }) => (
                  <li key={label}>
                    {external ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 600, transition: 'color 0.15s' }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-red)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                      >
                        {label} ↗
                      </a>
                    ) : (
                      <Link
                        href={href}
                        style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 600, transition: 'color 0.15s' }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-red)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                      >
                        {label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: '1px solid var(--border)',
            paddingTop: 24,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <p style={{ fontSize: 12, color: 'var(--text-faint)' }}>
            © {new Date().getFullYear()} Glo Gang Worldwide. All rights reserved.
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-faint)' }}>
            Built for the Glo
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .footer-grid > :first-child {
            grid-column: 1 / -1;
          }
        }
        @media (max-width: 480px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  )
}
