import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Check admin role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile || profile.role !== 'admin') {
    redirect('/member/dashboard')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Admin Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <span className="gg-pill gg-pill--gold" style={{ fontSize: '0.65rem' }}>
            ADMIN
          </span>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 900,
              fontSize: '1.1rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--text)',
              margin: '0.5rem 0 0',
            }}
          >
            Plug HQ
          </p>
        </div>

        <nav className="admin-sidebar__nav" aria-label="Admin navigation">
          <a href="/admin" className="admin-nav-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
            </svg>
            Overview
          </a>
          <a href="/admin/members" className="admin-nav-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Members
          </a>
          <a href="/admin/artists" className="admin-nav-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
            </svg>
            Artists
          </a>
          <a href="/admin/events" className="admin-nav-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Events
          </a>
          <a href="/admin/burn-requests" className="admin-nav-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M17.5 19c-2.5 0-4-2-4-4s1.5-4 4-4 4 2 4 4-1.5 4-4 4z" />
              <path d="M6.5 19c-2.5 0-4-2-4-4s1.5-4 4-4 4 2 4 4-1.5 4-4 4z" />
              <path d="M12 11c-2.5 0-4-2-4-4s1.5-4 4-4 4 2 4 4-1.5 4-4 4z" />
            </svg>
            Burn Requests
          </a>
          <a href="/admin/subscriptions" className="admin-nav-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="2" y="5" width="20" height="14" rx="2" ry="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
            Subscriptions
          </a>
          <a href="/studio" className="admin-nav-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            CMS Studio
          </a>

          <hr className="gg-divider" style={{ margin: '1rem 0' }} />

          <a href="/member/dashboard" className="admin-nav-link" style={{ color: 'var(--text-muted)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Member Portal
          </a>
        </nav>
      </aside>

      {/* Main content */}
      <div className="admin-main">
        {children}
      </div>

      <style>{`
        .admin-sidebar {
          width: 240px;
          flex-shrink: 0;
          background: var(--panel);
          border-right: 1px solid var(--border);
          padding: 1.5rem 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          position: sticky;
          top: 0;
          height: 100vh;
          overflow-y: auto;
        }
        .admin-sidebar__brand {
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border);
        }
        .admin-sidebar__nav {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .admin-nav-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.65rem 0.875rem;
          border-radius: 8px;
          color: var(--text-muted);
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          letter-spacing: 0.02em;
          transition: background 0.15s, color 0.15s;
        }
        .admin-nav-link:hover {
          background: rgba(255,255,255,0.05);
          color: var(--text);
        }
        .admin-main {
          flex: 1;
          padding: 2rem 2.5rem;
          overflow-y: auto;
        }
        @media (max-width: 768px) {
          .admin-sidebar {
            display: none;
          }
          .admin-main {
            padding: 1.5rem 1rem;
          }
        }
      `}</style>
    </div>
  )
}
