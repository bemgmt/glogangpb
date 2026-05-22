import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Admin Dashboard | Glo Gang Worldwide',
  description: 'Glo Gang admin control panel.',
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
async function getStats(supabase: Awaited<ReturnType<typeof createClient>>) {
  const [
    { count: totalMembers },
    { count: activeMembers },
    { data: recentSignups },
    { count: pendingRequests },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('membership_status', 'active'),
    supabase
      .from('profiles')
      .select('id, display_name, email, membership_tier, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('member_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),
  ])

  return {
    totalMembers: totalMembers ?? 0,
    activeMembers: activeMembers ?? 0,
    recentSignups: recentSignups ?? [],
    pendingRequests: pendingRequests ?? 0,
  }
}

// ---------------------------------------------------------------------------
// Stat Card
// ---------------------------------------------------------------------------
function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string
  value: number | string
  icon: React.ReactNode
  accent?: boolean
}) {
  return (
    <div className={`gg-card stat-card ${accent ? 'stat-card--accent' : ''}`}>
      <div className="stat-card__icon">{icon}</div>
      <div className="stat-card__content">
        <span className="stat-card__value">{value}</span>
        <span className="stat-card__label">{label}</span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Quick Action Link
// ---------------------------------------------------------------------------
function QuickAction({
  href,
  label,
  description,
}: {
  href: string
  label: string
  description: string
}) {
  return (
    <Link href={href} className="gg-card quick-action">
      <span className="quick-action__label">{label}</span>
      <span className="quick-action__desc">{description}</span>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="quick-action__arrow"
        aria-hidden="true"
      >
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    </Link>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default async function AdminPage() {
  const supabase = await createClient()
  const { totalMembers, activeMembers, recentSignups, pendingRequests } =
    await getStats(supabase)

  return (
    <div>
      {/* Header */}
      <header style={{ marginBottom: '2rem' }}>
        <p className="gg-pill gg-pill--gold" style={{ marginBottom: '0.5rem' }}>
          ADMIN
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '2rem',
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: 'var(--text)',
            margin: 0,
          }}
        >
          Dashboard
        </h1>
      </header>

      {/* Stats */}
      <div className="gg-grid-3" style={{ marginBottom: '2.5rem' }}>
        <StatCard
          label="Total Members"
          value={totalMembers.toLocaleString()}
          accent
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
        />
        <StatCard
          label="Active Members"
          value={activeMembers.toLocaleString()}
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          }
        />
        <StatCard
          label="Pending Requests"
          value={pendingRequests.toLocaleString()}
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          }
        />
      </div>

      <div className="gg-grid-2" style={{ gap: '2rem', alignItems: 'start' }}>
        {/* Recent Signups */}
        <section>
          <h2 className="admin-section-title">Recent Signups</h2>
          <div className="gg-card" style={{ padding: 0, overflow: 'hidden' }}>
            {recentSignups.length > 0 ? (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Tier</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSignups.map((p: { id: string; display_name?: string; email: string; membership_tier: string; created_at: string }) => (
                    <tr key={p.id}>
                      <td>
                        <div>
                          <span style={{ fontWeight: 600, color: 'var(--text)' }}>
                            {p.display_name || '—'}
                          </span>
                          <br />
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {p.email}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`gg-pill ${p.membership_tier === 'vip' ? 'gg-pill--gold' : ''}`}
                          style={{ fontSize: '0.7rem' }}
                        >
                          {p.membership_tier.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {new Date(p.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No recent signups
              </div>
            )}
          </div>
          <Link
            href="/admin/members"
            className="gg-btn gg-btn--ghost gg-btn--sm"
            style={{ display: 'inline-block', marginTop: '0.75rem' }}
          >
            View All Members →
          </Link>
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="admin-section-title">Quick Actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <QuickAction
              href="/admin/members"
              label="Manage Members"
              description="View, search and update member roles and tiers"
            />
            <QuickAction
              href="/admin/artists"
              label="Manage Artists"
              description="Edit artist profiles and featured status"
            />
            <QuickAction
              href="/admin/events"
              label="Manage Events"
              description="Add or edit upcoming shows and events"
            />
            <QuickAction
              href="/studio"
              label="Open CMS Studio"
              description="Edit content in Sanity Studio"
            />
          </div>
        </section>
      </div>

      <style>{`
        .admin-section-title {
          font-family: var(--font-sans);
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: var(--text-muted);
          margin: 0 0 0.875rem;
        }
        .stat-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          transition: transform 0.2s;
        }
        .stat-card:hover {
          transform: translateY(-2px);
        }
        .stat-card--accent {
          border-color: rgba(255,193,7,0.3);
        }
        .stat-card__icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          background: rgba(255,193,7,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent);
          flex-shrink: 0;
        }
        .stat-card__content {
          display: flex;
          flex-direction: column;
        }
        .stat-card__value {
          font-family: var(--font-sans);
          font-size: 1.75rem;
          font-weight: 900;
          color: var(--text);
          line-height: 1;
        }
        .stat-card__label {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-top: 0.2rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .admin-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
        }
        .admin-table th {
          padding: 0.75rem 1.25rem;
          text-align: left;
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-muted);
          font-weight: 600;
          border-bottom: 1px solid var(--border);
          background: rgba(255,255,255,0.02);
        }
        .admin-table td {
          padding: 0.875rem 1.25rem;
          border-bottom: 1px solid var(--border);
          vertical-align: middle;
        }
        .admin-table tr:last-child td {
          border-bottom: none;
        }
        .admin-table tr:hover td {
          background: rgba(255,255,255,0.02);
        }
        .quick-action {
          display: flex;
          align-items: center;
          padding: 1rem 1.25rem;
          text-decoration: none;
          gap: 0.75rem;
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .quick-action:hover {
          transform: translateX(4px);
          box-shadow: 0 4px 16px rgba(255,193,7,0.08);
        }
        .quick-action__label {
          font-family: var(--font-sans);
          font-weight: 700;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--text);
          flex: 0 0 auto;
          min-width: 140px;
        }
        .quick-action__desc {
          font-size: 0.8rem;
          color: var(--text-muted);
          flex: 1;
        }
        .quick-action__arrow {
          color: var(--accent);
          flex-shrink: 0;
          transition: transform 0.15s;
        }
        .quick-action:hover .quick-action__arrow {
          transform: translateX(3px);
        }
      `}</style>
    </div>
  )
}
