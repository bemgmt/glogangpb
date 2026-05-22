import { createClient } from '@/lib/supabase/server'

export default async function SubscriptionsAdmin() {
  const supabase = await createClient()

  // We fetch users grouped by subscription_status to show an overview
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, email, current_tier, subscription_status, lifetime_spend')
    .order('created_at', { ascending: false })

  if (error) {
    return <div>Error loading profiles: {error.message}</div>
  }

  const activeSubs = profiles.filter(p => p.subscription_status?.startsWith('active'))
  const frontline = profiles.filter(p => p.current_tier === 'frontline')
  const gloryCircle = profiles.filter(p => p.current_tier === 'glory_circle')

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>Subscription & Tiers Overview</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>
        Manage active subscriptions and tier statuses. Actual billing is managed via the Stripe Dashboard or API integrations.
      </p>

      <div className="gg-grid-3" style={{ marginBottom: 40 }}>
        <div className="gg-card">
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Total Active Subs</div>
          <div style={{ fontSize: 32, fontWeight: 900 }}>{activeSubs.length}</div>
        </div>
        <div className="gg-card">
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 8 }}>Frontline Members</div>
          <div style={{ fontSize: 32, fontWeight: 900 }}>{frontline.length}</div>
        </div>
        <div className="gg-card">
          <div style={{ fontSize: 12, fontWeight: 700, color: '#a855f7', textTransform: 'uppercase', marginBottom: 8 }}>Glory Circle VIPs</div>
          <div style={{ fontSize: 32, fontWeight: 900 }}>{gloryCircle.length}</div>
        </div>
      </div>

      <h2>Recent Member Profiles</h2>
      <div style={{ marginTop: 16 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '12px 8px' }}>Email</th>
              <th style={{ padding: '12px 8px' }}>Tier</th>
              <th style={{ padding: '12px 8px' }}>Sub Status</th>
              <th style={{ padding: '12px 8px', textAlign: 'right' }}>Lifetime Spend</th>
            </tr>
          </thead>
          <tbody>
            {profiles.slice(0, 20).map((p: any) => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '12px 8px' }}>{p.email}</td>
                <td style={{ padding: '12px 8px' }}>
                  <span className="gg-pill" style={{ 
                    background: p.current_tier === 'glory_circle' ? 'rgba(168,85,247,0.1)' : p.current_tier === 'frontline' ? 'rgba(59,130,246,0.1)' : 'var(--surface-raised)',
                    color: p.current_tier === 'glory_circle' ? '#c084fc' : p.current_tier === 'frontline' ? '#60a5fa' : 'var(--text-muted)',
                  }}>
                    {p.current_tier.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '12px 8px' }}>{p.subscription_status}</td>
                <td style={{ padding: '12px 8px', textAlign: 'right' }}>${p.lifetime_spend || '0.00'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
