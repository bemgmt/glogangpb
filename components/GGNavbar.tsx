'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Menu, X, Camera, Music, Calendar, Radio, FileText, UserRound, LogIn } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

const NAV_LINKS = [
  { href: '/#glo-streams', label: 'Glo Streams', icon: Radio },
  { href: '/events',       label: 'Live',        icon: Calendar },
  { href: '/artists',      label: 'Artists',     icon: Music },
  { href: '/epk',          label: 'EPK',         icon: FileText },
  { href: '/about',        label: 'About',       icon: UserRound },
]

export function GGNavbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [supabase] = useState(createClient)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user ?? null)
    )
    return () => subscription.unsubscribe()
  }, [supabase])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Skip navbar on kiosk routes — they're standalone
  if (pathname.startsWith('/kiosk')) return null

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: scrolled
            ? 'rgba(15, 17, 21, 0.96)'
            : 'rgba(15, 17, 21, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border)',
          transition: 'background 0.2s ease',
        }}
      >
        <div className="gg-container nav-shell" style={{ display: 'flex', alignItems: 'center', gap: 16, height: 64 }}>
          {/* Logo */}
          <Link
            href="/"
            className="nav-brand"
            style={{
              fontWeight: 900,
              fontSize: '1.15rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--text)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flexShrink: 0,
            }}
          >
            {/* Custom Plug Logo SVG */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent)', flexShrink: 0 }}>
              <path d="M12 2v8M18 10V6M6 10V6M12 18v4" />
              <rect x="5" y="10" width="14" height="8" rx="3" fill="var(--accent)" />
            </svg>
            <span>MAINO DA PLUG</span>
          </Link>

          {/* Desktop nav */}
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              flex: 1,
              marginLeft: 24,
            }}
            className="nav-desktop"
          >
            {NAV_LINKS.map(({ href, label }) => {
              const basePath = href.split('#')[0]
              const active = !href.includes('#') && (pathname === basePath || pathname.startsWith(basePath + '/'))
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 700,
                    fontSize: 13,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    color: active ? 'var(--accent)' : 'var(--text-muted)',
                    background: active ? 'rgba(57,209,38,0.10)' : 'transparent',
                    transition: 'color 0.15s, background 0.15s',
                  }}
                  onMouseEnter={e => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.color = 'var(--text)'
                      ;(e.currentTarget as HTMLElement).style.background = 'var(--surface)'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'
                      ;(e.currentTarget as HTMLElement).style.background = 'transparent'
                    }
                  }}
                >
                  {label}
                </Link>
              )
            })}

          </nav>

          {/* Right side */}
          <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto', flexShrink: 0 }}>
            {user ? (
              <>
                <Link
                  href="/member/photobooth"
                  aria-label="Photobooth"
                  className="gg-btn gg-btn--ghost gg-btn--sm"
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Camera size={14} />
                  <span className="nav-desktop-label">Booth</span>
                </Link>
                <Link href="/member/dashboard" className="gg-btn gg-btn--primary gg-btn--sm">
                  Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" aria-label="Log in" className="gg-btn gg-btn--ghost gg-btn--sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <LogIn size={14} />
                  <span className="nav-desktop-label">Log In</span>
                </Link>
                <Link href="/register" className="gg-btn gg-btn--primary gg-btn--sm">
                  Join
                </Link>
              </>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setOpen(o => !o)}
              className="gg-btn gg-btn--ghost gg-btn--sm nav-mobile-btn"
              aria-label="Toggle menu"
              aria-expanded={open}
              style={{ padding: '8px' }}
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div
            style={{
              borderTop: '1px solid var(--border)',
              background: 'rgba(15, 17, 21, 0.98)',
              padding: '12px 20px 20px',
            }}
          >
            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const basePath = href.split('#')[0]
              const active = !href.includes('#') && pathname === basePath
              return (
                <Link
                  key={href}
                  href={href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '13px 0',
                    borderBottom: '1px solid var(--border)',
                    fontWeight: 800,
                    fontSize: 15,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    color: active ? 'var(--accent)' : 'var(--text)',
                  }}
                >
                  <Icon size={16} style={{ color: active ? 'var(--accent)' : 'var(--text-muted)' }} />
                  {label}
                </Link>
              )
            })}
          </div>
        )}
      </header>

      {/* Responsive helpers */}
      <style>{`
        .nav-desktop { }
        .nav-mobile-btn { display: none; }
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-btn { display: flex !important; }
          .nav-desktop-label { display: none; }
        }
        @media (max-width: 480px) {
          .nav-shell {
            gap: 8px !important;
            padding-left: 12px !important;
            padding-right: 12px !important;
          }
          .nav-brand {
            font-size: 0.88rem !important;
            letter-spacing: 0.06em !important;
            gap: 4px !important;
          }
          .nav-brand svg {
            width: 20px;
            height: 20px;
          }
          .nav-actions { gap: 6px !important; }
        }
      `}</style>
    </>
  )
}
