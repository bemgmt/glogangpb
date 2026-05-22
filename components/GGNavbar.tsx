'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Menu, X, Camera, Music, Calendar, Newspaper, Star, LogIn } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const NAV_LINKS = [
  { href: '/artists',    label: 'Artists',    icon: Music },
  { href: '/events',     label: 'Events',     icon: Calendar },
  { href: '/news',       label: 'News',       icon: Newspaper },
  { href: '/membership', label: 'Membership', icon: Star },
]

export function GGNavbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

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

  // Close mobile menu on route change
  useEffect(() => { setOpen(false) }, [pathname])

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
        <div className="gg-container" style={{ display: 'flex', alignItems: 'center', gap: 16, height: 64 }}>
          {/* Logo */}
          <Link
            href="/"
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
            <span style={{
              display: 'inline-block',
              width: 28,
              height: 28,
              background: 'var(--accent)',
              borderRadius: 6,
              flexShrink: 0,
            }} />
            <span>GLO GANG</span>
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
              const active = pathname === href || pathname.startsWith(href + '/')
              return (
                <Link
                  key={href}
                  href={href}
                  style={{
                    padding: '7px 14px',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 700,
                    fontSize: 13,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    color: active ? 'var(--accent)' : 'var(--text-muted)',
                    background: active ? 'rgba(255,209,0,0.10)' : 'transparent',
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

            {/* Merch — external */}
            <a
              href={process.env.NEXT_PUBLIC_SHOPIFY_STORE_URL || '#'}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '7px 14px',
                borderRadius: 'var(--radius-md)',
                fontWeight: 700,
                fontSize: 13,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                transition: 'color 0.15s, background 0.15s',
              }}
            >
              Merch ↗
            </a>
          </nav>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto', flexShrink: 0 }}>
            {user ? (
              <>
                <Link
                  href="/member/photobooth"
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
                <Link href="/login" className="gg-btn gg-btn--ghost gg-btn--sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
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
            {[...NAV_LINKS, { href: '/merch', label: 'Merch', icon: Star }].map(({ href, label, icon: Icon }) => {
              const active = pathname === href
              const isExternal = label === 'Merch'
              const Comp = isExternal ? 'a' : Link
              const extraProps = isExternal
                ? { href: process.env.NEXT_PUBLIC_SHOPIFY_STORE_URL || '#', target: '_blank', rel: 'noopener noreferrer' }
                : { href }
              return (
                <Comp
                  key={href}
                  {...(extraProps as any)}
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
                </Comp>
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
      `}</style>
    </>
  )
}
