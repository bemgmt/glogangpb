import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { ShieldCheck, Award, Zap, ArrowRight, CreditCard, Sparkles } from 'lucide-react'

export const metadata: Metadata = {
  title: 'My Membership | Maino da Plug',
  description: 'Manage your Maino da Plug membership tier and billing.',
}

export default async function MemberMembershipPage() {
  const supabase = await createClient()

  // 1. Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // 2. Fetch profile from DB
  const { data: profile } = await supabase
    .from('profiles')
    .select('membership_tier, membership_status')
    .eq('id', user.id)
    .single()

  const tier = profile?.membership_tier || 'free'
  const status = profile?.membership_status || 'active'

  const TIERS = [
    {
      id: 'free',
      name: 'Free Member',
      price: '$0/mo',
      perks: [
        'Community profile card',
        'Public artist directory search',
        'Standard event list RSVPs',
        'Community newsletter subscription',
      ],
      icon: <Award size={24} />,
      accent: false,
    },
    {
      id: 'glo-fan',
      name: 'Plug Fan',
      price: '$9.99/mo',
      perks: [
        'All Free membership features',
        'Access to member-only digital photobooth',
        'Early ticket presale access keys',
        'Special discord role & fan chatroom',
        'Monthly digital collectibles',
      ],
      icon: <Zap size={24} style={{ color: 'var(--accent)' }} />,
      accent: false,
    },
    {
      id: 'glogangvip',
      name: 'Super Plug',
      price: '$24.99/mo',
      perks: [
        'All Plug Fan membership features',
        'Special edition physical 48 Laws stickers',
        'Free entry to official listening parties',
        'Exclusive merch discounts (15% off)',
        'Quarterly physical collector bundles',
      ],
      icon: <Sparkles size={24} style={{ color: 'var(--accent)' }} />,
      accent: true,
    },
  ]

  return (
    <div className="gg-container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>
      {/* Header */}
      <header style={{ marginBottom: '3rem' }}>
        <p className="gg-pill gg-pill--gold" style={{ marginBottom: '0.75rem' }}>
          FAN TIERS
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: 'var(--text)',
            margin: 0,
          }}
        >
          Manage Membership
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.75rem', maxWidth: 560 }}>
          View your current subscription level or upgrade to unlock premium VIP content and digital photobooth capabilities.
        </p>
      </header>
 
      <hr className="gg-divider" style={{ marginBottom: '3rem' }} />

      {/* Current Status Banner */}
      <div className="gg-card current-tier-banner" style={{ marginBottom: '3.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div className="status-badge-icon">
            <ShieldCheck size={28} />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '0.05em', margin: 0 }}>
              Current Level
            </p>
            <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.02em', color: 'var(--accent)', margin: '0.2rem 0' }}>
              {tier === 'free' ? 'Free Fan' : tier === 'glo-fan' ? 'Plug Fan' : 'Super Plug'}
            </h2>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Status: <span style={{ color: status === 'active' ? '#2ecc71' : 'var(--accent)', fontWeight: 700, textTransform: 'uppercase' }}>{status}</span>
            </p>
          </div>
        </div>

        {tier !== 'free' && (
          <button className="gg-btn gg-btn--ghost gg-btn--sm" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CreditCard size={14} /> Manage Billing
          </button>
        )}
      </div>

      {/* Tiers Grid */}
      <div className="tier-cards-grid">
        {TIERS.map((t) => {
          const isCurrent = t.id === tier
          const canUpgrade = (tier === 'free' && t.id !== 'free') || (tier === 'glo-fan' && t.id === 'glogangvip')

          return (
            <div key={t.id} className={`gg-card tier-card ${t.accent ? 'tier-card--accent' : ''} ${isCurrent ? 'tier-card--current' : ''}`}>
              {isCurrent && (
                <span className="current-badge-label">Active Plan</span>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div className="tier-icon-box">{t.icon}</div>
                <div style={{ textAlign: 'right' }}>
                  <h3 className="tier-name">{t.name}</h3>
                  <p className="tier-price">{t.price}</p>
                </div>
              </div>

              <hr className="gg-divider" style={{ margin: '1.25rem 0' }} />

              <ul className="perks-list">
                {t.perks.map((perk, idx) => (
                  <li key={idx} className="perk-item">
                    <span className="perk-bullet">★</span>
                    {perk}
                  </li>
                ))}
              </ul>

              <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
                {isCurrent ? (
                  <button className="gg-btn gg-btn--ghost" style={{ width: '100%', pointerEvents: 'none', opacity: 0.6 }}>
                    Current Tier
                  </button>
                ) : canUpgrade ? (
                  <a
                    href={`/checkout?tier=${t.id}`}
                    className="gg-btn gg-btn--primary"
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  >
                    Upgrade Now <ArrowRight size={16} />
                  </a>
                ) : (
                  <button className="gg-btn gg-btn--ghost" style={{ width: '100%', pointerEvents: 'none', opacity: 0.4 }}>
                    Unavailable
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <style>{`
        .current-tier-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--panel);
          border: 1px solid var(--border);
          padding: 2rem;
          flex-wrap: wrap;
          gap: 1.5rem;
        }
        .status-badge-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          background: rgba(255, 209, 0, 0.1);
          color: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .tier-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
          align-items: stretch;
        }
        .tier-card {
          background: var(--panel);
          border: 1px solid var(--border);
          padding: 2.5rem 2rem;
          display: flex;
          flex-direction: column;
          position: relative;
        }
        .tier-card--accent {
          border-color: var(--accent);
          box-shadow: 0 8px 32px rgba(255, 209, 0, 0.05);
        }
        .tier-card--current {
          border-color: #2ecc71;
        }
        .current-badge-label {
          position: absolute;
          top: -12px;
          left: 2rem;
          background: #2ecc71;
          color: #fff;
          font-size: 0.7rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 0.35rem 0.75rem;
          border-radius: 4px;
        }
        .tier-icon-box {
          width: 48px;
          height: 48px;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .tier-name {
          font-family: var(--font-sans);
          font-weight: 900;
          font-size: 1.15rem;
          text-transform: uppercase;
          letter-spacing: 0.02em;
          color: var(--text);
          margin: 0;
        }
        .tier-price {
          font-family: var(--font-sans);
          font-size: 1.4rem;
          font-weight: 900;
          color: var(--accent);
          margin: 0.25rem 0 0;
        }
        .perks-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .perk-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          font-size: 0.875rem;
          color: var(--text-muted);
          line-height: 1.4;
        }
        .perk-bullet {
          color: var(--accent);
          font-size: 0.85rem;
          margin-top: 0.1rem;
        }
      `}</style>
    </div>
  )
}
