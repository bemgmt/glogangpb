import type { Metadata } from 'next'

// ---------------------------------------------------------------------------
// SEO
// ---------------------------------------------------------------------------
export const metadata: Metadata = {
  title: 'Membership | DJ Maino da Plug',
  description:
    'Join the DJ Maino da Plug VIP community. Unlock exclusive mix downloads, soundpacks, and early ticket access.',
  openGraph: {
    title: 'Membership | DJ Maino da Plug',
    description: 'Join the DJ Maino da Plug community with a Fan or VIP membership.',
  },
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Tier {
  id: string
  name: string
  price: string
  interval: string
  perks: string[]
  highlighted: boolean
  ctaLabel: string
  ctaHref: string
}

// ---------------------------------------------------------------------------
// Tier data (Sanity-driven in production; static here as scaffolding)
// ---------------------------------------------------------------------------
const TIERS: Tier[] = [
  {
    id: 'free',
    name: 'Plug Fan',
    price: '$0',
    interval: 'forever',
    highlighted: false,
    ctaLabel: 'Join Free',
    ctaHref: '/signup',
    perks: [
      'Community profile',
      'Public mix & stream schedules',
      'Monthly newsletter',
      'Community chat access',
    ],
  },
  {
    id: 'glo-fan',
    name: 'Plug VIP',
    price: '$9.99',
    interval: 'month',
    highlighted: false,
    ctaLabel: 'Become a VIP',
    ctaHref: '/signup?tier=glo-fan',
    perks: [
      'Everything in Free',
      'Exclusive mixtape audio feeds',
      'Early live show ticket access',
      'Digital photo booth access',
      'VIP Discord channels',
      'Monthly exclusive sound kit drops',
    ],
  },
  {
    id: 'glogangvip',
    name: 'Super Plug',
    price: '$24.99',
    interval: 'month',
    highlighted: true,
    ctaLabel: 'Go Super Plug',
    ctaHref: '/signup?tier=vip',
    perks: [
      'Everything in Plug VIP',
      'Stream guest & chat badges',
      'Exclusive digital audio tokens',
      'Priority booking support',
      'Direct messaging with DJ Maino',
      'Mixtape shout-outs & mentions',
    ],
  },
]

// ---------------------------------------------------------------------------
// Check Icon
// ---------------------------------------------------------------------------
function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '1px' }}
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Tier Card
// ---------------------------------------------------------------------------
function TierCard({ tier }: { tier: Tier }) {
  return (
    <div
      className={`gg-card tier-card ${tier.highlighted ? 'tier-card--highlighted' : ''}`}
      id={`tier-${tier.id}`}
    >
      {tier.highlighted && (
        <div className="tier-card__popular-badge">MOST POPULAR</div>
      )}

      <div className="tier-card__header">
        <h2 className="tier-card__name">{tier.name}</h2>
        <div className="tier-card__price">
          <span className="tier-card__price-amount">{tier.price}</span>
          {tier.price !== '$0' && (
            <span className="tier-card__price-interval">/{tier.interval}</span>
          )}
        </div>
      </div>

      <hr className="gg-divider" style={{ margin: '1.25rem 0' }} />

      <ul className="tier-card__perks">
        {tier.perks.map((perk) => (
          <li key={perk} className="tier-card__perk">
            <CheckIcon />
            <span>{perk}</span>
          </li>
        ))}
      </ul>

      <a
        href={tier.ctaHref}
        className={`gg-btn ${tier.highlighted ? 'gg-btn--primary' : 'gg-btn--ghost'} tier-card__cta`}
        id={`cta-${tier.id}`}
      >
        {tier.ctaLabel}
      </a>

      {tier.price !== '$0' && (
        <p className="tier-card__stripe-note">
          Secure billing via Stripe. Cancel anytime.
        </p>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function MembershipPage() {
  return (
    <main className="gg-container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>
      {/* Header */}
      <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <p className="gg-pill gg-pill--gold" style={{ marginBottom: '0.75rem' }}>
          MEMBERSHIP
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
          Join The Plug VIP
        </h1>
        <p
          style={{
            color: 'var(--text-muted)',
            marginTop: '0.875rem',
            maxWidth: 560,
            margin: '0.875rem auto 0',
            lineHeight: 1.6,
          }}
        >
          Pick your tier. Get closer to the sounds. Exclusive audio downloads, sound kits, and real community.
        </p>
      </header>

      {/* Tier cards */}
      <div className="gg-grid-3 membership-grid">
        {TIERS.map((tier) => (
          <TierCard key={tier.id} tier={tier} />
        ))}
      </div>

      {/* FAQ / fine print */}
      <section style={{ maxWidth: 640, margin: '4rem auto 0', textAlign: 'center' }}>
        <h3
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 700,
            fontSize: '1rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--text)',
            marginBottom: '1rem',
          }}
        >
          Questions?
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7 }}>
          All paid tiers are billed monthly through Stripe. You can cancel at
          any time from your member dashboard. Perks take effect immediately
          after payment. For support, use the{' '}
          <a href="/contact" style={{ color: 'var(--accent)' }}>
            Contact
          </a>{' '}
          page.
        </p>
      </section>

      <style>{`
        .membership-grid {
          align-items: stretch;
        }
        .tier-card {
          display: flex;
          flex-direction: column;
          padding: 2rem 1.75rem;
          position: relative;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .tier-card:hover {
          transform: translateY(-4px);
        }
        .tier-card--highlighted {
          border-color: var(--accent) !important;
          box-shadow: 0 0 0 1px var(--accent), 0 8px 40px rgba(255,193,7,0.15);
        }
        .tier-card--highlighted:hover {
          box-shadow: 0 0 0 1px var(--accent), 0 16px 56px rgba(255,193,7,0.22);
        }
        .tier-card__popular-badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--accent);
          color: #000;
          font-family: var(--font-sans);
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 0.12em;
          padding: 0.2rem 0.85rem;
          border-radius: 999px;
          white-space: nowrap;
        }
        .tier-card__header {
          margin-bottom: 0;
        }
        .tier-card__name {
          font-family: var(--font-sans);
          font-size: 1.25rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text);
          margin: 0 0 0.5rem;
        }
        .tier-card__price {
          display: flex;
          align-items: baseline;
          gap: 0.25rem;
        }
        .tier-card__price-amount {
          font-family: var(--font-sans);
          font-size: 2.25rem;
          font-weight: 900;
          color: var(--text);
          line-height: 1;
        }
        .tier-card__price-interval {
          font-size: 0.875rem;
          color: var(--text-muted);
        }
        .tier-card__perks {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          flex: 1;
        }
        .tier-card__perk {
          display: flex;
          align-items: flex-start;
          gap: 0.6rem;
          font-size: 0.9rem;
          color: var(--text-muted);
          line-height: 1.4;
        }
        .tier-card__cta {
          display: block;
          text-align: center;
          margin-top: 1.75rem;
          width: 100%;
        }
        .tier-card__stripe-note {
          font-size: 0.7rem;
          color: var(--text-muted);
          text-align: center;
          margin: 0.5rem 0 0;
        }
      `}</style>
    </main>
  )
}
