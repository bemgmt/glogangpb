import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { Calendar, Shield, Award, Users } from 'lucide-react'
import MembersTable from './MembersTable'

export const metadata: Metadata = {
  title: 'Manage Members | Glo Gang Admin',
  description: 'Manage users, permissions, and subscription levels.',
}

export default async function AdminMembersPage() {
  const supabase = await createClient()

  // 1. Double check authentication and admin role
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect('/member/dashboard')
  }

  // 2. Fetch all profiles from Supabase
  const { data: members, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[admin-members] Fetch error:', error.message)
  }

  return (
    <div style={{ padding: '2rem' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <p className="gg-pill gg-pill--gold" style={{ marginBottom: '0.75rem' }}>
          CONTROL PANEL
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
          Manage Members
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          Overview of registered fan profiles, tier status, and roles. Update member roles or membership tiers.
        </p>
      </header>

      <hr className="gg-divider" style={{ marginBottom: '2.5rem' }} />

      <MembersTable initialMembers={members || []} />
    </div>
  )
}
