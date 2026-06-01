import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Camera, Calendar, User, Star, ArrowRight, Lock, Key, Flame } from 'lucide-react'

export const metadata = {
  title: 'Dashboard | DJ Maino da Plug',
  description: 'Your DJ Maino VIP fan member dashboard and digital locker.',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Load profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, current_tier, subscription_status, role, lifetime_spend, drop_streak_count')
    .eq('id', user.id)
    .single()

  const { data: closetItems } = await supabase
    .from('digital_closet')
    .select('*')
    .eq('profile_id', user.id)
    .order('unlocked_at', { ascending: false })

  const displayName = profile?.display_name || user.email?.split('@')[0] || 'Fan'
  const tier = profile?.current_tier || 'the_block'
  const tierLabel = tier === 'glory_circle' ? 'Super Plug' : tier === 'frontline' ? 'Plug VIP' : 'Plug Fan'
  
  const tierColor = tier === 'glory_circle' ? 'var(--tier-glory-circle)' : tier === 'frontline' ? 'var(--tier-frontline)' : 'var(--tier-the-block)'
  const tierBg = tier === 'glory_circle' ? 'var(--tier-glory-circle-glow)' : tier === 'frontline' ? 'var(--tier-frontline-glow)' : 'var(--tier-the-block-glow)'

  const QUICK_LINKS = [
    {
      href: '/member/photobooth',
      icon: Camera,
      label: 'Photobooth',
      desc: 'Member exclusive filters',
    },
    {
      href: '/member/vault',
      icon: Lock,
      label: 'The Vault',
      desc: 'Super Plug Exclusive',
      locked: tier !== 'glory_circle' && profile?.role !== 'admin'
    },
    {
      href: '/member/early-access',
      icon: Key,
      label: 'Early Access',
      desc: 'Plug VIP & Super Plug',
      locked: tier === 'the_block' && profile?.role !== 'admin'
    },
    {
      href: '/member/membership',
      icon: Star,
      label: 'Membership',
      desc: 'Upgrade your access',
    },
  ]

  return (
    <div style={{ minHeight: '100vh', padding: '40px 0 80px' }}>
      <div className="gg-container">
        {/* Welcome & Gamified Passport */}
        <div className="animate-fade-in" style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}>
                  Welcome, {displayName}
                </h1>
              </div>
              <p>Your DJ Maino VIP member portal.</p>
            </div>
            
            {/* Gamified Passport Card */}
            <div style={{
              background: 'var(--panel)',
              border: `1px solid ${tierColor}`,
              boxShadow: `0 0 20px ${tierBg}`,
              padding: '20px 24px',
              borderRadius: 'var(--radius-lg)',
              minWidth: 280,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Security Clearance</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: tierColor, textTransform: 'uppercase' }}>{tierLabel}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 14 }}>Lifetime Spend:</span>
                <span style={{ fontSize: 14, fontWeight: 700 }}>${profile?.lifetime_spend || '0.00'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}><Flame size={14} color="var(--accent-red)"/> Drop Streak:</span>
                <span style={{ fontSize: 14, fontWeight: 700 }}>{profile?.drop_streak_count || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick links grid */}
        <div className="gg-grid-4 animate-fade-in delay-100" style={{ marginBottom: 48 }}>
          {QUICK_LINKS.map(({ href, icon: Icon, label, desc, locked }, i) => (
            <Link
              key={href}
              href={locked ? '/member/membership' : href}
              className={`gg-card transition-all duration-150 ${locked ? 'opacity-60' : 'hover:-translate-y-0.5 hover:border-[rgba(255,255,255,0.2)]'}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                textDecoration: 'none',
                position: 'relative',
              }}
            >
              {locked && <div style={{ position: 'absolute', top: 12, right: 12 }}><Lock size={14} color="var(--warn)" /></div>}
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'var(--surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Icon size={20} color="var(--text-muted)" />
              </div>
              <div>
                <p style={{ fontWeight: 900, fontSize: 15, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text)', marginBottom: 3 }}>
                  {label}
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Digital Closet */}
        <div className="animate-fade-in delay-200">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h2>Digital Closet</h2>
            {closetItems && closetItems.length > 0 && (
              <span className="gg-pill gg-pill--gold">
                {closetItems.length} Items Unlocked
              </span>
            )}
          </div>
          
          {(!closetItems || closetItems.length === 0) ? (
            <div className="gg-card" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
              <Lock size={32} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
              <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Your closet is empty</p>
              <p style={{ maxWidth: 400, margin: '0 auto' }}>Purchase mix passes and sound kits with your registered email to automatically unlock digital collectibles here.</p>
            </div>
          ) : (
            <div className="gg-grid-3">
              {closetItems.map((item: any) => (
                <div key={item.id} className="gg-card" style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                  {item.is_burned && (
                    <div style={{ position: 'absolute', top: 12, right: 12, background: 'var(--danger)', color: '#fff', fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase' }}>
                      BURNED
                    </div>
                  )}
                  <div style={{ height: 160, background: 'var(--surface)', borderRadius: 8, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.product_name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                    ) : (
                      <span style={{ fontSize: 40, opacity: 0.2 }}>👕</span>
                    )}
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase' }}>SKU: {item.sku_id}</p>
                  <p style={{ fontWeight: 800, fontSize: 16 }}>{item.product_name}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 'auto', paddingTop: 12 }}>
                    Unlocked: {new Date(item.unlocked_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
