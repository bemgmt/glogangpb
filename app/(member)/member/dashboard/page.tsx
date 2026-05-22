import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Camera, Calendar, User, Star, ArrowRight } from 'lucide-react'

export const metadata = {
  title: 'Dashboard',
  description: 'Your Glo Gang fan member dashboard.',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Load profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, membership_tier, membership_status, role')
    .eq('id', user.id)
    .single()

  const displayName = profile?.display_name || user.email?.split('@')[0] || 'Fan'
  const tier = profile?.membership_tier || 'free'
  const tierLabel = tier === 'vip' ? 'GloGang VIP' : tier === 'fan' ? 'Glo Fan' : 'Free'

  const QUICK_LINKS = [
    {
      href: '/member/photobooth',
      icon: Camera,
      label: 'Photobooth',
      desc: 'Strike a pose with Glo Gang filters',
      accent: 'gold',
    },
    {
      href: '/member/events',
      icon: Calendar,
      label: 'Events',
      desc: 'Browse shows & RSVP',
      accent: 'red',
    },
    {
      href: '/member/profile',
      icon: User,
      label: 'Profile',
      desc: 'Edit your fan profile',
      accent: 'neutral',
    },
    {
      href: '/member/membership',
      icon: Star,
      label: 'Membership',
      desc: 'Upgrade your tier',
      accent: 'gold',
    },
  ]

  return (
    <div style={{ minHeight: '100vh', padding: '40px 0 80px' }}>
      <div className="gg-container">
        {/* Welcome */}
        <div
          className="animate-fade-in"
          style={{ marginBottom: 40 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}>
              Welcome, {displayName}
            </h1>
            <span className={`gg-pill ${tier !== 'free' ? 'gg-pill--gold' : ''}`}>
              {tierLabel}
            </span>
          </div>
          <p>Your Glo Gang fan portal. What are you doing today?</p>
        </div>

        {/* Quick links grid */}
        <div className="gg-grid-2 animate-fade-in delay-100" style={{ marginBottom: 48 }}>
          {QUICK_LINKS.map(({ href, icon: Icon, label, desc, accent }, i) => (
            <Link
              key={href}
              href={href}
              className={`gg-card transition-all duration-150 hover:-translate-y-0.5 ${
                accent === 'gold' 
                  ? 'border-[rgba(255,209,0,0.15)] hover:border-[rgba(255,209,0,0.35)]' 
                  : 'border-[var(--border)] hover:border-[rgba(225,38,38,0.35)]'
              }`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                textDecoration: 'none',
              }}
            >
              <div style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: accent === 'gold'
                  ? 'rgba(255,209,0,0.12)'
                  : accent === 'red'
                    ? 'rgba(225,38,38,0.12)'
                    : 'var(--surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon
                  size={22}
                  color={accent === 'gold' ? 'var(--accent)' : accent === 'red' ? '#f87171' : 'var(--text-muted)'}
                />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 900, fontSize: 15, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text)', marginBottom: 3 }}>
                  {label}
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{desc}</p>
              </div>
              <ArrowRight size={16} color="var(--text-faint)" />
            </Link>
          ))}
        </div>

        {/* Photobooth featured card */}
        <div
          className="gg-card gg-card--accent animate-fade-in delay-200"
          style={{
            background: 'linear-gradient(135deg, rgba(255,209,0,0.07), rgba(225,38,38,0.04))',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44,
              height: 44,
              background: 'var(--accent)',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Camera size={20} color="var(--ink)" />
            </div>
            <div>
              <p style={{ fontWeight: 900, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text)' }}>
                Glo Gang Photobooth
              </p>
              <p style={{ fontSize: 13 }}>9 overlay frames · 6 props · 3D face filters</p>
            </div>
          </div>
          <Link href="/member/photobooth" className="gg-btn gg-btn--primary">
            Open Photobooth
            <Camera size={15} />
          </Link>
        </div>
      </div>
    </div>
  )
}
