'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Search, Shield, User } from 'lucide-react'

interface Member {
  id: string
  email: string
  display_name: string | null
  membership_tier: string
  membership_status: string
  role: string
  created_at: string
}

export default function MembersTable({ initialMembers }: { initialMembers: Member[] }) {
  const [members, setMembers] = useState<Member[]>(initialMembers)
  const [search, setSearch] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const handleRoleChange = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    setUpdatingId(userId)

    try {
      const response = await fetch(`/api/admin/members/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Failed to change user role.')

      setMembers((prev) =>
        prev.map((member) => member.id === userId ? payload.member : member)
      )
      toast.success(`User role updated to ${newRole}!`)
    } catch (err) {
      console.error(err)
      toast.error(err instanceof Error ? err.message : 'An error occurred.')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleTierChange = async (userId: string, newTier: string) => {
    setUpdatingId(userId)

    try {
      const response = await fetch(`/api/admin/members/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ membership_tier: newTier }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Failed to change subscription tier.')

      setMembers((prev) =>
        prev.map((member) => member.id === userId ? payload.member : member)
      )
      toast.success(`User membership tier updated to ${newTier}!`)
    } catch (err) {
      console.error(err)
      toast.error(err instanceof Error ? err.message : 'An error occurred.')
    } finally {
      setUpdatingId(null)
    }
  }

  const filteredMembers = useMemo(() => {
    if (!search.trim()) return members
    const q = search.toLowerCase()
    return members.filter(
      (m) =>
        m.email.toLowerCase().includes(q) ||
        (m.display_name && m.display_name.toLowerCase().includes(q))
    )
  }, [search, members])

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Search Input */}
      <div style={{ position: 'relative', maxWidth: 400 }}>
        <span style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex' }}>
          <Search size={18} />
        </span>
        <input
          type="search"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="gg-field"
          style={{ paddingLeft: '2.75rem', width: '100%' }}
          aria-label="Search members"
        />
      </div>

      {/* Table Card */}
      <div className="gg-card table-card" style={{ padding: 0, overflowX: 'auto' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Status</th>
              <th>Membership Tier</th>
              <th>Role</th>
              <th>Joined Date</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member) => (
                <tr key={member.id} className={updatingId === member.id ? 'row-updating' : ''}>
                  <td>
                    <div>
                      <p className="tbl-title">{member.display_name || member.email.split('@')[0]}</p>
                      <p className="tbl-subtitle">{member.email}</p>
                    </div>
                  </td>
                  <td>
                    <span className={`status-pill ${member.membership_status === 'active' ? 'status-pill--active' : ''}`}>
                      {member.membership_status}
                    </span>
                  </td>
                  <td>
                    <select
                      value={member.membership_tier}
                      onChange={(e) => handleTierChange(member.id, e.target.value)}
                      disabled={updatingId === member.id}
                      className="admin-select"
                      aria-label="Change membership tier"
                    >
                      <option value="free">Free</option>
                      <option value="glo-fan">Glo Fan</option>
                      <option value="glogangvip">GloGang VIP</option>
                    </select>
                  </td>
                  <td>
                    <span className={`role-badge ${member.role === 'admin' ? 'role-badge--admin' : ''}`}>
                      {member.role === 'admin' ? <Shield size={12} /> : <User size={12} />}
                      {member.role}
                    </span>
                  </td>
                  <td>{formatDate(member.created_at)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => handleRoleChange(member.id, member.role)}
                      disabled={updatingId === member.id}
                      className="gg-btn gg-btn--ghost gg-btn--sm"
                    >
                      Toggle Role
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No members found matching &ldquo;{search}&rdquo;
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
          font-size: 0.9rem;
          color: var(--text);
        }
        .admin-table tr:last-child td {
          border-bottom: none;
        }
        .admin-table tr:hover td {
          background: rgba(255, 255, 255, 0.02);
        }
        .tbl-title {
          font-weight: 700;
          margin: 0;
          color: var(--text);
        }
        .tbl-subtitle {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin: 0.15rem 0 0;
        }
        .status-pill {
          display: inline-block;
          font-size: 0.7rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border);
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
        }
        .status-pill--active {
          color: #2ecc71;
          background: rgba(46, 204, 113, 0.1);
          border-color: #2ecc71;
        }
        .admin-select {
          background: var(--bg);
          border: 1px solid var(--border);
          color: var(--text);
          font-size: 0.85rem;
          font-weight: 500;
          padding: 0.35rem 0.75rem;
          border-radius: 6px;
          outline: none;
          cursor: pointer;
        }
        .admin-select:focus {
          border-color: var(--accent);
        }
        .role-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: capitalize;
          color: var(--text-muted);
        }
        .role-badge--admin {
          color: var(--accent);
        }
        .row-updating {
          opacity: 0.5;
          pointer-events: none;
        }
      `}</style>
    </div>
  )
}
