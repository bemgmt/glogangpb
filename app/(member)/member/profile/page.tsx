import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import ProfileForm from './ProfileForm'

export const metadata: Metadata = {
  title: 'Edit Profile | Glo Gang',
  description: 'Manage your fan profile and account settings.',
}

export default async function ProfilePage() {
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
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    // If profile doesn't exist, create one
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email!,
        display_name: user.email!.split('@')[0],
      })
      .select()
      .single()

    if (createError || !newProfile) {
      return (
        <div className="gg-container" style={{ padding: '4rem 0', textCombineUpright: 'center' }}>
          <p style={{ color: 'var(--accent)' }}>Failed to load profile. Please try logging in again.</p>
        </div>
      )
    }

    return (
      <div className="gg-container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>
        <ProfileForm profile={newProfile} />
      </div>
    )
  }

  return (
    <div className="gg-container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>
      <ProfileForm profile={profile} />
    </div>
  )
}
