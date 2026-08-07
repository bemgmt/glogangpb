import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { Camera, Calendar, User, LayoutGrid } from 'lucide-react'
import { KioskPassIssuer } from '@/components/admin/KioskPassIssuer'

export const metadata: Metadata = {
  title: 'Photobooth Logs | Glo Gang Admin',
  description: 'Moderate captured photobooth sessions and kiosk logs.',
}

export default async function AdminPhotoboothPage() {
  const supabase = await createClient()

  // 1. Guard access
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') redirect('/member/dashboard')

  // 2. Fetch photobooth sessions joining profiles details
  const { data: sessions, error } = await supabase
    .from('photobooth_sessions')
    .select(`
      id,
      session_type,
      photo_count,
      created_at,
      user_id,
      profiles (
        display_name,
        email
      )
    `)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('[admin-photobooth] Fetch error:', error.message)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  return (
    <div style={{ padding: '2rem' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <p className="gg-pill gg-pill--gold" style={{ marginBottom: '0.75rem' }}>
          PHOTO BOOTH
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '2.25rem',
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: 'var(--text)',
            margin: 0,
          }}
        >
          Photobooth Sessions
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          Review interactive photobooth sessions, kiosk interactions, and check user activities.
        </p>
      </header>

      <hr className="gg-divider" style={{ marginBottom: '2.5rem' }} />

      <KioskPassIssuer />

      {/* Grid Overview Cards */}
      <div className="gg-grid-3" style={{ marginBottom: '2rem' }}>
        <div className="gg-card stat-box">
          <div className="stat-box__icon"><Camera size={20} /></div>
          <div>
            <h2 className="stat-box__title">
              {sessions?.filter(s => s.session_type === 'member').length || 0}
            </h2>
            <p className="stat-box__desc">Member Sessions (Last 50)</p>
          </div>
        </div>
        <div className="gg-card stat-box">
          <div className="stat-box__icon"><LayoutGrid size={20} /></div>
          <div>
            <h2 className="stat-box__title">
              {sessions?.filter(s => s.session_type === 'kiosk').length || 0}
            </h2>
            <p className="stat-box__desc">In-Store Kiosk Sessions (Last 50)</p>
          </div>
        </div>
        <div className="gg-card stat-box">
          <div className="stat-box__icon"><User size={20} /></div>
          <div>
            <h2 className="stat-box__title">
              {sessions?.reduce((sum, s) => sum + s.photo_count, 0) || 0}
            </h2>
            <p className="stat-box__desc">Total Captures (Last 50 sessions)</p>
          </div>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="gg-card table-card" style={{ padding: 0 }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Session ID</th>
              <th>User / Source</th>
              <th>Session Type</th>
              <th>Photos Captured</th>
              <th>Date & Time</th>
            </tr>
          </thead>
          <tbody>
            {sessions && sessions.length > 0 ? (
              sessions.map((session) => {
                const sessionUser = session.profiles as any
                const nameDisplay = sessionUser?.display_name || sessionUser?.email?.split('@')[0] || 'Anonymous'
                const emailDisplay = sessionUser?.email || 'In-Store Kiosk'

                return (
                  <tr key={session.id}>
                    <td>
                      <code style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>
                        {session.id.slice(0, 8)}...
                      </code>
                    </td>
                    <td>
                      <div>
                        <p className="tbl-title">{nameDisplay}</p>
                        <p className="tbl-subtitle">{emailDisplay}</p>
                      </div>
                    </td>
                    <td>
                      <span className={`session-type-pill session-type-pill--${session.session_type}`}>
                        {session.session_type}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700 }}>{session.photo_count} photo{session.photo_count !== 1 ? 's' : ''}</span>
                    </td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        <Calendar size={12} /> {formatDate(session.created_at)}
                      </span>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No photobooth session logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <style>{`
        .admin-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .admin-table th {
          font-family: var(--font-sans);
          font-weight: 900;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-muted);
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--border);
        }
        .admin-table td {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--border);
          vertical-align: middle;
          color: var(--text);
        }
        .admin-table tr:last-child td {
          border-bottom: none;
        }
        .tbl-title {
          font-weight: 700;
          margin: 0;
        }
        .tbl-subtitle {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin: 0.15rem 0 0;
        }
        .session-type-pill {
          display: inline-block;
          font-size: 0.7rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          border: 1px solid var(--border);
        }
        .session-type-pill--member {
          color: var(--accent);
          background: rgba(255, 209, 0, 0.1);
          border-color: var(--accent);
        }
        .session-type-pill--kiosk {
          color: #a78bfa;
          background: rgba(167, 139, 250, 0.1);
          border-color: #a78bfa;
        }
        .stat-box {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          background: var(--panel);
          border: 1px solid var(--border);
          padding: 1.5rem;
        }
        .stat-box__icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          background: rgba(255, 209, 0, 0.1);
          color: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .stat-box__title {
          font-family: var(--font-sans);
          font-size: 1.5rem;
          font-weight: 900;
          margin: 0;
          color: var(--text);
        }
        .stat-box__desc {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin: 0.15rem 0 0;
        }
      `}</style>
    </div>
  )
}
